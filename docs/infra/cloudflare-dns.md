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
  **MX** y **TXT**: hay que conservarlos al mudar el DNS.
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
| tivuapp.com | `api` | Laravel, **solo para webhooks** (Resend, WhatsApp) |
| tivuapp.com | `admin` | panel de la plataforma (más adelante) |
| tivuapp.store | `@` | portada de tiendas o redirección |
| tivuapp.store | `*` | **todas las tiendas**, sin crear nada por negocio |

- **`api` existe solo para los webhooks** de servicios externos (rebotes de
  Resend, mensajes del proveedor de WhatsApp). El panel y la tienda **no** lo
  usan: el BFF de Next le habla a Laravel por la red interna de Coolify.
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

### 8. Después (al instalar Coolify)

- Firewall del VPS: 80/443 **solo desde las IPs de Cloudflare**, SSH con llave.
- Activar HSTS cuando todo funcione.
- Dominios propios de los negocios: **Cloudflare for SaaS** (confirmar precios
  y límites en su documentación vigente antes de comprometerlo en el plan Pro).
