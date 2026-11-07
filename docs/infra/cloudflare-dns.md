# Dominios en Cloudflare — guía paso a paso

> Decidido el 2026-11-03: **un VPS de Contabo con Coolify**, **Cloudflare (plan
> gratis)** para el DNS y el HTTPS, y **Donweb solo como registrador** (ahí se
> compran y renuevan los dominios).

| Dirección | Para qué |
|---|---|
| `tivuapp.com` | landing del SaaS: presentación, precios y registro |
| `app.tivuapp.com` | panel de los negocios |
| `{slug}.tivuapp.store` | tienda pública de cada negocio |
| `reservas.pepito.com` | dominio propio opcional del negocio (plan Pro, más adelante) |

---

## Parte 1 — Sin VPS todavía: pasar los dominios a Cloudflare

### 1. Revisar Donweb antes de tocar nada

Por cada dominio (`tivuapp.com` y `tivuapp.store`):

- **¿Hay correo en Donweb** (p. ej. `hola@tivuapp.com`)? Anotar los registros
  **MX** y **TXT**: hay que conservarlos al mudar el DNS. Si no hay, el correo
  se monta de cero en la **Parte 3**.
- **¿DNSSEC activado?** Desactivarlo **antes** y esperar unas horas. Cambiar
  los nameservers con DNSSEC activo deja el dominio sin resolver.

### 2. Crear la cuenta y añadir los dominios

1. Registrarse en **dash.cloudflare.com**.
2. **Add a domain** → `tivuapp.com` → plan **Free**.
3. Cloudflare escanea los registros existentes. **Revisar la lista**: dejar el
   correo (MX/TXT) si se usa; borrar lo que apunte al hosting de Donweb.
4. Copiar los **dos nameservers** que asigna (`xxx.ns.cloudflare.com`,
   `yyy.ns.cloudflare.com`).
5. Repetir con `tivuapp.store` (puede dar los mismos u otros: usar los de cada
   dominio).

### 3. Cambiar los nameservers en Donweb

Donweb → dominio → **Servidores DNS / Nameservers** → personalizados → quitar
los de Donweb y poner los dos de Cloudflare. Lo mismo con el otro dominio.

Tarda de minutos a 24 h. Cloudflare avisa por correo cuando queda **Active**.

### 4. Ajustes de seguridad (en cada dominio)

- **SSL/TLS → Overview → «Full (strict)».** Evita los bucles de redirección.
  Mientras no haya VPS no hay nada detrás: es normal.
- **SSL/TLS → Edge Certificates:**
  - **Always Use HTTPS:** activado.
  - **Minimum TLS Version:** 1.2.
  - **Automatic HTTPS Rewrites:** activado.
  - **HSTS: todavía no.** Es difícil de deshacer; se activa cuando todo funcione.

---

## Parte 2 — Con el VPS (y su IP)

### 5. Registros DNS

Todos **A** a la IP del VPS, con la **nube naranja (Proxied)**:

| Dominio | Nombre | Para qué |
|---|---|---|
| tivuapp.com | `@` | landing |
| tivuapp.com | `app` | panel |
| tivuapp.com | `www` | redirige a la raíz (o CNAME a `tivuapp.com`) |
| tivuapp.com | `api` | Laravel: webhooks (Resend, WhatsApp) y, hasta la Story 5.2, las imágenes públicas |
| tivuapp.com | `admin` | panel de la plataforma (más adelante) |
| tivuapp.store | `@` | portada de tiendas o redirección |
| tivuapp.store | `*` | **todas las tiendas**, sin crear nada por negocio |

- **`api` existe para lo que no pasa por el BFF**: los webhooks de servicios
  externos (rebotes de Resend, mensajes del proveedor de WhatsApp) y, hasta la
  Story 5.2, las imágenes públicas (`/api/archivos/…`), que el navegador pide
  directamente. El resto del panel y de la tienda **no** lo usan: el BFF de
  Next le habla a Laravel por la red interna de Coolify.
- El panel de **Coolify**: `coolify.tivuapp.com` o túnel SSH. Nunca el puerto
  8000 abierto.

### 6. Certificado de origen (HTTPS entre Cloudflare y el VPS)

En cada dominio: **SSL/TLS → Origin Server → Create Certificate**.

