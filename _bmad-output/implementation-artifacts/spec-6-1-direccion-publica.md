---
title: 'Story 6.1 — Cada negocio tiene su dirección pública'
type: 'feature'
created: '2026-11-04'
status: 'done'
route: 'full'
review: 'thorough'
baseline_commit: 'develop'
---

## Intent

Que cada negocio tenga un enlace propio, `{slug}.tivuapp.store`, que lleve a
su tienda y solo a la suya, sin sesión, y que lo que no es un negocio activo
no enseñe nada (PRD FR-36, AD-3, AD-11, AD-15).

## Estado de partida (2026-11-04)

| Pieza | Hoy |
|---|---|
| `tenants.slug` | lo fija el paso 1 del onboarding (`OnboardingService::derivarSlug`); después **no se puede cambiar**: renombrar el negocio no lo toca |
| Nombres reservados | `OnboardingService::SLUGS_RESERVADOS` (backend) y otra lista distinta en `web/src/middleware.ts` |
| Rutas públicas | `/publico/categorias-negocio` y `/publico/planes` dentro de `routes/api.php`; **no existe** `routes/publico.php` ni la tienda en Laravel |
| Next | `middleware.ts` reescribe `{slug}.{NEXT_PUBLIC_APP_DOMAIN}` → `/reservar/{slug}`; el BFF reenvía **cualquier** ruta desde cualquier host |
| Contrato | `GET /publico/{slug}` devuelve `negocio.id`: es el id aleatorio que **nombra la base del negocio**, no debe salir |

## Decisiones

- **Zona pública propia** (AD-3): `routes/publico.php` con su grupo de
  middleware `publico` —sin `auth:sanctum`, sin `ValidarTenantDelToken`—, que
  resuelve el negocio por el `{slug}` de la ruta e inicializa su tenancy. Las
  dos rutas públicas de hoy se mudan ahí sin cambiar su URL.
- **El negocio sale del host, en el servidor.** Next (`middleware.ts`) saca el
  slug de `{slug}.tivuapp.store` y reescribe a `/reservar/{slug}/…`; la página
  pide `/api/publico/{slug}` y Laravel resuelve por ese slug. Ningún dato del
  navegador (cabecera, query, cuerpo) elige el negocio.
- **El BFF decide por el host** (AD-15): desde un host de tienda
  (`*.{NEXT_PUBLIC_STORE_DOMAIN}`) solo reenvía `/api/publico/*`, **sin**
  `Authorization` ni `X-Tenant`, aunque hubiera cookie; cualquier otra ruta,
  404. Desde el host del panel, igual que hoy.
- **Qué responde `GET /publico/{slug}`:**
  | Caso | Respuesta |
  |---|---|
  | slug vigente, negocio activo | 200 con la tienda |
  | slug **antiguo** del negocio (historial) | 200 con la tienda y `negocio.slug` = el **vigente**: la página hace 301 a la dirección nueva (igual que las sedes, FR-81) |
  | slug inexistente, reservado, negocio sin slug, eliminado o suspendido | **404**, siempre el mismo cuerpo: no revela si el negocio existe. La pantalla «tienda no disponible» de un suspendido es la 6.11 |
- **Historial de slugs** en la base central, `tenant_slugs (slug UNIQUE,
  tenant_id, vigente_desde)`: guarda el vigente y los anteriores. Un slug que
  usó un negocio **no lo puede tomar otro nunca** —si no, los enlaces viejos
  de WhatsApp llevarían a la tienda de otro—; el mismo negocio sí puede volver
  a uno suyo. La migración rellena el historial con el slug actual de cada
  negocio.
- **Cambiar la dirección**: `PUT /configuracion/direccion { slug }`, con
  `configuracion: gestionar`. Valida formato (minúsculas, números y guiones,
  3–63, sin guion al principio ni al final), reservados y disponibilidad. El
  anterior queda en el historial redirigiendo. Responde
  `{ data: { slug, url } }`. Y `GET /configuracion/direccion/disponible?slug=`
  para comprobar mientras se escribe: `{ data: { disponible, motivo? } }` con
  `motivo` en `formato | reservado | ocupado` (el texto lo pone el panel).
