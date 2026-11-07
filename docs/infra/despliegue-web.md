# Despliegue del frontend en Coolify

El frontend (Next, con el BFF dentro) corre en el VPS de Contabo con Coolify,
detrás de Cloudflare. Un solo contenedor sirve dos cosas:

| Dirección | Qué | Cómo llega |
|---|---|---|
| `app.tivuapp.com` | el panel | dominio en Coolify (*Domains*) |
| `{slug}.tivuapp.store` | la tienda de cada negocio | regla propia de Traefik en el compose |

`tivuapp.com` sigue con la página «Muy pronto» hasta que esté la landing.
El backend se despliega aparte (repo `Backend-Sass`,
`docs/despliegue-coolify.md`). La infraestructura, en
[`cloudflare-dns.md`](cloudflare-dns.md).

## Los archivos (en `web/`)

- **`Dockerfile`**: Node 24, `npm ci` y `next build` en modo **standalone**
  (`output: "standalone"` en `next.config.mjs`). La imagen final lleva solo
  `server.js`, `public/` y `.next/static`. Corre como `node`, en el 3000.
- **`.env.production`**: las `NEXT_PUBLIC_*` del build. Next las mete **dentro
  del bundle del navegador**, así que ahí nunca va un secreto. Para conectar
  un módulo nuevo a Laravel se añade a `NEXT_PUBLIC_MODULOS_CONECTADOS` y se
  redespliega.
- **`docker-compose.prod.yml`**: el servicio `web`, su límite (2 CPU, 1 GB) y
  la regla de las tiendas.

### Por qué las tiendas van con una regla propia

Coolify genera una regla `Host(\`nombre.exacto\`)` por cada dominio de
*Domains*, y las tiendas son un comodín. La regla del compose manda a este
contenedor `tivuapp.store` y cualquier subdominio suyo
(`HostRegexp(\`^[a-z0-9-]+\.tivuapp\.store\`)`); el middleware de Next saca el
slug del host y reescribe a `/reservar/{slug}`. El certificado es el de origen
de Cloudflare (`*.tivuapp.store`) que ya está en Traefik, así que no se pide
ninguno a Let's Encrypt.

## Crear el recurso

En el proyecto `tivu`, entorno `production`:

1. **+ New → Git Repository (with GitHub App)** → `coolify-tivu` →
   `Sass-ChiraFlow` → rama **`develop`**.
2. **Build pack: Docker Compose**. **Base directory: `/web`**. Compose:
   `/docker-compose.prod.yml`.
3. **Advanced**:
   - **Build arguments: «Managed manually in Dockerfile»**. El Dockerfile no
     usa argumentos: las `NEXT_PUBLIC_*` salen de `.env.production`.
   - **Predefined network: conectado**. Coolify 4.6 lo trae en «Isolated
     network only»: así el BFF no llega a Laravel por la red interna y todo
     `/api/*` da 502 tras unos 5 segundos (el nombre del backend no se
     resuelve).
4. **Variable `API_URL`**: la URL de Laravel **por la red interna**, sin salir
   a internet: `http://api-<uuid-del-backend>:8080/api`. El uuid es el del
   recurso `backend` (sale en la URL de Coolify, tras `/application/`).
   **El backend tiene que estar en Advanced → Container naming →
   «Consistent name (no rolling updates)»**: con el valor por defecto
   («Generated name») Coolify pega la fecha del despliegue al nombre
   (`api-<uuid>-20261107T050228`) y cambia en cada redeploy. Con el nombre
   fijo, un redeploy del backend corta la API unos segundos.
5. **Domains** del servicio `web`: `https://app.tivuapp.com`, puerto `3000`.
   Las tiendas **no** se añaden aquí. Si Coolify añade solo
   `www.app.tivuapp.com`, borrarlo: no tiene registro DNS y el certificado
   `*.tivuapp.com` no cubre dos niveles.

### La IP del visitante

Laravel limita los intentos (login, registro, tienda) por IP, y guarda la IP
al aceptar los términos. Detrás del BFF, la petición le llega desde el
contenedor de Next, así que el BFF reenvía `CF-Connecting-IP` (la pone
Cloudflare) y el nginx de la imagen de Laravel la toma como IP real
(`TRUSTED_PROXY=cloudflare`). Funciona porque al VPS solo entra Cloudflare:
si alguien llegara directo, podría inventarse esa cabecera.

Cloudflare ya tiene los registros: `app` en `tivuapp.com`, y `@` y `*` en
`tivuapp.store`, todos en naranja.

## Comprobar

- `https://app.tivuapp.com/login` carga el panel.
- `https://app.tivuapp.com/api/publico/planes` devuelve los planes: el BFF
  llega a Laravel.
- `https://cualquiera.tivuapp.store` muestra la tienda («No encontramos…» si
  el negocio no existe): la regla de las tiendas funciona.
- Si el BFF da **502**, `API_URL` no apunta bien. En la **Terminal** del
  contenedor `web`:

  ```sh
  wget -qO- http://api-<uuid-del-backend>:8080/up
  ```

  Si dice `bad address`, el nombre no es ese o falta la red predefinida.

Desplegado el 2026-11-07: panel, tiendas, BFF contra Laravel por la red
interna y login (422 en español con el formulario vacío).

Probado en local el 2026-11-07: build standalone, panel, BFF contra
`api.tivuapp.com`, reescritura de `pepito.tivuapp.store` a su tienda, y una
tienda que no llega al panel (`/login` → «No encontramos») ni a rutas privadas
del BFF (404).
