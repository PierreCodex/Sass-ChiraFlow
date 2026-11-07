# Dar acceso a un colaborador al VPS

Cómo dejar que otra persona (un amigo dev, un colaborador) despliegue **sus
propias apps, con sus propios dominios**, en el mismo VPS de Contabo con
Coolify donde vive tivu, sin compartir cuentas.

La regla de fondo: **cada persona entra con sus propias credenciales**. Nunca
se comparte el Gmail `tivusass@gmail.com`, ni la cuenta de Cloudflare, ni el
usuario de Coolify. Así se le puede quitar el acceso sin tocar el tuyo, y
queda registrado quién hizo qué.

En los comandos, cambiar:

| Marcador | Qué es |
|---|---|
| `<IP-DEL-VPS>` | la IP del servidor de Contabo |
| `sudominio.com` | el dominio del colaborador |
| `nombre-colaborador` | un nombre corto para identificar su llave |

---

## 0. Antes de empezar: lo que hay que acordar

- **Verá lo de tivu.** Coolify no tiene permisos por proyecto. Un miembro
  del equipo ve **todos** los proyectos, incluidas las variables de entorno
  con claves. Solo se invita a alguien de confianza.
- **El servidor es compartido.** 8 vCPU y 24 GB para tivu, el otro proyecto
  de Jean y lo del colaborador. Cada app suya lleva **límites de CPU y RAM**.
- **Cada uno con lo suyo.** Sus apps van en **su propio Project**, con sus
  propias bases de datos y sus propias copias de seguridad. Nunca usa la base
  de tivu.
- **Todo dominio pasa por Cloudflare, con la nube naranja.** El firewall del
  VPS solo deja entrar por 80/443 a las IPs de Cloudflare. Un dominio que
  apunte directo a la IP **no carga**. Abrir el firewall no es opción: dejaría
  saltarse Cloudflare Access para llegar al panel de Coolify y dejaría la IP
  del servidor a la vista.

---

## Parte A — Lo que hace el colaborador primero

### A1. Su llave SSH (opcional)

Solo hace falta si va a entrar al servidor por terminal. Para el día a día
basta con la web de Coolify. El certificado del paso B4 lo puede subir el
dueño del VPS.

En **Windows (PowerShell)**, **Mac** o **Linux**:

```bash
ssh-keygen -t ed25519 -C "nombre-colaborador"
```

- Ruta: **Enter** (la de por defecto).
- **Passphrase: poner una.** Así, si le roban el archivo, no basta para
  entrar.

Ver la parte pública:

```powershell
# Windows
Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub
```

```bash
# Mac / Linux
cat ~/.ssh/id_ed25519.pub
```

Sale **una sola línea** que empieza por `ssh-ed25519 AAAA…` y termina en
`nombre-colaborador`. **Esa línea** es la que se envía al dueño del VPS.

> ⚠️ Nunca enviar el archivo `id_ed25519` (el que **no** termina en `.pub`).
> Es la llave privada y no sale de su PC.

Cualquier cliente SSH sirve; no hace falta Bitvise. Windows 10/11, Mac y
Linux ya traen `ssh` y `scp`.

### A2. Enviar al dueño del VPS

- Su **correo** personal.
- Su **llave pública** (la línea `.pub`), si va a usar SSH.

---

## Parte B — Lo que hace el dueño del VPS

### B1. Cloudflare Access: que pueda llegar a Coolify

Zero Trust → **Access → Applications → coolify → Policies** → editar la
política:

- **Include → Emails**: añadir su correo junto a `tivusass@gmail.com`.
- Opcional: renombrar la política de "Solo yo" a "Equipo".

Al abrir `https://coolify.tivuapp.com` le llegará el código (One-time PIN) a
**su** correo.

### B2. Coolify: su propio usuario