- **Una sola lista de reservados**, la de AD-15, en el backend
  (`SlugsReservados`): `www, api, admin, app, mail, ftp, site, coolify,
  status, panel, dashboard, soporte, ayuda, blog, docs, login, registro,
  static, cdn, publico, planes, categorias-negocio, reservar, tienda, cita`.
  Next deja de tener la suya: con un reservado la tienda simplemente no
  existe (404).
- **Sin ids internos**: `negocio.id` sale del contrato de la tienda; el
  negocio se identifica por `slug`.

## Plan

**Backend (Claude, Backend-Sass)**

1. Migración central `tenant_slugs` + relleno con los slugs actuales.
2. `SlugsReservados` y `DireccionPublica` (validar, disponibilidad, cambiar
   dejando historial); `OnboardingService::derivarSlug` la usa.
3. `routes/publico.php` + middleware `ResolverNegocioPublico`; mudar
   `categorias-negocio` y `planes`.
4. `GET /publico/{slug}` con `negocio { nombre, slug, telefono, email }` y
   `locales` (forma actual de `LocalPublico`); 404 uniforme.
5. `PUT /configuracion/direccion` y `GET /configuracion/direccion/disponible`.

**Frontend (Claude, la frontera de seguridad)**

6. `NEXT_PUBLIC_STORE_DOMAIN` (sustituye a `NEXT_PUBLIC_APP_DOMAIN` para las
   tiendas); `middleware.ts` sin lista propia de reservados.
7. BFF: desde un host de tienda solo `/api/publico/*` y sin credenciales.
8. La página de la tienda redirige con 301 si `negocio.slug` ≠ el pedido.

**Pantallas (Codex)**

9. «Negocio no encontrado» para el 404 de la tienda (sin datos de nadie).
10. Configuración → **Dirección pública**: ver la URL, copiarla, cambiarla con
    comprobación de disponibilidad mientras se escribe y aviso de que la
    anterior seguirá redirigiendo.

## Pruebas

**Pest**
- Slug vigente → 200 con su tienda y **solo** sus datos (dos negocios, uno no
  ve los del otro).
- Slug antiguo → 200 con `negocio.slug` vigente.
- Inexistente, reservado, sin slug, eliminado, suspendido → 404 con el mismo
  cuerpo exacto.
- La respuesta no lleva `id` del negocio, costes, notas ni teléfonos del equipo.
- Zona pública: una ruta del panel sin token → 401; con un token del panel,
  `/publico/*` no usa la sesión (mismo resultado que sin token).
- `PUT /configuracion/direccion`: formato, reservado, ocupado por otro (vigente
  o histórico) → 422; volver a un slug propio anterior → 200; sin permiso → 403.
- `disponible`: cada `motivo`.
- `derivarSlug` salta los slugs del historial de otros.
- Migración: un negocio con slug queda con su fila vigente.

**Next (Vitest cuando exista; hoy, comprobación en el navegador)**
- `pepito.tivuapp.store` → tienda; `www.tivuapp.store` → no encontrado;
  `a.b.tivuapp.store` → no encontrado.
- Desde un host de tienda, `/api/citas` → 404 y `/api/publico/pepito` no lleva
  `Authorization`.
- Slug antiguo → 301 a la dirección vigente, sin bucles.

## Fuera de esta historia

- Enlace por sede (`/{sede}`): 6.2. Catálogo y huecos: 6.3 y 6.4.
- «Tienda no disponible» para suspendidos: 6.11. Límite de peticiones: 6.10.
- Dominio propio del negocio: 6.12.

### Review Findings

