# Dar acceso a un colaborador al VPS

Cómo dejar que otra persona (un amigo dev, un colaborador) despliegue **sus
propias apps, con sus propios dominios**, en el mismo VPS de Contabo con
Coolify donde vive tivu, sin compartir cuentas.

**Todo se hace desde la web de Coolify.** El colaborador no necesita entrar
al servidor por SSH. Solo el dueño tiene la llave del servidor, y eso es más
seguro. El acceso por SSH queda como anexo al final, para casos raros.

La regla de fondo: **cada persona entra con sus propias credenciales**. Nunca
se comparte el Gmail `tivusass@gmail.com`, ni la cuenta de Cloudflare, ni el
usuario de Coolify. Así se le puede quitar el acceso sin tocar el tuyo, y
queda registrado quién hizo qué.

En los pasos, cambiar:

| Marcador | Qué es |
|---|---|
| `<IP-DEL-VPS>` | la IP del servidor de Contabo |
| `sudominio.com` | el dominio del colaborador |
| `nombre-colaborador` | un nombre corto para identificarlo |

---

## 0. Antes de empezar: lo que hay que acordar

- **Verá lo de tivu.** Coolify no tiene permisos por proyecto. Un miembro
  del equipo ve **todos** los proyectos, incluidas las bases de datos y las
  variables de entorno con claves. Solo se invita a alguien de confianza.
- **El servidor es compartido.** 8 vCPU y 24 GB para tivu, el otro proyecto
  de Jean y lo del colaborador. Cada app suya lleva **límites de CPU y RAM**.
- **Cada uno con lo suyo.** Sus apps van en **su propio Project**, con sus
  propias bases de datos y sus propias copias de seguridad. Nunca usa la base
  de tivu.
- **Su propio GitHub.** La fuente `coolify-tivu` da acceso a los repos de
  tivu y está disponible para todo el equipo. Él conecta **la suya** (paso
  3) y despliega solo desde ahí.
- **Qué necesita depende de su app.** Una web con dominio sigue todos los
  pasos. Un bot o un worker sin web se salta los pasos 4 y 5.
- **Todo dominio pasa por Cloudflare, con la nube naranja.** El firewall del
  VPS solo deja entrar por 80/443 a las IPs de Cloudflare. Un dominio que
  apunte directo a la IP **no carga**. Abrir el firewall no es opción: dejaría
  saltarse Cloudflare Access para llegar al panel de Coolify y dejaría la IP
  del servidor a la vista.

---

## 1. Dueño: darle entrada a Coolify

El colaborador le pasa **su correo personal**. Con él:

**Cloudflare Access.** Zero Trust → **Access → Applications → coolify →
Policies** → editar la política:

- **Include → Emails**: añadir su correo junto a `tivusass@gmail.com`.
- Opcional: renombrar la política de "Solo yo" a "Equipo".

**Coolify.** **Team → Members → Invite**, con su correo y el rol **Member**.
Se le pasa el enlace de invitación.

## 2. Colaborador: entrar por primera vez

1. Abrir `https://coolify.tivuapp.com`. Cloudflare pide un correo: el suyo.
   Le llega un código (One-time PIN) y lo escribe.
2. Abrir el enlace de invitación y crear su contraseña de Coolify.
3. Activar la **2FA**: Profile → Two-factor authentication. Guardar los
   códigos de recuperación en su gestor de contraseñas.

## 3. Colaborador: conectar su GitHub

**Sources → + Add → GitHub App**, con un nombre suyo (por ejemplo
`coolify-nombre-colaborador`):

- Webhook endpoint: el de la instancia, `https://coolify.tivuapp.com`.
- *Preview deployment access*: «Do not update pull requests». Sin runners.
- **Register With GitHub** con **su** sesión de GitHub abierta. En GitHub,
  confirmar la creación de la app.
- **Install Repositories** → en **su** cuenta → **Only select
  repositories**: solo los repos que va a desplegar.

Tiene que quedar en **Connected**. Los avisos de GitHub (webhooks) ya pasan
por Cloudflare Access: la regla de `/webhooks` vale para todas las fuentes.
Así, cada `git push` despliega solo.