- `tivuapp.store`: nombres `tivuapp.store` y `*.tivuapp.store`.
- `tivuapp.com`: nombres `tivuapp.com` y `*.tivuapp.com`.
- Validez: 15 años.
- **La clave privada se muestra una sola vez.** Guardarla en un gestor de
  contraseñas, **nunca en el repo**. Se carga en Coolify.

El certificado de borde gratuito de Cloudflare cubre **un nivel** de comodín
(`pepito.tivuapp.store` sí, `a.b.tivuapp.store` no): por eso las tiendas van
en `{slug}.tivuapp.store` y no en `{slug}.site.…`.

### 7. Comprobar

- `nslookup app.tivuapp.com` devuelve IPs de **Cloudflare**, no la del VPS.
- `https://lo-que-sea.tivuapp.store` abre con candado (aunque sea la página de
  negocio no encontrado).

### 8. Coolify detrás de Cloudflare (hecho el 2026-11-05)

**Certificados en Traefik.** Los cuatro archivos PEM van en el VPS, en
`/data/coolify/proxy/certs/` (`tivuapp.com.cert/.key`,
`tivuapp.store.cert/.key`, las claves con `chmod 600`). En Coolify, **Servers
→ localhost → Proxy → Dynamic Configurations → Add**, archivo
`cloudflare-origin.yaml`:

```yaml
tls:
  certificates:
    - certFile: /traefik/certs/tivuapp.com.cert
      keyFile: /traefik/certs/tivuapp.com.key
    - certFile: /traefik/certs/tivuapp.store.cert
      keyFile: /traefik/certs/tivuapp.store.key
```

La ruta es `/traefik/…`: así se ve esa carpeta desde dentro del contenedor.

**Dominio del panel.** **Settings → General → URL** =
`https://coolify.tivuapp.com`. No confundir con el *Wildcard domain* del
servidor, que se deja vacío.

### 9. Asegurar el servidor (hecho el 2026-11-05)

**2FA en Coolify.** Profile → Two-factor authentication; códigos de
recuperación en el gestor de contraseñas.

**Cloudflare Access delante del panel.** Zero Trust (plan Free) → Access
controls → Applications → Self-hosted → Public DNS:

- Destino `coolify.tivuapp.com`, sesión de 24 h, login con **One-time PIN**.
- Política **Solo yo**: Allow, Include → Emails → `tivusass@gmail.com`.
- Recién creada puede dar "Unable to find your Access application" unos
  minutos.
- Pendiente: al conectar GitHub para desplegar, una política **Bypass** para
  la ruta de webhooks de Coolify.

**SSH solo con llave.** En `/etc/ssh/sshd_config.d/00-solo-llave.conf`:

```
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin prohibit-password
```

`root` sigue entrando **con llave**: Coolify lo necesita. En
`~/.ssh/authorized_keys` de root está también la llave de Coolify: no
borrarla. Comprobar con `sshd -T | grep -E 'passwordauth|permitroot'`.

**Firewall: dos capas.**

| Entrada | La filtra | Regla |
|---|---|---|
| SSH (proceso de Linux) | `ufw` | solo el 22 |
| Lo publicado por Docker: Traefik 80/443, Coolify 8000/6001/6002 | cadena `DOCKER-USER` (Docker se salta `ufw`) | 80/443 solo desde Cloudflare; el resto, DROP |

```bash
# Red de seguridad: si algo sale mal, ufw se apaga solo a los 10 min
systemd-run --on-active=10min --unit=tivu-rescate /usr/sbin/ufw disable

ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp

# Reglas de Docker, con la lista oficial de Cloudflare (15 rangos)
cp /etc/ufw/after.rules /etc/ufw/after.rules.bak
{
echo ""
echo "# BEGIN tivu-docker"
echo "*filter"
echo ":DOCKER-USER - [0:0]"
echo ":TIVU-CF - [0:0]"
echo "-A DOCKER-USER -m conntrack --ctstate RELATED,ESTABLISHED -j RETURN"
echo "-A DOCKER-USER ! -i eth0 -j RETURN"
echo "-A DOCKER-USER -p tcp -m conntrack --ctorigdstport 80 -j TIVU-CF"
echo "-A DOCKER-USER -p tcp -m conntrack --ctorigdstport 443 -j TIVU-CF"
echo "-A DOCKER-USER -j DROP"
curl -fsS https://www.cloudflare.com/ips-v4 | while read -r red || [ -n "$red" ]; do [ -n "$red" ] && echo "-A TIVU-CF -s $red -j ACCEPT"; done
echo "-A TIVU-CF -j DROP"
echo "COMMIT"
echo "# END tivu-docker"
} >> /etc/ufw/after.rules
grep -c 'TIVU-CF -s' /etc/ufw/after.rules   # debe dar 15

ufw --force enable        # en Bitvise, «y» a mano da «Aborted»
iptables -S DOCKER-USER

# Probado (segunda sesión SSH, coolify.tivuapp.com, IP:8000 que no carga):
systemctl stop tivu-rescate.timer
```