**Teams → Members → Invite**, con su correo y el rol **Member**. Se le pasa
el enlace de invitación. Él crea su contraseña y activa su **2FA** (Profile →
Two-factor authentication).

### B3. SSH: añadir su llave (si la envió)

En la terminal del servidor (Bitvise), como root:

```bash
echo 'PEGAR-AQUÍ-LA-LÍNEA-COMPLETA' >> /root/.ssh/authorized_keys
tail -n 3 /root/.ssh/authorized_keys
```

- **`>>`, dos signos.** Con uno solo se borran las demás llaves, incluida la
  de **Coolify**, y Coolify pierde el control del servidor.
- Comillas **simples**, la línea completa, sin saltos.
- En el `tail` tienen que verse, cada una en su línea, la de Coolify, la
  tuya y la suya.

Él prueba con `ssh root@<IP-DEL-VPS>`. Pide **su passphrase**, no una
contraseña del servidor.

Así entra como **root**, con control total, igual que el dueño. Vale para
alguien de confianza. Si se suman más personas, conviene un usuario propio
para cada una.

### B4. Cerrar cualquier acceso compartido

Si antes se le pasó alguna cuenta, cerrarla una vez que ya entre con lo suyo:

- **Cloudflare:** cambiar la contraseña y volver a configurar la 2FA.
- **Gmail `tivusass@gmail.com`:** cambiar la contraseña. En Cuenta de Google
  → Seguridad → **Tus dispositivos**, cerrar las sesiones ajenas. Revisar que
  el correo y el teléfono de recuperación sean los tuyos.

---

## Parte C — Lo que hace el colaborador para desplegar

### C1. Su dominio en Cloudflare (en **su** cuenta)

1. Crear una cuenta **gratis** de Cloudflare con su correo → **Add a domain**
   → `sudominio.com`.
2. En su registrador (Donweb, GoDaddy, Namecheap…), cambiar los
   **nameservers** por los dos que da Cloudflare. El dominio sigue comprado
   donde está; solo cambia quién gestiona el DNS. Si tenía **DNSSEC**
   activo, apagarlo antes.
3. Esperar a que el dominio salga **Active** (minutos a horas).
4. **DNS → Add record**, uno por nombre que vaya a usar:

   | Tipo | Nombre | Contenido | Proxy |
   |---|---|---|---|
   | A | `@` | `<IP-DEL-VPS>` | 🟠 Proxied |
   | A | `www` (u otro) | `<IP-DEL-VPS>` | 🟠 Proxied |

   **Con la nube naranja.** En gris (DNS only), el firewall lo descarta.
5. **SSL/TLS → Overview → Full (strict)**. Y en **Edge Certificates**: Always
   Use HTTPS activado y TLS mínimo 1.2.

### C2. Su certificado de origen

En su Cloudflare: **SSL/TLS → Origin Server → Create Certificate**.

- Clave RSA, hostnames `sudominio.com` y `*.sudominio.com`, validez de 15
  años.
- Guardar el **certificado** como `sudominio.com.cert` y la **clave
  privada** como `sudominio.com.key`. La clave solo se ve una vez: copiarla
  a su gestor de contraseñas.

> La clave privada **nunca** va por WhatsApp, por correo ni por un chat.

Recuerda: el certificado gratis de Cloudflare cubre un solo nivel de
subdominio (`app.sudominio.com` sí, `a.b.sudominio.com` no).

### C3. Subir el certificado al servidor

**Con SSH**, desde la carpeta donde están los archivos:

```bash
scp sudominio.com.cert sudominio.com.key root@<IP-DEL-VPS>:/data/coolify/proxy/certs/
ssh root@<IP-DEL-VPS> "chmod 600 /data/coolify/proxy/certs/sudominio.com.key"
```

**Sin SSH**, hay dos alternativas:

- Se los entrega al dueño del VPS por un medio seguro (USB, gestor de
  contraseñas compartido), y el dueño los sube con Bitvise (SFTP).