## 4. Colaborador: su dominio en **su** Cloudflare

Solo si su app es una web con dominio.

1. Crear una cuenta **gratis** de Cloudflare con su correo → **Add a domain**
   → `sudominio.com`.
2. En su registrador (Donweb, GoDaddy, Namecheap…), cambiar los
   **nameservers** por los dos que da Cloudflare. El dominio sigue comprado
   donde está; solo cambia quién gestiona el DNS. Si tenía **DNSSEC**
   activo, apagarlo antes.
3. Esperar a que el dominio salga **Active** (minutos a horas).
4. **DNS → Add record**, uno por nombre que vaya a usar (la IP se la pasa el
   dueño):

   | Tipo | Nombre | Contenido | Proxy |
   |---|---|---|---|
   | A | `@` | `<IP-DEL-VPS>` | 🟠 Proxied |
   | A | `www` (u otro) | `<IP-DEL-VPS>` | 🟠 Proxied |

   **Con la nube naranja.** En gris (DNS only), el firewall lo descarta.
5. **SSL/TLS → Overview → Full (strict)**. En **Edge Certificates**: Always
   Use HTTPS activado y TLS mínimo 1.2.
6. **SSL/TLS → Origin Server → Create Certificate**: clave RSA, hostnames
   `sudominio.com` y `*.sudominio.com`, 15 años. Deja ver dos bloques de
   texto: el **certificado** y la **clave privada**. La clave solo se ve una
   vez: copiarla a su gestor de contraseñas.

> La clave privada **nunca** va por WhatsApp, por correo ni por un chat.

El certificado gratis de Cloudflare cubre un solo nivel de subdominio
(`app.sudominio.com` sí, `a.b.sudominio.com` no).

## 5. Colaborador: el certificado en Traefik, desde Coolify

Solo si hizo el paso 4. No hace falta subir archivos al servidor: Traefik
acepta el certificado pegado en la configuración.

En Coolify: **Servers → localhost → Proxy → Dynamic Configurations → Add**.
Un archivo **propio**, para no tocar el de tivu (`cloudflare-origin.yaml`):

- Nombre: `sudominio-origin.yaml`
- Contenido: pegar los dos bloques del paso 4.6, **con su sangría**. Cada
  línea del certificado y de la clave va con 10 espacios delante, debajo del
  `|`:

```yaml
tls:
  certificates:
    - certFile: |
          -----BEGIN CERTIFICATE-----
          MIIE...
          ...
          -----END CERTIFICATE-----
      keyFile: |
          -----BEGIN PRIVATE KEY-----
          MIIE...
          ...
          -----END PRIVATE KEY-----
```

Guardar. Traefik lo carga sin reiniciar y elige solo el certificado que
corresponde a cada dominio: los de tivu y los suyos conviven sin chocar.

Si como **Member** no le deja abrir el Proxy del servidor, el dueño le sube
el rol a **Admin** mientras lo hace (Team → Members), y luego se lo vuelve a
bajar.

## 6. Colaborador: sus apps

1. **Projects → + Add** → un Project con su nombre. Todo lo suyo va ahí.
2. Dentro: **+ New** → su app. Si viene de GitHub, elegir **su** fuente
   (paso 3), **nunca** `coolify-tivu`. Servidor: `localhost`.
3. Si necesita base de datos, la crea **dentro de su Project**, en
   **Private** (sin acceso público).
4. En la app:
   - **Domains**: `https://sudominio.com` (y los que use, separados por
     coma). El puerto es el que escucha su app **dentro** del contenedor.
   - **Resource Limits**: tope de CPU y memoria. Por ejemplo, 1 CPU y 1 GB
     para una app pequeña.
5. **Deploy**.

## 7. Comprobar

- `https://sudominio.com` carga con candado.
- Si sale un error de Cloudflare:
  - **521 / 522**: el registro A no apunta a la IP correcta, o la app no
    está corriendo.
  - **525 / 526**: falla el certificado. Revisar el paso 5 (sobre todo la
    sangría) y que el modo sea Full (strict).
