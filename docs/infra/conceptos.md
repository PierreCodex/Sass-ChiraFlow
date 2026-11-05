# Conceptos de infraestructura — glosario para aprender

Lo que va apareciendo al montar tivu en **Cloudflare + VPS de Contabo +
Coolify**, explicado en corto y con el ejemplo de este proyecto. Se amplía a
medida que se avanza. La guía paso a paso está en
[`cloudflare-dns.md`](cloudflare-dns.md).

---

## Dominios y DNS

**Registrador.** Donde se compra y se renueva el dominio: **Donweb**. Solo
dice *quién* manda en el DNS del dominio (los nameservers).

**DNS.** La agenda de internet: traduce `app.tivuapp.com` a la IP de un
servidor. Lo gestiona **Cloudflare**.

**Nameservers (NS).** Los servidores que guardan esa agenda. Cambiarlos en
Donweb por los de Cloudflare es "mudar el DNS": desde entonces, lo que se
edita en Cloudflare es lo que vale.

**Zona DNS.** La lista de registros de un dominio. La de Donweb estaba vacía,
por eso no hubo nada que importar.

**Registros:**

| Tipo | Qué dice | Ejemplo en tivu |
|---|---|---|
| **A** | este nombre está en esta IPv4 | `app` → IP del VPS |
| **AAAA** | lo mismo, en IPv6 | no se usa por ahora |
| **CNAME** | este nombre es un alias de otro | `www` podría ser alias de `tivuapp.com` |
| **MX** | a qué servidor se entrega el correo | Email Routing en la raíz de `tivuapp.com` |
| **TXT** | texto libre; se usa para verificar y para el correo | SPF, DKIM, DMARC |

**`@`.** El dominio raíz (`tivuapp.com` a secas).

**Comodín `*`.** Un registro que vale para cualquier subdominio sin crearlo
uno a uno: `*.tivuapp.store` cubre `pepito.`, `luna.`… todas las tiendas.

**TTL.** Cuánto tiempo pueden recordar otros la respuesta antes de volver a
preguntar. En "Auto" lo decide Cloudflare.

**Propagación.** El rato (minutos a horas) que tarda internet en enterarse de
un cambio de nameservers. Por eso el dominio tardó en salir **Active**.

**DNSSEC.** Firma las respuestas del DNS. Si está activo al cambiar de
nameservers, el dominio deja de resolver: se apaga antes y se reactiva
después desde Cloudflare si se quiere.

## Cloudflare como intermediario

**Proxy (nube naranja).** El visitante habla con Cloudflare, y Cloudflare con
tu servidor. La IP real queda oculta y se ganan caché, protección DDoS y
reglas. Con la **nube gris** ("DNS only") Cloudflare solo responde la
dirección y el tráfico va directo al servidor: es lo obligado para MX y TXT.

**Origen.** Tu servidor, el que está detrás de Cloudflare (el VPS).

**Borde (edge).** Los servidores de Cloudflare repartidos por el mundo, que
son los que ve el visitante.

**CDN y caché.** Cloudflare guarda copias de archivos estáticos (imágenes,
JS) cerca del visitante, y el servidor trabaja menos.

**Bot Fight Mode.** Desafía a bots conocidos. Se dejó **apagado**: también
bloquearía los webhooks de Resend o WhatsApp, y en el plan gratis no admite
excepciones.

**WAF.** Firewall de aplicaciones web: reglas que bloquean peticiones
sospechosas antes de que lleguen al servidor. El plan gratis trae 5.

## HTTPS y certificados

**Certificado TLS/SSL.** Lo que permite el candado: cifra la conexión y
prueba que el servidor es quien dice ser.

**Dos tramos.** Con proxy hay dos conexiones cifradas distintas:

```
visitante ──(1)──> Cloudflare ──(2)──> VPS
```

- (1) usa el **certificado de borde (universal)**: lo pone Cloudflare gratis.
  Cubre la raíz y **un** nivel de comodín (`pepito.tivuapp.store` sí,
  `a.b.tivuapp.store` no). Por eso las tiendas son `{slug}.tivuapp.store`.
- (2) usa el **certificado de origen**: lo emite Cloudflare y se instala en
  el VPS. Solo Cloudflare confía en él (por eso dura 15 años y por eso sin la
  nube naranja el navegador lo rechazaría).

**Modos SSL:**

| Modo | Tramo 2 | Veredicto |
|---|---|---|
| Flexible | sin cifrar | inseguro y causa bucles de redirección |
| Full | cifrado, sin comprobar el certificado | mejor, pero aceptaría uno falso |
| **Full (strict)** | cifrado **y** comprobado | el que se usa |

**Clave privada.** La mitad secreta del certificado. Quien la tenga puede
hacerse pasar por tu servidor: va en el gestor de contraseñas y en el VPS,
nunca en el repo ni en un chat.

**PEM.** El formato de texto de certificados y claves: bloques entre
`-----BEGIN …-----` y `-----END …-----`.

**HSTS.** Le dice al navegador "aquí, solo HTTPS, durante meses". Es difícil
de deshacer: se activa al final, cuando todo funcione.

**Errores típicos de Cloudflare:** **521** el servidor rechaza la conexión;
**522** no responde; **525/526** falla el cifrado del tramo 2 (certificado de
origen mal puesto).

## El servidor

**VPS.** Un servidor virtual alquilado (Contabo): una máquina Linux entera
para ti.