Revisión `bmad-code-review` del 2026-11-04 (cuatro perspectivas). Diff: Backend-Sass `9be6229` + Sass-ChiraFlow `1fcaa27`, `ce8241f`.

- [x] [Review][Defer] Las URLs de las imágenes llevan el id interno del negocio [app/Services/ImagenService.php] — deferred (decidido 2026-11-04): se arregla en la Story 5.2 con claves opacas en R2 detrás de Cloudflare, antes de que la 6.3 muestre fotos. Anotado en las dos historias y en el contrato.
- [x] [Review][Patch] El BFF copia `Authorization` y `X-Tenant` del navegador en una tienda, y deja pasar segmentos `.`/`..` [web/src/app/api/[...path]/route.ts]
- [x] [Review][Patch] El respaldo `NEXT_PUBLIC_APP_DOMAIN` puede convertir el panel en «tienda» (`app.dominio`) [web/src/lib/tienda/host.ts, web/src/config/env.ts]
- [x] [Review][Patch] Borrar de verdad un negocio libera sus slugs (`cascadeOnDelete`) [database/migrations/2026_11_05_000001_create_tenant_slugs_table.php]
- [x] [Review][Patch] El relleno de `tenant_slugs` para negocios existentes no lo prueba nada [tests/Feature/Publico]
- [x] [Review][Patch] Dos negocios pidiendo el mismo slug a la vez: 500 en vez de 422; `anotar()` acepta en silencio un slug ajeno [app/Services/DireccionPublica.php]
- [x] [Review][Patch] Negocios borrados antes del arreglo guardan `deleted_at` en `data` [app/Models/Tenant.php + migración]
- [x] [Review][Patch] `resolver()` rechaza por formato slugs antiguos válidos (p. ej. de 2 letras) [app/Services/DireccionPublica.php]
- [x] [Review][Patch] `/api/auth/login` y `logout` responden en un host de tienda [web/src/app/api/auth]
- [x] [Review][Patch] La redirección de un slug antiguo pierde la ruta y la consulta [web/src/app/(publico)/reservar/[slug]/layout.tsx, web/src/middleware.ts]
- [x] [Review][Patch] Documentación: tabla de 404 incompleta, regla de formato (`--`, minúsculas), dependencia de `tienda` entre repos, `api.` también sirve `/archivos`, fichas de Configuración y Tienda pública [docs]
- [x] [Review][Defer] Límite de peticiones por visitante real [routes/publico.php] — deferred: detrás del BFF todo llega desde la IP de Next y el layout duplica la consulta; es la Story 6.10 (identificar al visitante sin fiarse de un `X-Forwarded-For` que llegue por `api.` público).
- [x] [Review][Defer] Pruebas automáticas del middleware, el BFF y el layout [web/] — deferred: `web/` no tiene ejecutor de pruebas (AD-19, Vitest pendiente). Verificado a mano con `curl` forzando el `Host` contra `next dev`.

**Rechazados**

- `false` — «El BFF bloquea las imágenes de la tienda»: sus URLs son absolutas a Laravel (`APP_URL`), no pasan por el BFF.
- `false` — «El middleware reescribe archivos de `public/`»: solo hay `favicon.ico` e `images/`, los dos excluidos del matcher.
- `false` — «`user()->tenant` nulo da 500»: `tenancy.init` responde 503 antes de llegar al controlador.
- `low` — «Los nuevos reservados cierran tiendas existentes»: no hay negocios en producción; en local, ninguno usa esos nombres.
- `low` — «`derivarSlug` al llegar al tope de 1000»: inalcanzable con un slug bien formado.
- `low` — «Dos onboardings derivan el mismo slug a la vez»: carrera previa a la 6.1 y muy improbable.
- `low` — «Un `UPDATE` masivo de `tenants.slug` se salta el historial»: ningún código lo hace.
- descartado — «El layout pinta la tienda con un 429 o un 5xx»: es lo pretendido; sin backend no se bloquea la página y el cliente muestra su error.