- Si la web se queda cargando sin error, el registro está en **gris**: pasar
  a naranja.

---

## Si antes se compartió alguna cuenta

Cerrarla en cuanto el colaborador entre con lo suyo:

- **Cloudflare:** cambiar la contraseña y volver a configurar la 2FA.
- **Gmail `tivusass@gmail.com`:** cambiar la contraseña. En Cuenta de Google
  → Seguridad → **Tus dispositivos**, cerrar las sesiones ajenas. Revisar que
  el correo y el teléfono de recuperación sean los tuyos.

## Quitar el acceso

Antes, acordar qué pasa con sus apps: borrarlas o que las migre.

1. **Coolify:** Team → Members → quitarlo. Borrar su fuente de GitHub en
   Sources; él desinstala la app en su GitHub.
2. **Cloudflare Access:** quitar su correo de la política.
3. **Traefik:** borrar su `sudominio-origin.yaml` en Dynamic Configurations.
4. **SSH**, si se le dio (anexo): borrar su línea de `authorized_keys`.

---

## Resumen

| Paso | Quién | Qué | Dónde |
|---|---|---|---|
| 1 | Dueño | Su correo en Access e invitación como Member | Cloudflare Zero Trust, Coolify → Team |
| 2 | Colaborador | Entrar, contraseña y 2FA | `coolify.tivuapp.com` |
| 3 | Colaborador | Su fuente de GitHub, en su cuenta | Coolify → Sources |
| 4 | Colaborador | Dominio, A naranja, Full (strict), certificado | **su** Cloudflare |
| 5 | Colaborador | `sudominio-origin.yaml` con el certificado pegado | Coolify → Proxy → Dynamic Configurations |
| 6 | Colaborador | Project, apps, base de datos, límites, dominio | Coolify |

---

## Anexo: acceso por SSH (casi nunca hace falta)

Solo si tiene que administrar el servidor por terminal. Para desplegar no
hace falta, y cada llave más es una puerta más.

**Colaborador: crear su llave.** En Windows (PowerShell), Mac o Linux:

```bash
ssh-keygen -t ed25519 -C "nombre-colaborador"
```

- Ruta: **Enter** (la de por defecto).
- **Passphrase: poner una.** Así, si le roban el archivo, no basta para
  entrar.

Ver la parte pública y enviarla al dueño:

```powershell
# Windows
Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub
```

```bash
# Mac / Linux
cat ~/.ssh/id_ed25519.pub
```

Es **una sola línea** que empieza por `ssh-ed25519 AAAA…` y termina en
`nombre-colaborador`. Esa sí se puede enviar por cualquier medio.

> ⚠️ Nunca enviar el archivo `id_ed25519` (el que **no** termina en `.pub`).
> Es la llave privada y no sale de su PC.

Cualquier cliente SSH sirve; no hace falta Bitvise. Windows 10/11, Mac y
Linux ya traen `ssh`.

**Dueño: añadirla.** En la terminal del servidor (Bitvise), como root:

```bash
echo 'PEGAR-AQUÍ-LA-LÍNEA-COMPLETA' >> /root/.ssh/authorized_keys
tail -n 3 /root/.ssh/authorized_keys
```

- **`>>`, dos signos.** Con uno solo se borran las demás llaves, incluida la
  de **Coolify**, y Coolify pierde el control del servidor.
- Comillas **simples**, la línea completa, sin saltos.
- En el `tail` tienen que verse, cada una en su línea, la de Coolify, la
  tuya y la suya.

Él prueba con `ssh root@<IP-DEL-VPS>`: pide **su passphrase**, no una
contraseña del servidor. Entra como **root**, con control total. Si se suman
más personas, conviene un usuario propio para cada una.

**Quitarla:** `nano /root/.ssh/authorized_keys`, borrar **solo** la línea que
termina en `nombre-colaborador` y guardar. **No tocar** la de Coolify.

---

Conceptos en [`conceptos.md`](conceptos.md). La guía de tivu está en
[`cloudflare-dns.md`](cloudflare-dns.md).