- Desde la **Terminal** web de Coolify: `nano` con la ruta de cada archivo,
  pegar el contenido y guardar.

### C4. Decirle a Traefik que use su certificado

En Coolify: **Servers → localhost → Proxy → Dynamic Configurations → Add**.
Un archivo **propio**, para no tocar el de tivu (`cloudflare-origin.yaml`):

- Nombre: `sudominio-origin.yaml`

```yaml
tls:
  certificates:
    - certFile: /traefik/certs/sudominio.com.cert
      keyFile: /traefik/certs/sudominio.com.key
```

La ruta es `/traefik/…` (así se ve la carpeta desde dentro del contenedor
de Traefik), no `/data/coolify/proxy/…`. Traefik relee estos archivos sin
reiniciar, y elige solo el certificado que corresponde a cada dominio. Los de
tivu y los suyos conviven sin chocar.

### C5. Sus apps en Coolify

1. **Projects → + Add** → un Project con su nombre. Todo lo suyo va ahí.
2. Dentro: **+ New → Resource** → su app (desde GitHub, Dockerfile, Docker
   Compose…). Servidor: `localhost`.
3. Si necesita base de datos, la crea **dentro de su Project**.
4. En la app:
   - **Domains**: `https://sudominio.com` (y los que use, separados por
     coma).
   - **Resource Limits**: poner tope de CPU y memoria. Por ejemplo, 1 CPU y
     1 GB para una app pequeña.
5. **Deploy**.

### C6. Comprobar

- `https://sudominio.com` carga con candado.
- Si sale un error de Cloudflare:
  - **521 / 522**: el registro A no apunta a la IP correcta, o la app no
    está corriendo.
  - **525 / 526**: falla el certificado. Revisar C3 y C4, y que el modo sea
    Full (strict).
- Si la web se queda cargando sin error, el registro está en **gris**: pasar
  a naranja.

---

## Despliegue automático desde GitHub (pendiente, una sola vez)

Para que un `git push` despliegue solo, GitHub tiene que poder llamar a
Coolify. Hoy Cloudflare Access bloquea esa llamada, porque GitHub no puede
meter un código de correo.

Falta una regla **Bypass** en Access para la ruta de webhooks de Coolify.
Está pendiente también para tivu: se configura una vez y sirve para todos.
Mientras tanto, se despliega con el botón **Deploy** de Coolify.

---

## Quitar el acceso

Cuando el colaborador deje de usar el servidor:

1. **Coolify:** Teams → Members → quitarlo. Antes, acordar qué pasa con sus
   apps: borrarlas o que las migre.
2. **Cloudflare Access:** quitar su correo de la política.
3. **SSH:** `nano /root/.ssh/authorized_keys`, borrar **solo** la línea que
   termina en `nombre-colaborador` y guardar. **No tocar** la de Coolify.
4. **Traefik:** borrar su `sudominio-origin.yaml` en Dynamic Configurations,
   y sus archivos en `/data/coolify/proxy/certs/`.

---

## Resumen

| Quién | Qué | Dónde |
|---|---|---|
| Colaborador | Llave SSH (opcional) y su correo | su PC |
| Dueño | Añadir su correo a Access | Cloudflare Zero Trust |
| Dueño | Invitarlo como Member | Coolify → Teams |
| Dueño | Añadir su llave pública | `/root/.ssh/authorized_keys` |
| Colaborador | Dominio, registro A naranja, Full (strict) | **su** Cloudflare |
| Colaborador | Certificado de origen | su Cloudflare → VPS `/data/coolify/proxy/certs/` |
| Colaborador | `sudominio-origin.yaml` | Coolify → Proxy → Dynamic Configurations |
| Colaborador | Project, apps, límites, dominio | Coolify |

Conceptos en [`conceptos.md`](conceptos.md). La guía de tivu está en
[`cloudflare-dns.md`](cloudflare-dns.md).