- `eth0` es la tarjeta de red del VPS (`ip -br link`).
- `--ctorigdstport` mira el puerto **original**: tras la redirección de
  Docker, el 8000 llega al contenedor como 8080.
- **Si Cloudflare cambia sus IPs** (raro; se anuncia), borrar el bloque
  `tivu-docker` de `after.rules`, repetir el bloque y `ufw reload`.
- Una app nueva en Coolify **no publica puertos**: va por Traefik con su
  dominio. Si alguna publicara uno, quedaría cerrado por el `DROP`.

### 10. Después

- Activar HSTS cuando todo funcione.
- Dominios propios de los negocios: **Cloudflare for SaaS** (confirmar precios
  y límites en su documentación vigente antes de comprometerlo en el plan Pro).

---

## Parte 3 — Correo (sin pagar Google Workspace)

> Decidido el 2026-11-05. Cada pieza hace una sola cosa:
>
> | Pieza | Qué hace |
> |---|---|
> | **Cloudflare Email Routing** | **recibe** en `soporte@`, `contacto@`… y reenvía |
> | **Gmail** (`tivusass@gmail.com`) | la bandeja donde se leen y se responden |
> | **Resend** | **envía**: los correos del backend y las respuestas desde Gmail |
>
> Si un día se contrata Workspace, se cambian los MX y nada más: Resend y el
> backend no se tocan.

Requisito: `tivuapp.com` ya en **Active** (Parte 1). No hace falta el VPS.

Todos los registros de esta parte van en **DNS only (nube gris)**: MX y TXT
no se pueden proxiar.

### 11. Recibir: Email Routing (hecho el 2026-11-05)

Cuenta → **Compute → Email Service → Email Routing → Onboard Domain** →
`tivuapp.com`. No tocar **Email Sending (Beta)**: el envío es de Resend.

1. **Verify DNS records → Activate.** Cloudflare crea solo, y bloquea
   (*Locked*), tres **MX** `route1/2/3.mx.cloudflare.net` y un **SPF** en la
   raíz, más un TXT `cf2024-1._domainkey` (su DKIM para lo que reenvía). No
   duplicarlos a mano.
2. **Destination addresses:** añadir `tivusass@gmail.com` y abrir el enlace
   de verificación que llega a esa bandeja, hasta que salga *Verified*.
3. **Routing rules → Create routing rule:** pattern `soporte`, dominio
   `tivuapp.com`, *Send to an email* → `tivusass@gmail.com`. Lo mismo con
   `contacto`. Catch-all **desactivado** (*Drop*): solo atrae spam.

Comprobar: escribir a `soporte@tivuapp.com` desde otra cuenta y ver que llega
a Gmail.

### 12. Enviar: verificar el dominio en Resend (hecho el 2026-11-05)

1. Entrar en **resend.com** con `tivusass@gmail.com` → **Domains → Add
   Domain** → `tivuapp.com`. Región: **São Paulo (sa-east-1)**, la más
   cercana. No se cambia sin borrar el dominio.
2. **Manual setup** primero, para ver la lista. **Enable receiving
   apagado**: encendido pediría un MX en la raíz y rompería Email Routing.
   Los registros de Resend:

   | Tipo | Nombre | Para qué |
   |---|---|---|
   | TXT | `resend._domainkey` | firma DKIM |
   | CNAME | `rsend` | envío (Resend Forge) |
   | CNAME | `send` | rebotes y SPF de Resend |
   | TXT | `_dmarc` | opcional: ver paso 13 |

   Ninguno va en la raíz, así que **no chocan** con Email Routing. Los CNAME
   en **DNS only** (nube gris): proxiados, la verificación falla.
3. Con recibir apagado, **Auto configure** (entra a Cloudflare con Domain
   Connect) los crea sin errores de copia. No creó el `_dmarc`.
4. Esperar a **Verified** (fueron 4 minutos). Hasta entonces, Resend solo
   entrega a la dirección dueña de la cuenta.