**SSH.** La forma segura de entrar a su terminal (con **Bitvise**). Mejor con
**llave** que con contraseña.

**Puerto.** Cada servicio escucha en una "puerta" numerada: 22 SSH, 80 HTTP,
443 HTTPS, 8000 el panel de Coolify.

**Coolify.** Panel que despliega las apps (Next, Laravel) en contenedores
Docker. Su login da control total del servidor.

**Docker / contenedor.** Cada app corre aislada en su "caja", con lo que
necesita dentro.

**Proxy inverso (Traefik).** El portero del VPS: recibe todo en el 80/443 y,
según el nombre pedido (`app.`, `api.`, `coolify.`), lo pasa al contenedor
que toca. También es quien presenta el certificado de origen.

**Configuración dinámica de Traefik.** Archivos que Traefik relee sin
reiniciar. `cloudflare-origin.yaml` le dice dónde están los certificados.

## Seguridad

**Defensa en capas.** Varias protecciones independientes: el atacante tiene
que romperlas **todas**; a ti te basta con que aguante **una**.

| Capa | Qué para |
|---|---|
| Contraseña fuerte | lo básico |
| **2FA** | que te roben la contraseña |
| **Cloudflare Access** | que alguien llegue siquiera al login del panel |
| **Firewall** | que se salten Cloudflare entrando por la IP |

**Superficie de ataque.** Todo lo que queda a la vista de internet. Regla: lo
que es solo para ti no debería estar expuesto, aunque tenga contraseña.

**Cloudflare Access (Zero Trust).** Pide identificarse (un código al correo)
**antes** de dejar ver una web. Delante de `coolify.tivuapp.com`.

**Firewall.** Decide qué conexiones entran al servidor y desde dónde. En tivu:
SSH para ti, 80/443 solo desde las IPs de Cloudflare, el resto cerrado.

**Docker se salta `ufw`.** Los puertos que publica Docker se abren por debajo
del firewall habitual de Ubuntu. Cerrar el 8000 con `ufw` no basta.

**Webhook.** Un servicio externo que *llama* a tu servidor para avisar de
algo (Resend: un correo rebotó; GitHub: hay código nuevo). Las protecciones
tienen que dejarlos pasar.

**Política de Access.** La regla de quién pasa. **Allow** deja entrar a quien
cumpla; todo lo demás queda fuera porque Access es *default-deny* (todo
prohibido salvo lo permitido). Dentro: **Include** (basta con cumplir una),
**Require** (hay que cumplir además esta) y **Exclude** (fuera aunque cumpla
lo demás). La de Coolify es "Include → Emails → tivusass@gmail.com".

**One-time PIN.** El método de identificarse en Access: un código de un solo
uso que llega al correo. No hay contraseña que robar.

**Llave SSH.** Un par de archivos: la parte **privada** se queda en tu PC (en
Bitvise, "Global 1") y la **pública** va en `~/.ssh/authorized_keys` del
servidor. El servidor reta a tu PC a firmar algo que solo la privada puede
firmar. Con **passphrase**, robar el archivo no basta.

**`PermitRootLogin prohibit-password`.** root puede entrar, pero **solo con
llave**. Coolify entra así a su propio servidor; por eso no se prohíbe root
del todo.

**ufw.** El firewall sencillo de Ubuntu ("uncomplicated firewall"). Filtra lo
que va a programas del propio Linux, como el SSH.

**iptables y cadenas.** Lo que hay debajo de ufw: listas de reglas
("cadenas") que el kernel recorre en orden; la primera que encaja decide.
**ACCEPT** deja pasar, **DROP** descarta en silencio (el otro lado se queda
esperando), **RETURN** vuelve a la cadena anterior.

**DOCKER-USER.** La cadena que Docker reserva para reglas propias y que
revisa **antes** de dejar llegar tráfico a un contenedor. Es donde se filtran
los puertos de Docker, ya que `ufw` no los ve. En tivu deja el 80/443 solo a
Cloudflare (subcadena `TIVU-CF`) y descarta el resto.

**conntrack (estado de la conexión).** El kernel recuerda las conexiones
abiertas. "ESTABLISHED" = respuesta a algo ya permitido: se deja pasar
siempre, si no, ni los contenedores podrían recibir respuestas de internet.

**Red de seguridad.** Al tocar un firewall por SSH uno puede dejarse fuera.
Se programa antes un "deshacer" automático (`systemd-run --on-active=10min
… ufw disable`) y se cancela solo cuando se comprueba que todo sigue
funcionando. Y siempre se prueba desde una **segunda** sesión sin cerrar la
primera.

## Correo

**Email Routing.** Cloudflare recibe en `soporte@tivuapp.com` y lo reenvía a
Gmail. Solo recibe: no envía ni guarda.

**Correo transaccional.** El que manda la app por algo que hizo el usuario:
verificación, reserva confirmada. Lo envía **Resend**.

**SPF.** Lista (en un TXT) de los servidores autorizados a enviar por tu
dominio.

**DKIM.** Firma criptográfica en cada correo; la clave pública va en un TXT.

**DMARC.** Qué hacer con un correo que falla SPF/DKIM: `none` (solo
informar), `quarantine` (a spam), `reject` (rechazar).

**Null MX.** Un MX `.`: "este dominio no recibe correo". Junto a `-all` y
`p=reject`, impide falsificar correos de `tivuapp.store`.