4. **API Keys:** crear **dos**, con permiso solo de envío:
   - `backend-produccion` → para Coolify.
   - `gmail-smtp` → para el paso 14.

   Se guardan en el gestor de contraseñas, **nunca en el repo**. Así se puede
   revocar una sin cortar la otra.

### 13. DMARC (hecho el 2026-11-06)

Un TXT más en `tivuapp.com`:

| Tipo | Nombre | Valor |
|---|---|---|
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:soporte@tivuapp.com` |

Empieza en `p=none` (solo informa). Cuando los informes muestren que todo
pasa SPF y DKIM, subir a `p=quarantine`.

### 14. Responder desde Gmail como `soporte@` (hecho el 2026-11-06)

Gmail → **Configuración → Cuentas e importación → Enviar como → Añadir otra
dirección**:

- Nombre: `Soporte tivu`. Dirección: `soporte@tivuapp.com`. Desmarcar «Tratar
  como un alias».
- SMTP: `smtp.resend.com`, puerto **465**, SSL. Usuario: `resend`.
  Contraseña: la clave `gmail-smtp`.
- Gmail rellena solo el SMTP con `route2.mx.cloudflare.net` y usuario
  `soporte`: **está mal** (es el servidor que recibe). Cambiarlo.
- Gmail manda un enlace a `soporte@`: llega por Email Routing al mismo Gmail.
- En **Enviar como → Cuando responda a un mensaje**: «Responder desde la
  misma dirección a la que se ha enviado el mensaje». Sin poner `soporte@`
  como predeterminada.

**No usar los servidores de Google para esto.** El correo saldría sin la
firma DKIM de `tivuapp.com`, fallaría DMARC y acabaría en spam o rechazado.
Estas respuestas cuentan contra la cuota de Resend.

### 15. `tivuapp.store` no envía correo (hecho el 2026-11-06)

En las tiendas de todos los negocios nadie debe poder mandar correo en nombre
de `pepito.tivuapp.store`. En `tivuapp.store`:

| Tipo | Nombre | Valor |
|---|---|---|
| TXT | `@` | `v=spf1 -all` |
| TXT | `_dmarc` | `v=DMARC1; p=reject; sp=reject` |
| MX | `@` | `.` con prioridad 0 («null MX»: no recibe) |

El `sp=reject` cubre todos los subdominios. El comodín `*` de la Parte 2 es
un registro A: no da MX ni TXT a las tiendas.

Cloudflare seguirá recomendando "Email cannot reach @tivuapp.store": es
justo lo buscado, se ignora.

### 16. Remitentes y backend

| Correo | De | Responder a |
|---|---|---|
| De la plataforma (verificación, recuperar contraseña) | `tivu <no-responder@tivuapp.com>` | `soporte@tivuapp.com` |
| De una reserva (confirmación, cancelación) | `Pepito Barbería vía tivu <reservas@tivuapp.com>` | **el correo del negocio**: si el cliente responde, le llega a Pepito |

Variables en Coolify (ya previstas en `.env.example` del backend):

```env
MAIL_MAILER=resend
MAIL_FROM_ADDRESS=no-responder@tivuapp.com
MAIL_FROM_NAME=tivu
RESEND_API_KEY=   # la clave backend-produccion
```

En el código:

- **Los correos van en cola** (`ShouldQueue`): una caída de Resend no puede
  romper una reserva ni un registro.
- **Registrar los fallos de envío**: es como uno se entera de que llegó al
  tope diario.
- Con el cliente final, **el canal principal es WhatsApp**. El correo es para
  la cuenta y como respaldo.

### 17. Límites y seguridad

- **Resend gratis:** del orden de 3.000 correos al mes, **100 al día** y un
  dominio (confirmar en su página de precios vigente). El tope diario es el
  que se nota: una confirmación más un recordatorio por cita lo agotan con
  pocos negocios activos. Sobra para la beta; pasar al plan de pago con los
  primeros clientes que pagan.
- **Email Routing** solo recibe y reenvía: no envía ni guarda nada.
- **Sin dependencias en círculo:** Cloudflare, Donweb, Contabo, Coolify y
  Resend se abren con `tivusass@gmail.com`, **nunca** con `soporte@tivuapp.com`.
  Si Cloudflare falla, ese correo deja de llegar y no se podría recuperar la
  cuenta que lo arregla.
- **El Gmail es la llave de todo:** 2FA con app o llave de seguridad, códigos
  de respaldo guardados fuera del propio Gmail.
