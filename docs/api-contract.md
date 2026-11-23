# Contrato de API — lo que el frontend espera de Laravel

Documento **derivado del código**, no de las fichas. Sale de leer
`web/src/features/*/services/*.ts`, `web/src/features/*/hooks/*.ts`,
`web/src/features/*/types.ts` y las páginas de `web/src/app/`.

Es el resumen operativo para construir el backend: **qué rutas se van a llamar,
con qué payload, y qué JSON tiene que volver** para que la maqueta funcione al
poner `NEXT_PUBLIC_USE_MOCKS=false`.

- La especificación por pantalla sigue estando en [`vistas/`](vistas/); esa es
  la fuente de verdad del *porqué* de cada campo.
- Aquí está el *qué*: el inventario completo de endpoints y formas de datos que
  hoy tiene escrito el cliente.

> **Regla de oro:** los tipos de `features/<modulo>/types.ts` son el contrato.
> Si el API Resource de Laravel devuelve otra cosa, la pantalla se rompe en
> silencio (TypeScript no valida en runtime).

---

## 1. Convenciones que aplican a todo

### Base y transporte

**El navegador no habla con Laravel.** Habla con un BFF —un proxy fino— que
corre dentro del propio Next, y es el BFF quien llama a Laravel.

```
navegador ──/api/*──> BFF (Next, servidor) ──Bearer──> Laravel
   axios, baseURL "/api"      lee la cookie httpOnly       API_URL
```

| Cosa | Valor | Dónde |
|---|---|---|
| Base URL del cliente | **`/api`** — relativa, mismo origen que la app | `lib/api/client.ts` |
| Upstream del BFF | `API_URL` → si no, `NEXT_PUBLIC_API_URL` → `http://localhost:8000/api` | `config/env.ts` |
| Autenticación | **Sanctum por tokens Bearer**, adjuntados por el BFF | `app/api/[...path]/route.ts` |
| Dónde vive el token | cookie **httpOnly** `mi_saas_token` | `lib/auth/sesion.ts` |
| Inquilino | cookie httpOnly `mi_saas_tenant` → cabecera `X-Tenant` | idem |
| Headers fijos | `Accept: application/json`, `Content-Type: application/json`, `X-Requested-With: XMLHttpRequest` | |

Qué implica, y por qué se hizo así:

- **El JS del navegador nunca ve el token.** Al ser la cookie `httpOnly`, ni
  este código ni un script de terceros pueden leerla; solo la lee el BFF. Por
  eso el interceptor que adjuntaba el `Bearer` en el cliente **no existe**: esa
  lógica es de servidor.
- **No hay CSRF que negociar.** `GET /sanctum/csrf-cookie`, `withCredentials` y
  `withXSRFToken` desaparecen: la llamada es al mismo origen y la cookie viaja
  sola.
- **No hay CORS que configurar.** Laravel solo recibe tráfico del BFF, nunca
  del navegador.
- El proxy reenvía los bytes tal cual, así que siguen funcionando igual el
  JSON, el `multipart/form-data` y el CSV de reportes.
- `API_URL` (sin `NEXT_PUBLIC_`) es la variable buena en producción: la URL del
  backend deja de viajar en el bundle del cliente.

Las rutas del BFF son tres, y solo dos de ellas tocan la cookie:

| Ruta | Qué hace |
|---|---|
| `app/api/auth/login/route.ts` | **escribe** la cookie |
| `app/api/auth/logout/route.ts` | revoca el token y **borra** la cookie |
| `app/api/[...path]/route.ts` | lee la cookie, adjunta `Authorization` y `X-Tenant`, reenvía con `cache: 'no-store'` |

Las estáticas ganan al comodín en el App Router, así que `/api/auth/*` nunca
cae en el proxy. Sin cookie, el proxy reenvía sin `Authorization`: es lo que
necesita la tienda pública (`/api/publico/*`), que no lleva sesión.

### Envoltorios de respuesta

```jsonc
// Recurso individual: get, create, update y casi todo endpoint derivado
{ "data": { "id": 1, "nombre": "…" } }

// Colección paginada: todo `index`
{
  "data": [ … ],
  "links": { "first": null, "last": null, "prev": null, "next": null },
  "meta": { "current_page": 1, "from": 1, "last_page": 4, "path": "",
            "per_page": 10, "to": 10, "total": 37 }
}
```

El cliente solo lee `data` y `meta.total` / `meta.current_page` / `meta.per_page`
(`lib/api/types.ts`). `links` puede venir a null.

### Parámetros de listado

Los envía `usePaginacion()` (`hooks/usePaginacion.ts`) en **todas** las tablas:

| Param | Tipo | Notas |
|---|---|---|
| `page` | int | Base 1 (la tabla es base 0 y suma 1 antes de enviar) |
| `per_page` | int | 10 por defecto; el selector ofrece 10/25/50 |
| `search` | string | Se omite si está vacío. **Nunca `buscar`** |
| `sort` | string | Está en el tipo `ListParams` pero **hoy ninguna pantalla lo envía** |

Filtros extra viajan como query params sueltos (`?estado=abierto`,
`?fecha=2026-08-14`), nunca como rutas nuevas.

`all()` — la variante sin paginar que alimenta los `<select>` — llama al mismo
`index` con `?per_page=200` y lee `data.data`. Sirve tanto un `paginate(200)`
como una colección plana.

### Errores

- **422**: `{ "message": "...", "errors": { "campo": ["mensaje"] } }`.
  `toApiError()` lo normaliza y los formularios lo pintan por campo.
- **401**: el interceptor **cierra la sesión y vuelve al login**. El backend
  no necesita cuerpo. Ver "Sesión caída" más abajo.

**Login fallido: 422, no 401.** Las credenciales que no cuadran vuelven como
un error de validación —`errors.email` con "Las credenciales no coinciden…"—
y el formulario las pinta bajo el campo. El **401** queda reservado para
peticiones sin token o con token revocado, que es lo que el interceptor
traduce en un salto a `/login`; si el login fallido devolviera 401, el
interceptor recargaría la propia pantalla y se comería el mensaje.

El **403** del login es "correo sin verificar": no es un fallo del formulario
sino un paso que falta, así que la pantalla ofrece ahí mismo el reenvío del
enlace (`POST /email/reenviar`, con su cooldown).
- **429** (Story 6.10): se pasó un límite. Dice cuánto esperar, y lo repite
  en `reintentar_en` (segundos) y en la cabecera `Retry-After`. Se muestra
  `message` tal cual: no hardcodear «espera un minuto».

  ```json
  { "message": "Demasiados intentos seguidos. Espera 42 segundos y vuelve a intentarlo.",
    "codigo": "limite_solicitudes", "reintentar_en": 42 }
  ```

  Todos los límites tienen nombre y cuentan por IP **y por recurso** (la
  tienda, la sede, el token, el correo, el celular). Valores y porqués:
  `Backend-Sass/docs/limites-publicos.md`.
- **Turnstile** (Story 6.10): registro, login, `forgot-password` y la reserva
  pública aceptan `turnstile_token` (el token del widget de Cloudflare).
  Cuando el backend tiene `TURNSTILE_SECRET_KEY`, sin token o con uno que no
  vale responde **422** `{ codigo: "turnstile", errors: { turnstile: [...] } }`.
  El token es de un solo uso: el formulario pide otro tras cada envío.
- Cualquier otro estado: se muestra `message`; si no hay respuesta,
  "No se pudo conectar con el servidor."

### Formatos

- Importes: número plano en **soles** (`1250.5`), sin formatear. El frontend
  pinta `S/ 1,250.50`.
- Fechas: `YYYY-MM-DD`. Horas: `HH:MM` (24h). Timestamps: ISO 8601.
- Colores y etiquetas de estado los pone **el frontend**; el backend manda la
  clave del enum.
- Días de la semana: **ISO-8601**, 1 = lunes … 7 = domingo.

### Subida de archivos

Cuatro recursos se envían como `multipart/form-data` en vez de JSON
(`enviarComoFormData: true`): **categorías, servicios, profesionales, locales y configuración**.

Reglas de serialización (`lib/api/form-data.ts`), pensadas para Laravel:

- `null` → cadena vacía (Laravel la reconvierte a null).
- booleanos → `"1"` / `"0"`.
- arrays **indexados**: `horario[0][dia]`, no `horario[]`.
- `undefined` se omite (edición parcial).
- El **update va como `POST` con `_method=PUT`**, porque PHP no parsea
  multipart en PUT. La ruta sigue siendo `/{recurso}/{id}`.

---

## 2. Mapa de endpoints

### Autenticación — `features/auth/services/auth.api.ts`

Dos niveles: lo que pide el navegador y lo que el BFF pide a Laravel.

| Del navegador al BFF | Payload | Respuesta |
|---|---|---|
| POST `/api/auth/login` | `{ email, password, remember?, turnstile_token? }` | `{ data: Usuario }` + cookie httpOnly |
| POST `/api/auth/logout` | — | 204, cookie borrada |

| Del BFF a Laravel | Payload | Respuesta que se espera |
|---|---|---|
| POST `/login` | `{ email, password, turnstile_token? }` | `{ data: { token, usuario } }` · 422 credenciales · 422 `turnstile` · 403 sin verificar · 429 (5/min por correo e IP) |
| POST `/logout` | — (Bearer) | 204 · revoca **ese** token, no todos |

El resto pasa por el proxy sin trato especial, con el `Bearer` puesto (las de
registro, verificación y recuperación viajan **sin** sesión):

| Método | Ruta | Payload | Respuesta |
|---|---|---|---|
| GET | `/publico/categorias-negocio` | — | `{ data: {id,nombre}[] }` · el select "Tipo de negocio" del registro |
| GET | `/publico/planes` | — | `{ data: Plan[] }` · los mismos que `GET /planes`, ordenados por `precio_mensual`, para la sección de precios de la landing. **Sin sesión.** `planes` pasa a ser un slug reservado (`OnboardingService::SLUGS_RESERVADOS`) para que no choque con `/publico/{slug}` |
| POST | `/register` | ver abajo | `{ data: Usuario }` · **no abre sesión** |
| POST | `/email/verificar` | `{ id, hash, expires, signature }` (del enlace del correo) | 200 · **dispara el provisioning** |
| POST | `/email/reenviar` | `{ email }` | 200 `{ message, retry_after }` · 429 si hay cooldown |
| GET | `/user` | — | `{ data: Usuario }` · 401 si no hay sesión |
| POST | `/forgot-password` | `{ email, turnstile_token? }` | 200 · 422 `turnstile` · 429 (3/min por correo) |
| POST | `/reset-password` | `{ token, email, password, password_confirmation }` | 200 |
| PUT | `/user` | `{ nombre, apellido, telefono?, documento?, foto? }` | `{ data: Usuario }` · Mi perfil |
| PUT | `/user/password` | `{ password_actual, password, password_confirmation }` | 200 · 422 `errors.password_actual` si no cuadra |
| GET | `/user/whatsapp` | — | `{ data: WhatsappEquipo \| null }` · Mi perfil → Avisos por WhatsApp (Story 4.8b) |
| PUT | `/user/whatsapp` | `{ telefono }` | `{ data: WhatsappEquipo }` en `pendiente`, con un código nuevo · 422 `errors.telefono` si el formato no vale o el plan no admite más números |
| DELETE | `/user/whatsapp` | — | 204 · deja de recibir WhatsApp (el correo sigue) |

**Validación de Mi perfil:** `nombre` y `apellido` son obligatorios, de hasta
150 caracteres cada uno; se conservan íntegros y nunca se deducen de `name`.
Un apellido nulo al leer se muestra vacío. `telefono` es opcional/null y,
cuando se informa, tiene formato `+51` seguido de nueve dígitos. `documento`
es opcional/null, alfanumérico con guiones, de hasta 20 caracteres. La nueva
contraseña exige al menos ocho caracteres, confirmación y ser distinta de la actual.

**Foto — decisión A, 2026-09-28 (FR-6 parcial):** el panel muestra el avatar
existente solo en lectura y explica que la subida está pendiente. Al guardar
otros datos **omite `foto`**, conservando su valor actual. El endpoint acepta
una cadena de hasta 255 caracteres o null, pero no ofrece aún una subida de
archivo. No se envían URLs temporales `blob:`. La subida queda pendiente.

**Avisos por WhatsApp del equipo (Story 4.8b, AD-22).** Cada persona del
equipo activa su número escribiendo un código al **número del equipo** de la
plataforma: así se prueba que el número es suyo (consentimiento verificado) y
la conversación es de ida y vuelta. Hasta entonces no recibe nada.

```jsonc
// WhatsappEquipo
{
  "telefono": "+51911111111",
  "estado": "pendiente",              // pendiente | activo
  "codigo": "482913",                 // solo en pendiente; vence a las 24 h
  "codigo_vence_at": "2026-11-11T15:00:00Z",
  "numero_plataforma": "+51900000001", // el número del equipo activo, o null si no hay
  "enlace": "https://wa.me/51900000001?text=ACTIVAR%20482913", // null sin número o ya activo
  "activado_at": null
}
```

- `PUT` con un teléfono nuevo **vuelve a `pendiente`** con otro código (cambiar
  de número exige volver a activar). Con el mismo teléfono y ya activo, no
  cambia nada.
- Cuántos números del equipo puede tener un negocio lo pone el plan
  (`max_numeros_equipo`: Básico 1, Premium 3, Pro 10). Contados: `pendiente`
  y `activo`.
- La persona puede darse de baja también respondiendo **BAJA** por WhatsApp.
- El teléfono va con `+51` y nueve dígitos, como en `PUT /user`; es el de
  WhatsApp y puede ser distinto del de la ficha.

**Los dos "restablecer contraseña" no son el mismo.** `/forgot-password` +
`/reset-password` son para quien **no puede entrar**: van por correo y no
piden nada más. `PUT /user/password` es para quien **ya está dentro** y exige
la **contraseña actual**: sin eso, cualquiera que se siente frente a una
sesión abierta se queda con la cuenta.

Al cambiarla, el backend debe **revocar los demás tokens** del usuario y
conservar el actual: es lo que se espera cuando alguien la cambia porque
sospecha que entraron a su cuenta. Cerrar también la sesión desde la que se
hace el cambio sería castigar al que hace lo correcto.

**El email no se edita en Mi perfil** (v1). Es el identificador del login y es
único global: cambiarlo obliga a poner `email_verified_at` a null y repetir la
verificación, con el usuario a medias mientras tanto. El campo se muestra
deshabilitado y con la razón escrita al lado.

⚠️ **`profesionales.nombre`, `foto` y `telefono` son copias denormalizadas**
de `users` (así lo dice la migración: *"denormalizado p/ mostrar sin ir a
central"*). `PUT /user` **tiene que propagarlas** en la misma transacción, o
el dueño cambia su nombre y en Empleados y en la tienda pública sigue el
viejo.

**Cooldown de `/email/reenviar`.** El reenvío está limitado **por correo** (uno
cada 60 s, 5 por hora), no solo por IP: si no, el formulario sirve para
reventar la bandeja de un tercero. Los segundos que faltan viajan en
`retry_after`, y vienen **tanto en el 200 como en el 429**, para que la cuenta
atrás del botón no tenga que adivinar nada:

```jsonc
// 200
{ "message": "Si el correo está registrado, enviamos un nuevo enlace.", "retry_after": 60 }
// 429
{ "message": "Ya enviamos un enlace hace poco. Espera un momento antes de pedir otro.", "retry_after": 46 }
```

El límite se cuenta **antes** de mirar si el usuario existe, así que el 429
tampoco revela qué correos están registrados. El 200 sigue sin significar que
la cuenta exista.

> `remember` no llega a Laravel: lo consume el BFF para decidir si la cookie
> dura 30 días o muere con la pestaña.
>
> `X-Tenant` sale de `usuario.negocio.id` en la respuesta del login. Si el
> backend prefiere resolver el inquilino desde el token, la cabecera sobra y se
> quita del proxy.

### Registro y onboarding — flujo decidido

```
registro (`slug NULL`) → verificar correo → PROVISIONING de la BD del tenant
→ primer login → panel con checklist de onboarding
→ la primera tarea fija el slug definitivo → resto de tareas
```

El provisioning se dispara **al verificar el correo**, no al completar el
onboarding: cuando el usuario hace su primer login, su BD ya existe y el panel
funciona entero.

**`POST /register`** — el formulario **no pide el nombre del negocio**; el
tenant nace **sin slug** (`slug NULL`), y el paso 1 del onboarding lo fija. Su
BD la nombra el `id` del tenant, aleatorio e inmutable, que sí existe desde el
registro. Payload:

```jsonc
{
  "tipo_negocio_id": 3,          // de GET /publico/categorias-negocio
  "rango_profesionales": "3-5",  // "independiente" | "2" | "3-5" | "6-15" | "+16"
  "nombre": "María",
  "apellido": "Quispe",
  "email": "maria@correo.pe",
  "telefono": "+51987654321",    // el frontend normaliza al formato internacional
  "password": "…",
  "password_confirmation": "…",
  "acepta_terminos": true,       // la casilla obligatoria del formulario
  "terminos_version": "1.0"      // VERSION de web/src/features/legal/terminos.ts
}
```

**La constancia de los términos.** `acepta_terminos` se valida `accepted` y
`terminos_version` `required|string|max:20`; si falta cualquiera de los dos →
422 con `errors` en ese campo (el formulario los pinta bajo la casilla). Se
guarda en el `users` dueño: `terminos_version`, `terminos_aceptados_at` (la hora
del servidor, no una que mande el cliente) y `terminos_ip`. Es lo que prueba
qué versión aceptó cada negocio y cuándo; cuando el texto cambie de fondo, sube
la versión y queda claro quién aceptó cuál.

Crea en la misma transacción el `tenants` (`slug NULL`, plan de prueba,
`estado='registrada'`) y el `users` dueño, y envía el correo de verificación.
`Usuario.name` se emite como `nombre + apellido`.

**Onboarding** (autenticado, ver [`vistas/onboarding.md`](vistas/onboarding.md)):

| Método | Ruta | Payload | Respuesta |
|---|---|---|---|
| GET | `/onboarding` | — | `{ data: Onboarding }` |
| POST | `/onboarding/nombre` | `{ nombre }` | `{ data: { nombre, slug } }` · fija el **slug inicial**; repetirlo → 422. Renombrar el negocio no lo cambia; cambiarlo es `PUT /configuracion/direccion` (Story 6.1) |
| PUT | `/onboarding/pasos/{clave}` | — | `{ data: Onboarding }` · solo claves marcables desde el cliente (`sitio_publico`) |

Los demás pasos los marca **el backend como efecto lateral** del endpoint que
corresponda (guardar horario, crear profesional, crear servicio, crear cita);
el checklist solo lee.

⚠️ **Mientras `nombre_negocio` no esté completado, la tienda pública está
apagada**: sin slug no hay URL de tienda que repartir, y `/publico/{slug}`
responde 404.

### CRUD estándar — generado por `crearRecurso()`

Cada recurso de esta tabla expone las **seis** operaciones de siempre:

```
GET    /{path}                 ?page&per_page&search[&filtros]   → paginado
GET    /{path}?per_page=200                                      → para selects
GET    /{path}/{id}                                              → { data: T }
POST   /{path}                                                   → { data: T }
PUT    /{path}/{id}    (o POST + _method=PUT si sube archivos)   → { data: T }
DELETE /{path}/{id}                                              → 204
```

| Recurso | `path` | FormData | Busca por | Filtros | Notas |
|---|---|---|---|---|---|
| Clientes | `clientes` | no | nombre, apellido, teléfono, email | — | soft delete; el teléfono es único |
| Citas | `citas` | no | nombre, apellido o teléfono del cliente | `fecha`, `desde`, `hasta`, `estado` | `DELETE` borra de verdad (no soft delete) |
| Servicios | `servicios` | **sí** | nombre | `categoria_id` | soft delete |
| Categorías | `categorias-servicios` | **sí** | nombre, descripción | — | |
| Usuarios | `usuarios` | no | nombre, apellido, email | — | solo el administrador general (403 al resto) |
| Profesionales | `profesionales` | **sí** | nombre, cargo, email de su cuenta | — | soft delete; el listado adjunta `resumen` y respeta el alcance de sedes. Con alcance por sedes, el `DELETE` de alguien habilitado también en una sede ajena da **403 `sin_permiso`**: la baja se lo lleva de todas, y eso lo decide el administrador general; en la suya se apaga con el interruptor (1.8, decidido el 2026-10-31) |
| Roles | `roles` | no | nombre | — | leer: cualquiera; escribir: solo el administrador general. El listado adjunta `modulos` |
| Locales | `locales` | **sí** | nombre, dirección | — | `es_principal` NO se acepta en el payload |
| Grupos | `grupos` | no | nombre | — | |
| Inventario | `inventario` | no | nombre, descripción | — | |
| Tickets | `soporte/tickets` | no | asunto, mensaje | `estado` | solo `index` + `store` |
| Plantillas WhatsApp | `plantillas-whatsapp` | no | nombre, contenido | — | `store` es `updateOrCreate` por evento |

**Tickets**: el negocio solo lista y crea. Responder, cambiar estado o asignar
agente es del panel de soporte (otra app), así que `PUT` y `DELETE` de
`soporte/tickets` no se llaman aunque la fábrica los genere.

**Plantillas WhatsApp**: la tabla tiene índice único `(negocio_id, evento)`.
`POST` sobre un evento que ya existe debe **reemplazar** la plantilla, no
duplicarla.

### Endpoints derivados y de acción

| Método | Ruta | Query / payload | Respuesta | Consumidor |
|---|---|---|---|---|
| GET | `/dashboard` | — | `{ data: ResumenDashboard }` | Dashboard (una sola request para los 4 widgets) |
| GET | `/citas` | `?fecha=YYYY-MM-DD&per_page=200` | `{ data: Cita[] }` | Calendario (día) y selector de huecos |
| GET | `/citas` | `?desde=YYYY-MM-DD&hasta=YYYY-MM-DD&per_page=200&page` | `{ data: Cita[], meta }` | Calendario de v2 (mes, semana, lista). Ambas incluidas y opcionales; `hasta ≥ desde` y como mucho **62 días**, si no 422 en `hasta` |
| GET | `/capacidades` | — | `{ data: Capacidades }` | **el menú y los botones**: lo que puede hacer quien mira, ya resuelto |
| GET | `/profesionales/resumen` | — | `{ data: ResumenPlanProfesionales }` | tarjeta "Profesionales activos en tu plan" |
| POST | `/usuarios/{id}/invitacion` | — | `{ message }` | reenviar la invitación |
| POST | `/invitacion/aceptar` | `{ token, email, password, password_confirmation }` | `{ message }` | **público**. Broker propio, 7 días — NO es `/reset-password` |
| GET | `/locales/{localId}/profesionales` | — | `{ data: LocalProfesional[] }` | una fila por CADA profesional del negocio, tenga o no asignación. Con alcance por sedes, solo los que ya tienen fila en alguna de sus sedes (1.8) |
| GET | `/locales/{localId}/servicios` | `?search&page&per_page` | `{ data: LocalServicio[], meta }` | **Story 2.1.** Todo el catálogo vivo, cada servicio con su estado en **esta** sede. `locales: ver`; sede fuera del alcance → 404 |
| PUT | `/locales/{localId}/servicios/{servicioId}` | `{ habilitado: bool }` | `{ data: LocalServicio }` | **Story 2.1.** Habilita o deshabilita el servicio en esta sede. `locales: gestionar` (sin él, 403 `sin_permiso`); sede fuera del alcance → 404 |
| PUT | `/locales/{localId}/profesionales/{profesionalId}` | ver §3 | `{ data: LocalProfesional }` | `syncWithoutDetaching`: asigna y edita. **Parcial**: el interruptor manda `{habilitado}` a secas. Con alcance por sedes, un profesional sin fila en ninguna de sus sedes da **404**: el administrador de sede no se trae a nadie de otra (1.8, decidido el 2026-10-31) |
| POST | `/inventario/{id}/movimiento` | `{ tipo, cantidad, motivo }` | `{ data: Producto }` | el backend recalcula `stock` |
| GET | `/caja?local_id` | — | `{ data: EstadoCaja }` | la caja de hoy de una sede (sin `local_id`, la principal); `puede:caja` |
| POST | `/caja/abrir` | `{ local_id, monto_inicial }` | `{ data: EstadoCaja }` 201 | 422 si queda otra abierta o la de hoy ya se cerró; `caja,gestionar` |
| POST | `/caja/cerrar` | `{ local_id, monto_contado }` | `{ data: EstadoCaja }` | guarda `efectivo_esperado` y `diferencia` |
| POST | `/caja/movimientos` | `{ local_id, tipo, monto, concepto, metodo? }` | `{ data: EstadoCaja }` 201 | a mano (insumos, luz…); exige caja abierta |
| GET | `/caja/historial?local_id&page` | — | `{ data: SesionHistorial[], meta }` | cajas cerradas, paginadas |
| GET | `/caja/historial/{id}` | — | `{ data: { sesion, movimientos, totales, pagos_qr } }` | |
| GET · PUT | `/caja/ajustes` | `{ exigir_captura?, tope_rebaja_pct? }` | `{ data: AjustesCaja }` | PUT con `configuracion,gestionar` |
| GET | `/citas/{id}/saldo` | — | `{ data: SaldoCita }` | total − cobrado − pago por QR − paquete |
| POST | `/citas/{id}/cobros` | multipart `{ monto, metodo, motivo?, operacion?, captura? }` | `{ data: SaldoCita & { sin_caja } }` 201 | otro monto que el saldo pide `motivo`; captura obligatoria en Yape/Plin si `exigir_captura` |
| POST | `/citas/{id}/rebaja` | `{ tipo: monto\|porcentaje, valor, motivo }` | `{ data: SaldoCita }` | `valor: 0` la quita; respeta `tope_rebaja_pct` |
| GET | `/caja/movimientos/{id}/captura` | — | imagen | URL firmada (30 min) que viene en `captura_url` |
| GET | `/configuracion` | — | `{ data: Configuracion }` | |
| PUT | `/configuracion` | **parche** de `Configuracion` (multipart si hay logo/cover) | `{ data: Configuracion }` | una petición por sección |
| GET | `/configuracion/direccion/disponible` | `?slug=` | `{ data: { disponible, motivo? } }` | Story 6.1. `motivo`: `formato` \| `reservado` \| `ocupado`; el texto lo pone el panel. Requiere `configuracion: gestionar` |
| PUT | `/configuracion/direccion` | `{ slug }` | `{ data: { slug, url } }` | Story 6.1. Cambia la dirección pública; la anterior **sigue llevando** a la tienda (ver «Tienda pública»). 422 en `slug` por formato, reservado u ocupado. Requiere `configuracion: gestionar` |
| GET | `/reportes` | `?desde&hasta` | `{ data: Reporte }` | todo el informe en una respuesta |
| GET | `/reportes/exportar` | `?desde&hasta` | **CSV** (`responseType: blob`) | con BOM, para que Excel lea los acentos |
| GET | `/suscripcion` | — | `{ data: Suscripcion }` | banner de prueba + Mi Plan |
| GET | `/planes` | — | `{ data: Plan[] }` | ordenados por `precio_mensual` |
| POST | `/plan/{planId}/solicitar` | `{ extra_profesionales, extra_whatsapp }` | 200 | **no cobra**: abre un ticket de soporte |

### Panel de plataforma — Story 8.4, bajo `/plataforma/*`

Su propia sesión (AD-12): un token de Sanctum de `platform_admins` con la
habilidad `plataforma`, que **solo** sale tras el segundo factor. Sin tenancy.
En tivu.v2 vive en la cookie `tivu_plataforma`, aparte de la del negocio.

| Método | Ruta | Payload | Respuesta |
|---|---|---|---|
| POST | `/plataforma/acceso/codigo` | `{ email, password }` | 202 `{ message, minutos }` y el código de 6 dígitos por correo. 422 en `email` si no coincide (sin decir qué falló) |
| POST | `/plataforma/acceso/verificar` | `{ email, codigo }` | `{ data: { token, admin: { id, nombre, email, rol } } }` (el BFF guarda el token y devuelve solo `admin`). 422 en `codigo`. Un código vale 10 min, una vez, 5 intentos |
| GET | `/plataforma/yo` | — | `{ data: admin }` |
| POST | `/plataforma/salir` | — | revoca el token |

- Una cuenta de **negocio** en `/plataforma/*` recibe **404** (y queda en el log). El token de plataforma en el panel de un negocio, también 404.
- Cada acción de plataforma deja huella en `soporte_acciones` (quién, qué, sobre qué negocio, cuándo).
- Crear un administrador: `php artisan plataforma:crear-admin correo --nombre= --rol=superadmin|soporte`.

### Negocios y pagos desde plataforma — Story 8.5

Mismo token y misma guardia que la 8.4. Toda acción pide **motivo** (salvo
registrar un pago), pasa por `SuscripcionService` (queda en `suscripcion_cambios`)
y se anota en `soporte_acciones`. El historial **no se edita**: no hay rutas para eso.

| Método | Ruta | Cuerpo | Respuesta |
|---|---|---|---|
| GET | `/plataforma/resumen` | — | `{ data: { negocios: { total, activos, prueba, por_confirmar, vencidos, suspendidos, prueba_termina_semana, nuevos: {actual, anterior} }, por_plan: [{clave, nombre, total}], cobrado: {actual, anterior}, pagos_por_confirmar, citas: {actual, anterior}, vencimientos: [fila] } }`. Métricas de plataforma: estados como en la lista; «actual» = del 1 a hoy, «anterior» = mismo tramo del mes pasado. `cobrado` = pagos `pagado` por `fecha_pago`. `citas` sin canceladas, sumando la base de cada negocio. `por_plan` sin suspendidos, «En prueba» aparte. `vencimientos`: los 4 más próximos sin suspendidos |
| GET | `/plataforma/negocios?search&plan&estado&page&per_page` | — | `{ data: [fila], meta }`. `search` mira nombre, dirección, correo y titular. `plan` es el slug. `estado`: `prueba · activo · por_confirmar · vencido · suspendido` |
| GET | `/plataforma/negocios/{id}` | — | `{ data: ficha }` |
| POST | `…/{id}/plan` | `{ plan, meses (1–12), motivo, pago_id? }` | `{ data: ficha }`. Activa el plan desde hoy |
| POST | `…/{id}/prueba` | `{ dias (1–7), motivo }` | `{ data: ficha }`. La prueba no pasa de 14 días |
| POST | `…/{id}/pagos` | `{ plan, meses, monto, metodo: yape·plin·transferencia·efectivo·otro, fecha_pago (≤ hoy), nota? }` | 201 `{ data: ficha }`. El pago queda `por_confirmar` |
| POST | `…/{id}/suspender` | `{ motivo }` | `{ data: ficha }`. S-3 al titular **con el motivo** |
| POST | `…/{id}/reactivar` | `{ hasta (≥ hoy), motivo }` | `{ data: ficha }`. Solo si está suspendido; sin pago. S-4 al titular |
| GET | `/plataforma/pagos?estado=por_confirmar·confirmado·rechazado` | — | `{ data: [pago + negocio], meta }`, 30 por página |
| POST | `/plataforma/pagos/{id}/confirmar` | — | `{ data: pago }`. Activa el plan del pago por sus meses; el pago queda `pagado` |
| POST | `/plataforma/pagos/{id}/rechazar` | `{ motivo }` | `{ data: pago }`. El motivo se suma a `nota` |

```jsonc
// fila (lista) — la ficha añade cambios, pagos, acciones y planes
{
  "id": "9b1f…", "nombre": "Barbería Pepito", "slug": "pepito", "tienda": "pepito.tivuapp.store",
  "rubro": "Barbería", "titular": "Pepe Ruiz", "correo": "pepe@…", "telefono": "+51…",
  "plan": { "slug": "premium", "nombre": "Premium" }, "fundador": false,
  "estado": "activo", "dias_restantes": 24,
  "sedes": 1, "profesionales": 3, "max_profesionales": 5, "citas_mes": 41, // null si su base aún no existe
  "alta": "2026-11-10", "vence": "2026-12-15",
  "cambios": [{ "id": 7, "tipo": "activar", "plan_anterior": "Prueba", "plan_nuevo": "Premium",
               "estado_anterior": "prueba", "estado_nuevo": "activa", "vence_anterior": "…", "vence_nuevo": "…",
               "pago_id": 12, "actor": "plataforma: Jean", "motivo": "…", "cuando": "ISO" }],
  "pagos": [{ "id": 12, "negocio_id": "9b1f…", "fecha": "2026-11-21", "plan": "Premium", "meses": 1, "periodo": "1 mes",
              "metodo": "yape", "monto": 149, "estado": "confirmado", "con_promo": false, "nota": null,
              "revisado_por": "plataforma: Jean", "revisado_el": "ISO" }],
  "acciones": [{ "accion": "cambiar_plan", "por": "Jean", "detalle": { … }, "cuando": "ISO" }],
  "planes": [{ "slug": "basico", "nombre": "Básico", "precio_mensual": 99 }]
}
```

El estado se calcula en este orden: suspendido → `por_confirmar` (tiene un pago
pendiente) → `vencido` (venció y no está suspendido) → `activo` → `prueba`.

### Planes y promociones editables — Story 8.7

| Método | Ruta | Cuerpo | Respuesta |
|---|---|---|---|
| GET | `/plataforma/planes` | — | `{ data: [plan], catalogo: [clave] }`. Todos los planes, también la prueba y los que no se venden, con `negocios` y `promo_cupos_usados` |
| PUT | `/plataforma/planes/{id}` | cualquiera de: `nombre, descripcion, precio_mensual, precio_anual, max_profesionales, max_sucursales, max_whatsapp_mes, max_numeros_equipo, max_correos_mes, precio_profesional_extra, precio_whatsapp_extra, mensajes_whatsapp_extra, promo_activa, precio_promo, promo_duracion_meses, promo_hasta, promo_cupos, features[], activo, destacado` | `{ data: plan }`. 422: `features.*` fuera del catálogo, la prueba no se vende, promo activa sin precio o sin meses |

**Reglas:**
- **Precio congelado.** El primer pago de un plan guarda su precio de lista en `tenants.precio_pactado` (y `precio_pactado_plan_id`). Si el equipo cambia el precio, ese negocio sigue con el suyo hasta cambiar de plan. El fundador congela el precio normal del día de su primer pago, así que tras la promo paga eso para siempre.
- **La promo se cierra sola** al pasar `promo_hasta` o al llenarse `promo_cupos` (negocios distintos que pagaron con promo). Quien ya la empezó, termina sus meses.
- **El seeder ya no pisa los planes** en cada despliegue: solo crea los que faltan. Los precios se cambian desde aquí.
- **Cada guardado** queda en `soporte_acciones` (`editar_plan`) con el antes y el después.
- **Límites y funciones valen EN EL ACTO** para todos los negocios del plan (2026-11-22, «planes sincronizados»); solo el precio se congela. Se leen del plan fresco en cada petición:
  - **Funciones → permisos:** `inventario` y `caja` dependen de su función (`Capacidades::MODULO_FUNCION`): sin ella, el módulo queda sin permiso (menú oculto, 403). `GET /capacidades` añade `funciones: [clave]` para que el menú esconda lo que el plan no trae (Promociones pide `promociones`).
  - **Sedes:** `max_sucursales` se cumple al crear o reactivar una sede: 422 en `plan` («Tu plan … incluye N sedes activas…»). Las que ya superen un límite rebajado no se apagan solas.
  - **WhatsApp a clientes:** cupo del mes = `max_whatsapp_mes` + `tenants.extra_whatsapp` (paquetes comprados) × `mensajes_whatsapp_extra`.
- **El catálogo** de funciones vive en `App\Support\CatalogoFunciones`: una función nueva se programa una vez y desde aquí se activa por plan.
- `GET /publico/planes` añade `promo_hasta`, `promo_cupos`, `promo_cupos_restantes` y `promo_abierta`. `GET /suscripcion` añade `precio_pactado`.

**Precios de lanzamiento (2026-11-22):** Básico S/ 30 · Premium S/ 45 · Plan Fundador = Premium a S/ 15 los 3 primeros meses, 30 cupos · extras S/ 5 por profesional y S/ 9 por 50 WhatsApp.

### Tienda pública — sin sesión, bajo `/publico/*`

| Método | Ruta | Query / payload | Respuesta |
|---|---|---|---|
| GET | `/publico/{slug}` | — | `{ data: { negocio, locales } }` |
| GET | `/publico/{slug}/sucursal/{sede}` | — | `{ data: TiendaLocal }` |
| GET | `/publico/{slug}/sucursal/{sede}/horarios` | `?profesional_id&fecha&duracion_min` | `{ data: string[] }` — `["09:00","09:45",…]` |
| POST | `/publico/{slug}/sucursal/{sede}/reservar` | `ReservaPayload` | `{ data: ReservaConfirmada }` |
| GET | `/publico/{slug}/reserva/{codigo}/pago` | `?f=` (firma) | Story 7.2: `{ data: { codigo, estado, vencida, negocio, citas, sede_slug, pago } }`. 404 si la firma no es suya |
| POST | `/publico/{slug}/reserva/{codigo}/comprobante` | multipart `{ f, captura, operacion? }` | Story 7.3: la misma forma que el GET, con `pago.estado: "comprobante_subido"`. 422 en `captura` (no es imagen, >5 MB, ya hay una en revisión o la reserva ya no espera pago). 429 por IP o por reserva |

#### Cobrar por adelantado con Yape (Épica 7, 7.1–7.3)

- **Configuración → Pagos:** `GET /configuracion/pagos` → `{ data: { modo, qr_url, instrucciones, plazo_minutos, plazo_minimo, plazo_maximo } }`; `POST /configuracion/pagos` (multipart: `modo`, `instrucciones`, `plazo_minutos` 15–240, `qr`, `qr_eliminar`). `modo`: `no_pedido` \| `opcional` \| `obligatorio`. Los dos últimos exigen QR e instrucciones (422 en cada campo). Requiere `configuracion: gestionar` para guardar.
- **En la tienda:** `negocio.pagos` (en `/publico/{slug}` y en la sede) = `{ modo, qr_url, instrucciones, plazo_minutos }`, o `null` si no pide pago.
- **Reservar:** `pago: "ahora" | "local"`. Con `opcional` es obligatorio elegir; con `obligatorio`, `"local"` da 422. Si paga ahora, `ReservaConfirmada.pago = { estado, monto, pagar_hasta, qr_url, instrucciones, firma, url }`: el plazo es el de pago (no hay confirmación por correo), sale la P-1 en lugar de la C-11 y, con pago obligatorio, no se ofrecen horas antes de «ahora + plazo + 15 min».
- **Story 7.4 (panel):** `GET /citas?pago=por_verificar`. Cada cita trae `pago: { eleccion, estado, pagar_hasta, monto, operacion, subido_el, rechazo_motivo, comprobante_url, tardio }` (null si no eligió). `comprobante_url` es firmada (30 min) y relativa: `GET /citas/{id}/comprobante?expires&signature` con `pagos: ver`. Acciones con `pagos: gestionar` (403 `sin_permiso`): `POST /citas/{id}/pago/aprobar` → confirmada + P-4; `POST …/pago/otra-captura {motivo}` → sigue reservada con plazo nuevo + P-5; `POST …/pago/rechazar {motivo}` → cancelada + P-8. Devuelven `{ data: Cita[] }` (las de la reserva). 422 en `pago` si no hay captura por verificar, en `motivo` si falta. Al vencer sin captura: P-6 al cliente y al dueño.
- **Story 7.6:** cancelar una cita pagada (por cualquier camino) la deja con `pago.devolucion = { estado: "pendiente", nota, el }` y P-7 a quien gestiona pagos; `POST /citas/{id}/devolucion {nota}` la marca `hecha` (no se edita después). Pago tardío (`pago.tardio`): `POST /citas/{id}/pago/rescatar` (422 si la hora ya no está) o `POST /citas/{id}/pago/devolver` (verificado + devolución pendiente). En «Gestionar mi cita», `pago: { estado, monto, devolucion }`; en la página de pago, `pago.devolucion`. Reprogramar no toca el pago.
- **La captura** va al disco privado del negocio (nunca pública). `estado_pago`: `pendiente` → `comprobante_subido` (P-2 al cliente, P-3 a quien verifica). Con la captura subida la reserva no caduca; si vence sin ella, se cancela con «No se pagó a tiempo» y aún la admite (`vencida: true`, rescate de la 7.6).

#### Reservar desde la tienda (Story 6.6)

```json
// POST /publico/pepito/sucursal/balta/reservar
{
  "modo": "unica",                      // "unica": una cita seguida · "separada": una por servicio
  "servicios": [
    { "id": 2, "cantidad": 1, "profesional_id": null, "fecha": "2026-11-20", "hora_inicio": "10:00" }
  ],                                    // profesional_id null = cualquiera: lo asigna el servidor
  "cliente_nombre": "Lucía", "cliente_apellido": "Ramos",
  "cliente_telefono": "987654321",      // celular peruano de 9 dígitos (+51 se acepta)
  "cliente_email": "lucia@correo.pe", "cliente_documento": null, "notas": null,
  "acepta_privacidad": true,            // obligatoria (Ley 29733)
  "acepta_whatsapp": false              // opcional, nace desmarcada
}
// 201
{ "data": { "codigo": "K7M2P9QX", "modo": "unica", "estado": "pendiente", "total": 25,
  "confirmar_hasta": "2026-11-12 10:30",  // Story 6.7: hora del negocio
  "citas": [{ "id": 31, "codigo": "K7M2P9QX", "servicio": "Corte", "profesional": "Ana",
              "fecha": "2026-11-20", "hora_inicio": "10:00", "hora_fin": "10:30" }] } }
```

- La cita entra **`pendiente`**, con `canal = tienda` y sin autor. Al equipo
  no le llega nada hasta que se confirme (4.5); el correo para confirmarla es
  la 6.7.
- Mismo anti-solape que el panel, en una transacción: si una de las citas no
  cabe, no se guarda ninguna ni la ficha del cliente.
- La ficha se busca por teléfono o se crea. De una que ya existe no se cambia
  el nombre; se completa el correo y el documento si faltaban, se anota
  `privacidad_aceptada_at` y, si marcó la casilla, el consentimiento de
  WhatsApp (desmarcarla no quita uno anterior: para eso está BAJA).
- Sin profesional elegido atiende el libre con **menos citas ese día**.

| Respuesta | Cuándo |
|---|---|
| 201 | reservada |
| 422 `errors.hora_inicio` | la hora ya no está libre o ya pasó: la tienda refresca las horas |
| 422 en los datos | `cliente_*`, `acepta_privacidad`: se pintan en su campo |
| 404 `no_reservable` | un servicio oculto o que nadie presta en la sede: la tienda refresca el catálogo |
| 422 `turnstile` | falta el token de Turnstile o no vale (si el backend lo tiene encendido) |
| 429 | más de 5 por minuto o 20 por hora desde la misma IP **en esa tienda**, o más de 5 por hora con el mismo celular en esa tienda |

#### Confirmar la reserva desde el correo (Story 6.7)

La reserva de la tienda queda `pendiente` con un plazo (`confirmar_hasta`) y
el cliente recibe el correo C-11 con el botón «Confirmar mi reserva»:
`{slug}.tivuapp.store/reserva/{codigo}?f={firma}`. La página llama a:

```json
// POST /publico/pepito/reserva/K7M2P9QX/confirmar   { "f": "<firma del correo>" }
{ "data": {
  "resultado": "confirmada",            // "confirmada" · "ya_confirmada" · "expirada"
  "negocio": "Barbería Pepito",
  "cita": { "codigo": "K7M2P9QX", "servicio": "Corte", "profesional": "Ana", "sede": "Balta",
            "fecha": "2026-11-12", "hora_inicio": "11:30" },
  "sede_slug": "balta"                  // para «Reservar de nuevo»
} }
```

- `confirmada`: pasó a confirmada ahora; salen la C-3 al cliente y el primer
  «Nueva cita» al equipo (4.5a). `ya_confirmada`: abrirlo otra vez no cambia
  nada. `expirada`: venció el plazo (si la tarea aún no la había cancelado, se
  cancela ahí mismo).
- 404 si el código no existe o la firma no es suya. Tope de 20 por minuto.
- Plazo: `agenda.plazo_confirmacion_min` (30 por defecto, 15–120). Nunca
  termina a menos de 15 min de la cita, y `/horarios` no ofrece horas antes de
  «ahora + plazo + 15 min» (la reserva lo vuelve a comprobar: 422
  `hora_inicio`).
- Al vencer, la cita se cancela, el hueco se libera y el cliente recibe la
  C-12 con «Reservar de nuevo». El equipo no recibe nada.

#### Gestionar mi cita (Story 6.8, con la política de la 6.9)

El enlace de los correos y WhatsApp: `{slug}.tivuapp.store/mi-cita/{secreto}`
(40 caracteres; en la base solo su sha256; sin ids). Caduca 7 días después de
la cita y se puede revocar.

| Método | Ruta | Qué |
|---|---|---|
| GET | `/publico/{slug}/mi-cita/{secreto}` | ver; no cambia nada |
| GET | `/publico/{slug}/mi-cita/{secreto}/horarios?fecha` | horas a las que la puede mover (mismo profesional y duración) |
| POST | `/publico/{slug}/mi-cita/{secreto}/reprogramar` | `{ fecha, hora_inicio }` |
| POST | `/publico/{slug}/mi-cita/{secreto}/cancelar` | — |
| POST | `/publico/{slug}/mi-cita/{secreto}/baja-recordatorios` | — · Story 4.6a: deja de recibir recordatorios (C-8, C-9); lo esencial le sigue llegando. El GET trae `recordatorios: bool` y el correo del recordatorio enlaza con `#recordatorios` |

```json
{ "data": {
  "situacion": "activa",            // "activa" · "fuera_de_plazo" · "cancelada" · "pasada"
  "estado": "confirmada",
  "puede_cambiar": true,
  "politica": "15 minutos",         // hasta cuándo antes puede cambiarla
  "cita": { "codigo": "K7M2P9QX", "servicio": "Corte", "profesional": "Ana", "sede": "Balta",
            "direccion": "Av. Balta 123", "fecha": "2026-11-16", "fecha_texto": "Lunes 16 de noviembre",
            "hora_inicio": "11:30", "hora_fin": "12:00", "monto": 25 },
  "negocio": { "nombre": "Barbería Pepito", "telefono": "+51 955 555 555", "whatsapp": "955555555" },
  "sede_slug": "balta"
} }
```

- Reprogramar y cancelar devuelven la misma forma, ya actualizada.
- 422 `hora_inicio`: la hora no está libre o está dentro del plazo. 422
  `cita`: ya no se puede cambiar (cancelada, pasada o fuera de plazo).
- 404 si el secreto no existe. 410 `{ codigo: "caducado"|"revocado", negocio }`
  sin datos de la cita.
- Mover anota `cita.modificada` con el cliente como actor (C-5 al cliente,
  «Te movieron una cita» al profesional). Cancelar: C-6 al cliente, «Se liberó
  tu hueco» al profesional y C-6D «… canceló su cita» al dueño.

**`{sede}` es el slug de la sede, único dentro de su negocio** (`balta`;
Story 6.2, PRD FR-81). Se acepta también un slug **antiguo** de esa sede y, en
transición, su **id numérico**: en los dos casos la respuesta trae en
`local.slug` el **vigente** y la página redirige con 308 (permanente). Una sede inexistente,
inactiva, borrada o de otro negocio responde el **mismo 404** que la tienda
(Story 6.1). Direcciones de las páginas: `{slug}.tivuapp.store/{sede}` y
`/reservar/{slug}/{sede}`; la antigua `/reservar/{slug}/sucursal/{id}` redirige
a la de slug.

**El catálogo de la sede** (Story 6.3, FR-37) sale de la regla única de la
Épica 2 (`Reservabilidad`): solo los servicios que se pueden reservar **en
esa sede** y además `visible_publico`. Un servicio oculto, inactivo, borrado,
no habilitado en la sede o sin nadie que lo preste ahí **no sale**. Por
categoría (`orden`, nombre); los servicios por nombre; sin categoría —o con la
categoría desactivada— en «Otros servicios» (`id: null`), al final. Precio: el
del servicio, como **número** JSON. Los profesionales, por nombre. **Todo
servicio de `categorias` está en el `servicios` de al menos un profesional**:
salen de las mismas combinaciones reservables. **Fotos apagadas hasta la Story 5.2** (`imagen_principal: null`,
`galeria: []`, `foto_url: null`): sus URLs llevan hoy el id del negocio.

Estos endpoints **no comparten middleware con el panel**: no llevan sesión, no
exponen costes ni estados internos, y el `slug` del negocio es el que resuelve
el tenant (igual que el `Route::domain` del Laravel anterior).

Mientras el negocio no haya completado el paso `nombre_negocio` del onboarding
(el que fija el slug inicial), la tienda responde **404**: hasta entonces el
tenant no tiene slug.

#### Cómo se resuelve el negocio (Story 6.1)

- **Zona propia** en Laravel (`routes/publico.php`): sin `auth:sanctum`, sin
  sesión. Un `Authorization` que llegara se **ignora**.
- **El negocio sale del host, en el servidor.** Next saca el slug de
  `{slug}.tivuapp.store`, reescribe a `/reservar/{slug}/…` y la página pide
  `/api/publico/{slug}`. Ninguna cabecera, query ni cuerpo elige el negocio.
- **El BFF decide por el host** (AD-15): desde un host de tienda solo reenvía
  `/api/publico/*`, y **sin** `Authorization` ni `X-Tenant`; cualquier otra
  ruta responde 404.

| `GET /publico/{slug}` | Respuesta |
|---|---|
| slug vigente, negocio activo | 200 con la tienda |
| slug **anterior** del negocio | 200 con la tienda y `negocio.slug` = el **vigente**: la página redirige con 308 (permanente) a la dirección nueva |
| inexistente, reservado, negocio sin slug, eliminado o purgado, suspendido (cualquier estado que no sea `prueba` ni `activa`), sin base provisionada o con la tienda apagada en Configuración (`sitio_publico_activo`) | **404** con cuerpo idéntico en todos los casos: `{ "message": "No encontramos esta tienda.", "codigo": "tienda_no_encontrada" }`. No revela si el negocio existe. La pantalla «tienda no disponible» del suspendido llega con la Story 6.11 |

**Historial de direcciones.** Un slug que usó un negocio **no lo puede tomar
ningún otro nunca** (los enlaces viejos de WhatsApp llevarían a la tienda de
otro); el mismo negocio sí puede volver a uno suyo.

**Formato del slug** (para elegir uno nuevo): minúsculas, números y guiones; de
3 a 63 caracteres; sin guion al principio ni al final ni dos seguidos. Lo que se
escribe se recorta y se pasa a minúsculas antes de comprobarlo. Un slug antiguo
que no lo cumpla (antes se admitían dos letras) **sigue funcionando**: el formato
es para elegir, no para buscar. **Reservados** (los de AD-15): `www`, `api`,
`admin`, `app`, `mail`, `ftp`, `site`, `coolify`, `status`, `panel`,
`dashboard`, `soporte`, `ayuda`, `blog`, `docs`, `login`, `registro`,
`static`, `cdn`, `publico`, `planes`, `categorias-negocio`, `reservar`,
`tienda`, `cita`.

⚠️ **`tienda` no se puede quitar de esa lista.** El middleware de Next manda ahí
todo host de tienda que no nombra a un negocio (`tivuapp.store`,
`a.b.tivuapp.store`) y toda ruta `/reservar/{otro}` desde la tienda de un
negocio (`SLUG_INEXISTENTE` en `web/src/lib/tienda/host.ts`): con `tienda`
reservado eso es siempre «no encontrado».

**Imágenes (Story 5.2).** Con R2 configurado (`IMAGENES_BUCKET`), toda
`*_url` de imagen (logo, portada y sus anchos, fotos de sedes, profesionales,
categorías y servicios) es `https://img.tivuapp.com/{32 hex}.webp`: una clave
opaca, sin el id del negocio, servida por Cloudflare e inmutable (reemplazar
una imagen da otra URL). Sin R2, y para lo que aún no se movió con
`imagenes:a-r2`, sigue siendo `/api/archivos/{id-del-negocio}/…`. El frontend
no distingue: pinta la URL que llega.

Subidas: además de `image`, `mimes` y `max`, el tipo se comprueba **por firma**
(JPG, PNG, WebP o GIF; un SVG o un archivo renombrado da 422 «El archivo no es
una imagen JPG, PNG o WebP válida.») y hay un tope de **40 megapíxeles** (422
«La imagen es demasiado grande: hasta 40 megapíxeles…»). Lo guardado se
re-codifica a WebP sin metadatos.

---

## 3. Formas de datos

Notación: `?` = puede ser `null`. Todos los `id` son enteros.

### Usuario (sesión)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | int | |
| `name` | string | `nombre + apellido`, para pintar |
| `nombre` `apellido` | string, string? | **por separado**, que es como se editan en Mi perfil |
| `email` | string | |
| `telefono` | string? | |
| `documento` | string? | DNI del titular. Opcional |
| `avatar_url` | string? | |
| `rol` | `admin_general` \| `admin_local` \| `profesional` | el rol de **sistema**; los que cree el negocio, y `recepcion` (Story 1.5), se derivan a `profesional`. Renombrado el 2026-09-04: antes `dueno` y `admin` |
| `negocio` | `{ id, nombre, slug }`? | el tenant del usuario. **`id` es string**: el identificador aleatorio e inmutable del tenant (`yl9njvhq`), que nombra su base de datos y viaja como `X-Tenant` — no es un entero |

`negocio.nombre` y `negocio.slug` son **`null` hasta que el onboarding fije el
nombre**. El `slug` es lo que permite al panel construir el enlace de la
tienda (`{slug}.dominio` o `/reservar/{slug}`): sin él, el paso 6 del
checklist y el enlace del dashboard no tienen a dónde apuntar, así que va en
todas las respuestas que traen `Usuario` (`POST /login` y `GET /user`).

### Onboarding

Estado del checklist de entrada. Vive en `tenants.onboarding_pasos` (JSON).

```jsonc
// GET /onboarding
{
  "data": {
    "completado": false,           // true cuando los 6 pasos lo están
    "pasos": [                     // el orden del array es el del checklist
      { "clave": "nombre_negocio",     "completado": true },
      { "clave": "horario_local",      "completado": false },
      { "clave": "primer_profesional", "completado": false },
      { "clave": "primer_servicio",    "completado": false },
      { "clave": "reserva_prueba",     "completado": false },
      { "clave": "sitio_publico",      "completado": false }
    ]
  }
}
```

Las etiquetas y descripciones de cada paso las pone el frontend (patrón
declarado: el backend manda claves). Quién marca cada paso:

| Clave | La marca |
|---|---|
| `nombre_negocio` | `POST /onboarding/nombre` |
| `horario_local` | `PUT /configuracion` con horario informado |
| `primer_profesional` | `POST /profesionales` |
| `primer_servicio` | `POST /servicios` |
| `reserva_prueba` | `POST /citas` (o una reserva pública) |
| `sitio_publico` | el cliente, con `PUT /onboarding/pasos/sitio_publico` |

### Cliente

| Campo | Tipo | Notas |
|---|---|---|
| `id` `nombre` | int, string | |
| `telefono` `email` | string? | hay clientes solo con teléfono |
| `apellido` `documento` | string? | los pide la reserva pública |
| `fecha_nacimiento` `notas` | string? | |
| `total_citas` | int | `withCount` |
| `ultima_cita` | string? | fecha de la más reciente |
| `acepta_whatsapp` | bool | marcó «Recibir avisos por WhatsApp» (Story 4.8c). Vuelve a `false` si después respondió BAJA |
| `correo_estado` | `"rebotado" \| "queja" \| null` | Story 4.3: su correo no recibe (rebote duro o lo marcó como spam). No se le escribe mientras lo tenga; se borra al cambiar el `email` |

**Payload**: `{ nombre, telefono?, email?, acepta_whatsapp? }`.

> **La casilla de WhatsApp** (Story 4.8c, Ley 29733) nace desmarcada y se
> marca solo si el cliente lo aceptó. Sin la clave en el payload, no se toca;
> `true` guarda cuándo y por dónde (`panel` o `tienda`), `false` la retira.
> Solo se le escribe con la cita **confirmada**, desde el número de clientes de
> tivu, y si su teléfono se entiende como internacional (un móvil peruano de 9
> dígitos recibe el +51; un número con `+` se deja). Si responde **BAJA**, deja
> de recibir WhatsApp de **todos** los negocios —el chat es uno solo—; volver a
> marcar la casilla es un consentimiento nuevo.

> **El teléfono es la clave natural.** Se guarda tal cual se escribe, pero el
> backend mantiene aparte un `telefono_normalizado` UNIQUE (dígitos sin
> prefijo país) que **no sale de la API**: la reserva pública hace
> `firstOrCreate` por teléfono, y sin normalizar, `904169872` y `904 169 872`
> serían dos fichas de la misma persona con medio historial cada una.
>
> Por eso `POST /clientes` puede responder
> `422 { errors: { telefono: ["Ya existe un cliente con ese teléfono."] } }`.
>
> Borrar es **soft delete** —las citas lo referencian—, y volver a dar de alta
> el mismo teléfono **restaura la ficha con su historial**.

### Categoría de servicio

| Campo | Tipo | Notas |
|---|---|---|
| `id` `nombre` | int, string | |
| `descripcion` `color` | string? | color = círculo cuando no hay imagen |
| `orden` | int | menor número, más arriba |
| `imagen_url` | string? | |
| `servicios_count` | int | `withCount` |

**Payload (multipart)**: `{ nombre, descripcion, color, orden, imagen: File|null }`.

> `color` es nullable de verdad: el formulario lleva un botón de quitarlo,
> porque `input[type=color]` no sabe mandar vacío.
>
> `imagen` entra como archivo e `imagen_url` sale como URL; la columna guarda
> la **ruta**. No mandar `imagen` significa «déjala como está», nunca
> «bórrala».
>
> El `DELETE` responde 204 y **no borra los servicios**: la FK es
> `nullOnDelete` y se quedan sin categoría. El aviso «N servicios quedarán sin
> categoría» lo pinta el frontend con el `servicios_count` del listado.

### Servicio

| Campo | Tipo | Notas |
|---|---|---|
| `id` `nombre` | int, string | |
| `descripcion` | string? | |
| `color` | string | punto identificador en la tabla y bloque del calendario |
| `categoria` | `{ id, nombre }`? | objeto, no id |
| `tipo` | `normal` \| `sesiones` \| `clases` \| `paquete` | |
| `max_sesiones` | int? | solo `sesiones` y `paquete` |
| `duracion_min` | int | manda en el cálculo de huecos |
| `precio` | number | |
| `activo` | bool | |
| `imagen_principal` | string? | URL |
| `galeria` | `{ id, url }[]` | máximo 4 |
| `empleados` | `{ id, nombre }[]` | quién lo ofrece |
| `reservabilidad` | `{ reservable, sedes_sin_quien_lo_preste }` | Story 2.3, ver abajo. Solo de lectura |

`reservabilidad` dice si el servicio se puede reservar y, si no en todas sus
sedes, dónde falla — para que el dueño lo vea venir en vez de descubrirlo
porque un cliente no encuentra hueco (FR-21). Lo calcula la regla de
«reservable» (Story 2.2), en el mismo sitio que el guardado de citas:

```json
"reservabilidad": {
  "reservable": true,
  "sedes_sin_quien_lo_preste": [{ "id": 3, "nombre": "Sur" }]
}
```

| Campo | Notas |
|---|---|
| `reservable` | se puede reservar con al menos un profesional en al menos una sede (sin sedes: alguien activo, que atiende, lo presta). `false` también si el servicio está inactivo |
| `sedes_sin_quien_lo_preste` | sedes **activas** donde el servicio está **habilitado** pero ningún profesional puede prestarlo allí (nadie que lo preste, o quien lo presta no está habilitado, está de baja o no atiende). Vacío si el servicio está inactivo —su aviso es otro— o si el negocio no tiene sedes |

Al asignar un profesional que lo preste (o habilitarlo en la sede), el dato
cambia en la siguiente lectura: no hay que «activar» nada. Llega en el
`index`, el `show` y la respuesta de `POST`/`PUT`.

**Payload (multipart)**: `{ nombre, descripcion, color, categoria_id, tipo,
max_sesiones, duracion_min, precio, activo?, imagen_principal: File|null,
galeria: File[], galeria_conservar: number[], empleado_ids: number[] }`.

> **`galeria_conservar` son ids, no URLs** (cambiado el 2026-08-27). Casar por
> URL obliga al backend a revertir URL → ruta, y eso se rompe en silencio si
> cambia `APP_URL` o el disco — y lo que se pierde son las fotos del negocio.
> El backend borra las que no lleguen y añade los archivos nuevos.
>
> **Omitir el campo no borra nada**: que el formulario no lo mande no puede
> significar «bórralo todo». Lo mismo vale para `empleado_ids` (ausente = no se
> toca) y para `imagen_principal` (sin archivo = se queda la de antes). Es lo
> que permite que el switch de `activo` guarde reenviando solo los escalares.
>
> `activo` es opcional en POST y PUT, y se emite siempre. Lo cambia el switch
> de la tabla; el formulario no lo trae.
>
> El `DELETE` responde **204 también con citas**: es soft delete y
> `cita_servicio` congela precio y duración, así que el historial no cambia. Y
> como el UNIQUE de `nombre` no distingue los borrados, crear un servicio con
> el nombre de uno eliminado **restaura aquella fila**.

### Cita

| Campo | Tipo | Notas |
|---|---|---|
| `id` | int | |
| `codigo` | string | **público**: es el identificador que viaja por WhatsApp, y por el que gestiona su cita quien no tiene cuenta. Lo genera el backend al crear |
| `fecha` | `YYYY-MM-DD` | |
| `hora_inicio` `hora_fin` | `HH:MM` | **`hora_fin` lo calcula el backend** (inicio + duración) |
| `estado` | los **seis** de abajo | |
| `monto` | number | suma de las líneas de **servicio**. Editable: reescribe el precio congelado de la línea |
| `monto_total` | number | servicios **+ productos**. Es «lo que se cobra» |
| `notas` | string? | máx. 500 |
| `cliente_id` | int? | informado solo si quedó vinculada a un cliente |
| `cliente_nombre` | string | texto libre, máx. 150 |
| `cliente_telefono` `cliente_email` | string? | máx. 30 y 150 |
| `cliente_acepta_whatsapp` | bool | la casilla de WhatsApp **del cliente** (Story 4.8c): el diálogo la muestra como está |
| `cliente_correo_estado` | `"rebotado" \| "queja" \| null` | Story 4.3: el correo del cliente no recibe; el detalle avisa para llamarle |
| `servicios` | `LineaServicio[]` | **la fuente de verdad** |
| `servicio` | `LineaServicio?` | la primera línea, **como puente**. `null` si no hay ninguna |
| `empleado` | `{ id, nombre }` | no nullable |
| `local_id` | int? | la sede. Con una sola la pone el backend |
| `productos` | `{ producto_id, nombre, cantidad, precio_unitario }[]` | vendidos en la cita |
| `canal` | `"panel"` \| `"tienda"` | de dónde vino. Lo pone el backend: el panel no lo manda (Story 1.13) |
| `creada_por` | `{ id, nombre }?` | la cuenta del negocio que la registró. **`null`** si la puso el cliente desde la tienda, si es anterior a la 1.13, **o si esa cuenta se eliminó** (p. ej. al quitarle el acceso). En ese último caso el nombre sigue en el evento `creada` del historial, y la ficha lo toma de ahí |

`LineaServicio` es `{ id, nombre, duracion_min, precio, cantidad, color }`, y
**`duracion_min` y `precio` salen de la pivote, no del servicio**: son los que
tenía el día que se reservó. Cambiar la tarifa del catálogo no reescribe lo ya
agendado.

**Payload (JSON)**: `{ empleado_id, servicio_id, fecha, hora_inicio, local_id,
cliente_id, cliente_nombre, cliente_telefono, cliente_email, acepta_whatsapp?,
monto, estado, notas, productos: [{ id, cantidad }] }`. `acepta_whatsapp`
(Story 4.8c) se guarda en el cliente, no en la cita; sin la clave, no se toca. **`hora_fin` no se acepta**: aceptarla
dejaría reservar 20 minutos de un servicio de 60.

> Ojo con la asimetría: el payload manda `productos[i].id`, la entidad devuelve
> `productos[i].producto_id`.

#### Historial de la cita (Story 1.13)

```
GET /citas/{id}/historial?page&per_page   → { data: EventoCita[], meta }
```

Mismo permiso y mismo alcance que `GET /citas/{id}`: quien no ve la cita
recibe 404. Va del más antiguo al más reciente.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | int | |
| `tipo` | `"creada"` \| `"modificada"` | |
| `momento` | ISO 8601 | cuándo pasó |
| `actor` | `{ tipo, nombre }` | `tipo`: `usuario` · `cliente` · `sistema` · `plataforma`. `nombre` es el de ese momento (si luego se renombra, el historial no cambia); `null` si no hay a quién nombrar |
| `cambios` | `{ [campo]: { antes, despues } }` | solo en `modificada`. Vacío en `creada` |

Los campos que se anotan, y solo cuando cambian: `estado` (clave de los seis),
`fecha`, `hora_inicio`, `empleado`, `servicio` y `local` (por **nombre**, el de
ese momento) y `monto` (number). Cambiar solo las notas, el cliente o los
productos no deja evento. Etiquetas y colores los pone el frontend.

```jsonc
{ "id": 7, "tipo": "modificada", "momento": "2026-09-07T10:15:00-05:00",
  "actor": { "tipo": "usuario", "nombre": "Ana Torres" },
  "cambios": { "estado": { "antes": "pendiente", "despues": "confirmada" },
               "hora_inicio": { "antes": "10:00", "despues": "11:00" } } }
```

Borrar una cita también se anota, pero ya no hay ficha desde la que leerlo.
Los eventos viven en `eventos_dominio` (AD-8), la misma tabla de la que
leerán los avisos.

#### Los seis estados

`pendiente` · `confirmada` · `en_curso` · `completada` · `cancelada` ·
`no_asistio`. Son los del ENUM de la tabla y **el backend no los recorta**: el
bloque de inasistencias de Reportes es imposible sin `no_asistio`. Etiquetas y
colores los pone el frontend (`features/citas/constants.ts`).

#### Por qué `servicios[]` y no `servicio_id`

**No existe `citas.servicio_id`.** Los servicios de una cita viven en
`cita_servicio`. El panel manda uno y el backend inserta una línea, pero la
tienda pública encadenará varios en el Sprint 5. `servicio` sigue emitiéndose
como puente; **lo que hay que leer es el array**, porque el día que una cita
traiga tres el singular enseñará una cita a medias sin decirlo.

#### `monto` no es el total

`monto` son solo los servicios y `monto_total` incluye los productos. Es una
distinción de escritura, no de estética: el campo editable del formulario
reenvía `monto` al guardar, así que pintar ahí el total **subiría el precio del
servicio con el importe de lo vendido**. Para mostrar, `monto_total`; para el
campo editable, `monto`.

#### Opciones para agendar (`GET /citas/opciones`)

Requiere `citas: gestionar` y devuelve las proyecciones que necesita el
formulario, recortadas por el alcance de la cuenta y por `solo_propios`:

```json
{ "data": {
  "profesionales": {"data": [{"id": 1, "nombre": "Ana", "color": null, "horario": [], "excepciones": [], "servicios": [{"id": 2, "nombre": "Corte"}]}], "meta": {"current_page": 1, "last_page": 1, "per_page": 20, "total": 1}},
  "servicios": {"data": [{"id": 2, "nombre": "Corte", "duracion_min": 45, "precio": 30}], "meta": {"current_page": 1, "last_page": 1, "per_page": 20, "total": 1}},
  "locales": {"data": [{"id": 3, "nombre": "Principal", "es_principal": true}], "meta": {"current_page": 1, "last_page": 1, "per_page": 20, "total": 1}},
  "productos": {"data": [{"id": 4, "nombre": "Gel", "precio_venta": 12, "stock": 5}], "meta": {"current_page": 1, "last_page": 1, "per_page": 20, "total": 1}},
  "clientes": {"data": [{"id": 5, "nombre": "Luis Perez", "telefono": "999999999", "email": "luis@correo.pe", "acepta_whatsapp": true}], "meta": {"current_page": 1, "last_page": 1, "per_page": 20, "total": 1}},
  "agenda": {"modo_intervalo": "fijo", "intervalo_min": 15, "zona_horaria": "America/Lima"}
} }
```

`productos` solo se incluye con `inventario: ver`; `clientes` solo con
`clientes: ver` y acepta `?search=`. Los índices de gestión conservan sus
permisos propios. Todas las colecciones aceptan `?per_page=` (máximo 50) y
devuelven `meta`; clientes además acepta `?search=`. La respuesta no incluye
información de pago, comisión ni cuentas de profesionales.

**Búsqueda, ids y `solo` (Story 1.10).** Los selectores del formulario
buscan aquí en vez de traer listas enteras:

| Parámetro | Qué hace |
|---|---|
| `{coleccion}_search` | filtra esa colección por nombre (`profesionales`, `servicios`, `productos`, `clientes`). En clientes busca también apellido y teléfono; `search` a secas se sigue aceptando |
| `{coleccion}_ids` | `1,2,3`: solo esos. Para enseñar lo ya elegido aunque no esté en la primera página |
| `solo` | `profesionales,clientes`: solo esas colecciones. Lo usa cada búsqueda, para no recalcular las demás |
| `{coleccion}_page` | la página de esa colección (`profesionales_page=2`…): cada una pagina por separado. `page` a secas **no** vale aquí: devuelve siempre la 1 |
| `local_id` | la sede elegida en el formulario (Story 2.2): `profesionales` y `servicios` traen solo lo reservable **en ella**. Una sede fuera del alcance no da nada. `locales` sigue trayendo todas |

`profesionales` y `servicios` traen **solo lo reservable** (Story 2.2, ver
abajo): un profesional sale si tiene al menos un servicio que puede agendar en
alguna sede del alcance (o en la de `local_id`), un servicio si alguien puede
atenderlo en ella, y
los `servicios` de cada profesional son los que él puede agendar. `locales`
trae `es_principal`, y `clientes` trae `email` y `acepta_whatsapp`, para
rellenar en la cita su correo y la casilla de WhatsApp al elegir uno. Sin
`acepta_whatsapp` la casilla salía desmarcada y, al guardar, le quitaba el
consentimiento a quien ya lo había dado.

En un negocio **sin sedes** (así nace todo negocio) no se filtra por sede, y
`locales` viene vacío. `color` de cada profesional es `null` hasta que la ficha
lo tenga.

#### Qué es reservable (Story 2.2, FR-67)

Una sola regla, la misma para el guardado de citas y las opciones del panel.
La tienda y el enlace del cliente (épica 6) la usarán igual: ya están listas
la comprobación para la tienda y las horas libres que la aplican: la tienda
las pide en `GET /publico/{slug}/sucursal/{sede}/horarios` (Story 6.4, §5).
Servicio + profesional + sede es
reservable si y solo si:

1. el servicio está activo;
2. el profesional está activo y **atiende**;
3. el profesional presta ese servicio;
4. si la cita lleva sede: la sede está activa, ofrece el servicio
   (`local_servicio`) y tiene al profesional habilitado (`local_profesional`).
   Las tres cosas en **la misma** sede.

Sin sede, solo 1 a 3. Al crear una cita, o al editarla si cambia quién, qué,
dónde o cuándo, el panel recibe un **422 con el primer motivo**, en este orden:

| Motivo | Campo | Mensaje |
|---|---|---|
| profesional de baja | `empleado_id` | `La ficha de Rosa Paredes está dada de baja: no se le pueden agendar citas.` |
| servicio inactivo | `servicio_id` | `«Corte» está desactivado: no se puede agendar.` |
| profesional que no atiende | `empleado_id` | `Rosa Paredes no tiene agenda: su ficha no atiende citas.` |
| sede inactiva | `local_id` | `Esa sede está desactivada: no se le pueden agendar citas.` |
| profesional no habilitado en la sede | `empleado_id` | `Rosa Paredes no atiende en esa sede.` |
| la sede no ofrece el servicio | `servicio_id` | `«Corte» no se ofrece en esa sede.` |
| no presta el servicio | `servicio_id` | `Rosa Paredes no presta «Corte».` |

La tienda pública (épica 6) responde **404** sin decir el motivo: para un
desconocido, lo que no se puede reservar no existe.

#### `DELETE` borra de verdad

`citas` no lleva soft delete y las líneas caen en cascada. **Cancelar es un
estado**, y es lo que conserva el historial; borrar es para lo que nunca debió
existir. Si estaba completada, su stock vuelve antes.

#### `solo_propios` ya filtra

Desde el Sprint 4. Quien lo tiene ve solo sus citas, y la de otro responde
**404** —no 403—: para esa persona esa cita no existe, igual que una sede fuera
de su alcance. Quien tiene `solo_propios` y **no tiene ficha de profesional no
ve ninguna**: quien no atiende no tiene citas propias.

### Capacidades (`GET /capacidades`)

```json
{ "data": {
    "permisos": { "citas": "gestionar", "caja": null, "…": "los 15 siempre" },
    "solo_propios": true,
    "locales": null,
    "rol": { "clave": "recepcion", "nombre": "Recepción" }
} }
```

Lo que puede hacer quien está mirando, **ya resuelto**. Va aparte del
`Usuario` de `/login` por arquitectura: los permisos viven en la base del
negocio y el login se resuelve entero en la central.

- `permisos`: los 15 módulos siempre (desde la Story 1.6 incluye `pagos`), `null` donde no hay acceso.
  `gestionar` incluye `ver`.
- `solo_propios`: sobre **quién**, no sobre qué. **Ya filtra** (Sprint 4): el
  listado de citas devuelve solo las suyas y la de otro responde 404. Quien lo
  tiene y no tiene ficha de profesional no ve ninguna.
- `locales`: `null` = todas las sedes; una lista de ids = solo esas. `null` y
  no la lista completa, para que una lista **vacía** signifique de verdad
  ninguna.
- `rol`: `{ clave, nombre }` del rol **del negocio** (Story 1.11), o `null` sin
  cuenta en él. Es solo para mostrarlo —Mi perfil lo enseña—, nunca para
  decidir: lo que se puede hacer lo dicen `permisos`. Hace falta porque
  `Usuario.rol` es el rol **central**, que convierte a Recepción y a los roles
  propios en `profesional`. `nombre` es el que el negocio le haya puesto.

**Cualquier endpoint de un módulo sin acceso responde `403` con
`codigo: "sin_permiso"`.** Es 403 y no 404 a propósito: el recurso existe y
es de su negocio, lo que falta es permiso; el 404 se reserva para lo de otro
tenant. La pared de cobro gana: en un negocio suspendido sale
`suscripcion_vencida` aunque además falte el permiso.

> ⚠️ Los candados de `/usuarios` y `/roles` son un guardia aparte, no una
> capacidad de la matriz, y responden **403 sin `codigo`**. El panel trata
> cualquier 403 como falta de permiso por eso.

**Esconder una opción del menú NO es autorización.** El backend responde 403
igual; el menú sirve para no enseñar puertas cerradas.

### Usuario del negocio (una cuenta del panel)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | int | el de `usuarios` (tenant), **no** el del `users` central |
| `nombre` `apellido` | string, string? | |
| `email` | string | único **global** en toda la plataforma |
| `telefono` | string? | `+51` + 9 dígitos |
| `activo` | bool | |
| `rol_id` `rol` | int, `{id, nombre, clave}` | `clave` es `null` en los roles propios |
| `profesional` | `{id, nombre, atiende}`? | **`null`** en quien no presta servicios |

**Payload (JSON)**: `nombre`, `apellido`, `email`, `telefono`, `rol_id`,
`activo`. **Sin contraseña**, ni al crear ni al editar: la elige la persona
desde la invitación.

### Rol del negocio

| Campo | Tipo | Notas |
|---|---|---|
| `id` `nombre` | int, string | nombre único por negocio |
| `clave` | `admin_general` \| `admin_local` \| `profesional` \| `recepcion` ? | `null` en los que cree el negocio. `recepcion` desde la Story 1.5; `admin_local` se ve como «Administrador de sede» |
| `sistema` | bool | |
| `permisos` | `{ [modulo]: "ver"\|"gestionar"\|null }` | **los 15 siempre** |
| `solo_propios` | bool | |
| `editable` `borrable` `duplicable` | bool | **vienen resueltos**: no se deducen |
| `usuarios_count` | int? | solo en el listado. Cuenta cuentas, no fichas |

El listado adjunta **`modulos`** fuera de `data`: la lista completa y ordenada
para las filas de la matriz. Duplicar no es un endpoint — es leer y hacer
`POST` con otro nombre.

### Profesional

| Campo | Tipo | Notas |
|---|---|---|
| `id` `nombre` | int, string | el `id` es el de `profesionales`: el que usan las citas y los pivotes |
| `foto_url` | string? | si falta se pintan iniciales |
| `usuario` | `{id, email, activo, rol_id, rol}`? | su cuenta del panel. **`null` en quien no entra al sistema** |
| `cargo` | string? | texto libre |
| `telefono` | string? | `+51` + 9 dígitos |
| `activo` | bool | **lo que consume cupo del plan**: una fila activa es una plaza |
| `atiende` | bool | si sale en la tienda pública. **Y solo eso** |
| `tipo_pago` | `comision` \| `sueldo` \| `ambos` | |
| `comision_porcentaje` | number | |
| `monto_sueldo` | number? | solo si el tipo incluye sueldo |
| `periodo_pago` | `semanal` \| `quincenal` \| `mensual` ? | |
| `horario` | `DiaHorario[]` | |
| `excepciones` | `ExcepcionHorario[]` | |

```jsonc
// DiaHorario — uno por día de la semana
{ "dia": 1, "activo": true, "desde": "09:00", "hasta": "18:00",
  "breaks": [ { "desde": "13:00", "hasta": "14:00" } ] }

// ExcepcionHorario — permiso, emergencia o medio turno en una fecha
{ "fecha": "2026-08-10", "disponible": false,
  "desde": null, "hasta": null, "nota": "Permiso médico" }
```

**Payload (multipart)**: igual que la entidad, cambiando `foto_url` por
`foto: File|null` (+ `foto_eliminar`). **Sin email, sin rol y sin contraseña**;
para dar acceso al panel va un objeto opcional
`usuario: { email, rol_id }`, que solo sirve para **crear** la cuenta de quien
no la tiene. `horario` y `excepciones` viajan indexados:
`horario[0][dia]`, `horario[0][breaks][0][desde]`…

**`GET /profesionales/resumen`**: `{ profesionales_activos: int,
limite_profesionales: int }`. El listado lo adjunta además en `resumen`, junto
a `data` y `meta`.

### Local y su pivote

`Local`: `id`, `nombre`, `direccion?`, `descripcion_publica?`, `telefono?`,
`email?`, `latitud?`, `longitud?`, `color`, `horario_desde?`, `horario_hasta?`
(un solo rango, no por día), `banner_url?`, `logo_url?`, `es_principal` (el
local principal no se borra y se edita desde Configuración).

**Payload (multipart)**: lo mismo con `banner: File|null` y `logo: File|null`.

**`slug`** (Story 6.2, PRD FR-81): se deriva del nombre **al crear** la sede
(renombrarla no lo cambia). Se puede elegir al crearla con `slug` en el
`POST` y cambiar después con `slug` en el `PUT`. Único
dentro del negocio, contando los que tuvieron las demás sedes; el anterior
redirige para siempre. Formato: minúsculas, números y guiones, de 1 a 63, sin
guion al principio ni al final ni dos seguidos, y no solo números (chocaría
con el id, que la tienda también acepta); reservados `sucursal`, `cita`, `api`
e `images`. 422 en `slug` por formato, reservado u ocupado.

⚠️ **Cambio aprobado el 2026-09-19, pendiente de implementar** (PRD FR-82):
**`color`, `banner_url` y `logo_url` dejan de
emitirse y de aceptarse**: la identidad visual es del negocio (ver
Configuración → apariencia). Sus valores se trasladan al negocio según FR-82 y
se conservan sin uso hasta la portada por sede (FR-80, posterior).

`LocalServicio` — un servicio del catálogo y su estado en una sede (Story 2.1,
FR-21). El catálogo es **del negocio**; cada sede **habilita** los suyos.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | int | id del **servicio**, no de la pivote |
| `nombre` | string | |
| `categoria` | `{ id, nombre }?` | para agrupar en la tabla |
| `habilitado` | bool | si esta sede lo ofrece |
| `sin_quien_lo_preste` | bool | Story 2.3: **habilitado** aquí, servicio activo y sede activa, pero ningún profesional puede prestarlo **en esta sede**. Es el aviso de la fila |

- **Nadie pierde nada**: al introducirlo, todos los servicios quedan
  habilitados en todas las sedes existentes.
- **Lo nuevo nace habilitado**: una sede nueva ofrece todo el catálogo vivo, y
  un servicio nuevo (o restaurado) se ofrece en todas las sedes. El negocio
  recorta después.
- Para sacar un servicio de una sede **se apaga**, no se borra la fila.
- Precio y duración son los del catálogo (v1): no hay diferencias por sede.
- Un servicio apagado en una sede deja de ser reservable en ella (ver «Qué es
  reservable», Story 2.2): `GET /citas/opciones` no lo ofrece ahí y agendarlo
  da 422 en `servicio_id`.

`LocalProfesional` — fila de `local_profesional`. El `index` devuelve **una fila
por cada profesional del negocio**, tenga o no fila en la pivote; si no la
tiene, `habilitado: false` y el resto en null.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | int | id del **profesional** (`users.id`), no de la pivote |
| `nombre` | string | |
| `foto_url` | string? | |
| `habilitado` | bool | |
| `nombre_publico` | string? | cómo aparece en la tienda |
| `perfil` | string? | biografía pública |
| `horario_apertura` `horario_cierre` | `HH:MM`? | rango en **este** local |

**Payload del `PUT`** — el horario va **anidado**, distinto a la entidad:

```json
{ "habilitado": true, "nombre_publico": "Dra. Carmen",
  "perfil": "…", "horario": { "apertura": "09:00", "cierre": "18:00" } }
```

`Grupo`: `{ id, nombre, locales: {id,nombre}[], profesionales: {id,nombre}[],
servicios: {id,nombre}[] }`. **Payload**: los mismos tres campos como arrays de
ids.

### Producto (inventario)

`id`, `nombre`, `descripcion?`, `precio_compra`, `precio_venta` (el que se cobra
y el que usa el formulario de citas), `stock`, `stock_minimo` (umbral de alerta,
5 por defecto), `activo`.

**Payload**: todo menos `activo`. `stock_minimo` puede omitirse —ausente queda
en 5—, y **`precio_compra` sale 0, nunca `null`**.

**El `PUT` existe** desde el Sprint 3.B: se acabó el borrar-y-recrear. Acepta lo
mismo que el `POST` **menos `stock`**, y mandarlo **no da 422**: la clave
simplemente no llega. El stock se mueve con movimientos, que dejan quién y por
qué; un `PUT` que lo reescribiera sería un cambio de inventario sin autor.

**Movimiento**: `{ tipo: "entrada"|"salida", cantidad: int, motivo: string|null }`
— el backend recalcula `stock` y devuelve el producto entero. `motivo` admite
**150** caracteres, que es el ancho de la columna: un `max` más largo cambia un
422 legible por un 500 de MySQL.

**Una salida no puede dejar el stock en negativo → 422 en `cantidad`.** Cero
justo sí pasa; lo que no puede es pasarse. Un stock negativo no es un dato, es
un error de captura contado como inventario, y de ahí sale a la tienda pública
y a los reportes.

`search` filtra por nombre **y** descripción. Borrar es soft delete, y **recrear
un producto con el nombre de uno borrado restaura la fila pero nace limpio** —
activo, con el stock y los precios que se acaban de escribir. Misma decisión que
en Servicios.

### Caja

Plan A (Jean, 2026-11-22). **El cobro es de la cita; la caja es el cajón de
una sede en un día.** Todo lo que entra o sale es un movimiento; uno hecho sin
caja abierta queda «sin caja» (cuenta en el día, no en el arqueo). El arqueo
cuenta **solo el efectivo**: Yape, Plin y tarjeta van por método.

```jsonc
// GET /caja?local_id=3
{
  "fecha": "2026-11-22", "local_id": 3,
  "ajustes": { "exigir_captura": false, "tope_rebaja_pct": null },
  "sesion": {                         // null = hoy no se abrió
    "id": 12, "local_id": 3, "fecha": "2026-11-22",
    "monto_inicial": 100, "monto_contado": null,
    "efectivo_esperado": null, "diferencia": null,   // se fijan al cerrar
    "abierta_por": "Ana Torres", "abierta_en": "2026-11-22T13:02:00Z",
    "cerrada_por": null, "cerrada_en": null, "abierta": true
  },
  "movimientos": [
    { "id": 7, "tipo": "ingreso", "origen": "cita",   // cita · paquete · manual · devolucion
      "metodo": "yape", "monto": 60, "concepto": "Facial · Ana Torres",
      "motivo": null, "cita_id": 41, "operacion": "123456",
      "con_captura": true, "captura_url": "/api/caja/movimientos/7/captura?expires=…&signature=…",
      "sin_caja": false, "usuario": "Ana Torres", "creado_en": "2026-11-22T15:20:00Z" }
  ],
  "totales": {
    "ingresos": 110, "egresos": 20,
    "por_metodo": { "efectivo": 50, "yape": 60, "plin": 0, "tarjeta": 0, "transferencia": 0 },
    "efectivo_esperado": 130,           // inicial + efectivo que entra − efectivo que sale
    "capturas_yape": 1, "sin_captura_yape": 0
  },
  "pagos_qr": [ { "id": 3, "cita_id": 40, "codigo": "5NUB…", "monto": 30, "operacion": "…", "verificado_el": "…" } ],
  "sin_caja": [ /* movimientos de hoy sin caja abierta */ ],
  "por_cobrar": [ { "cita_id": 38, "codigo": "…", "cliente": "…", "servicios": "…", "fecha": "2026-11-21", "saldo": 30 } ]
}

// GET /citas/41/saldo
{ "total": 60, "cobrado": 0, "pago_qr": 0, "cubierto_paquete": 0, "saldo": 60,
  "cobros": [ /* sus movimientos */ ],
  "ajustes": { … }, "caja_abierta": true,
  "rebaja": 0, "rebaja_motivo": null, "rebaja_por": null }
```

- `por_cobrar`: citas **atendidas** de los últimos 60 días con saldo > 0.
- `pagos_qr`: los pagos por Yape de la tienda verificados hoy; no pasan por el
  cajón.
- **Rebaja** (en la cita): `rebaja`, `rebaja_motivo`, `rebaja_por`; `monto_total`
  ya la resta, como el `descuento`, y editar la cita la conserva.
- Una cita sin sede cobra en la sede principal. Vender un paquete
  (`POST /fidelidad/paquetes/vender` con `metodo`) entra como movimiento
  `origen: paquete` en la caja de la principal.
- «Atender ahora»: `POST /citas` con `sin_reserva: true` acepta la hora de
  este minuto (fuera de la rejilla, sin el «ya pasó»), con tal de que el
  profesional no esté ocupado; sale con `canal: "local"`.

### Dashboard

```jsonc
{
  "citas_hoy": 8,
  "citas_pendientes": 3,
  "total_clientes": 214,
  "ingresos_hoy": 940.5,
  "ventas_ultimos_dias": [ { "fecha": "2026-08-08", "total": 620 } ],  // 7 puntos
  "citas_del_dia": [
    { "id": 1, "hora": "14:30", "cliente": "…", "servicio": "…",
      "empleado": "…", "estado": "confirmada" }
  ]
}
```

### Reporte

Una sola llamada devuelve todo lo que pinta la pantalla:

| Bloque | Forma |
|---|---|
| `rango` | `{ desde, hasta, prev_desde, prev_hasta }` — el período de comparación lo calcula el backend |
| `actual` / `anterior` | `{ citas, completadas, canceladas, ingresos, ocupacion, inasistencias }` — los dos últimos en %. `ingresos` = `monto_total` de las completadas; `inasistencias` = `no_asistio` ÷ (citas − canceladas); `ocupacion` con la jornada real de cada profesional |
| `por_servicio` / `por_profesional` | `{ id, nombre, total, monto_total }[]` |
| `horas` | `["09:00","10:00",…]` — franjas del negocio |
| `por_hora` | `{ dia: "Lunes", data: number[] }[]` — alineado con `horas` |
| `fuentes` | `{ clave, label, actual, anterior }[]` — `citas.canal`: `tienda` / `panel` / `local` (este solo si hubo alguna) |
| `diario` | `{ etiqueta: "12/08", actual, anterior }[]` — la etiqueta ya viene formateada; el período anterior tiene los mismos días |

`?desde&hasta` son obligatorios, `hasta ≥ desde` y como mucho 366 días (422
en `hasta`). Permiso `reportes`; alcance de sedes y «solo lo propio» como en
`/dashboard`.

Las variaciones porcentuales las calcula el frontend (`variacion()`).

### Suscripción y planes

`Suscripcion`: `{ estado: "prueba"|"activa"|"vencida"|"cancelada",
plan: {id,nombre,slug}|null, dias_restantes: int, renueva_el: string|null,
extra_profesionales: int, extra_whatsapp: int, elegible_promo: bool }`.

`Plan`: `id`, `nombre`, `slug`, `descripcion` (texto comercial),
`precio_mensual`, `precio_anual`, `precio_promo?`, `promo_duracion_meses`,
`promo_activa`, `max_profesionales`, `max_sucursales`, `max_whatsapp_mes`, `max_numeros_equipo` (Story 4.8b),
`precio_profesional_extra`, `precio_whatsapp_extra`, `mensajes_whatsapp_extra`,
`destacado`, `features: string[]` (claves; las etiquetas están en el frontend).

> `max_sucursales` usa **999 como centinela de "ilimitadas"**, no null.

### Configuración del negocio

Campos planos, aunque en la BD unos vivan en columnas y otros dentro del JSON
`negocios.configuracion` — eso lo resuelve el backend:

- **Negocio**: `nombre`, `slug` (forma el subdominio; **se fija una sola vez**
  en el paso 1 del onboarding y después es inmutable),
  `descripcion?`, `email?`, `telefono?`, `whatsapp?`, `direccion?`,
  `informacion_adicional?`, `latitud?`, `longitud?`, `zona_horaria?`
- **Agenda**: `horario_apertura?`, `horario_cierre?` (respaldo cuando un
  profesional no tiene horario propio; por defecto 09:00–20:00)
- **Marca**: `color_primario?`, `color_secundario?`, `logo_url?`, `cover_url?`

  **Apariencia (Story 5.1, implementada en el backend el 2026-11-18;** PRD
  FR-77 a FR-79): la marca es **del negocio**, la misma en todas las sedes y
  en todos los planes:
  ```jsonc
  "color_primario": "#9B2C5A",          // el texto encima se calcula (AA)
  "texto_sobre_color": "claro",          // "claro" | "oscuro" — solo lectura
  "logo_url": "…/logo-512.webp",
  "apariencia": {
    "portada_estilo": "foto",             // "solido" | "degradado" | "foto"
    "degradado": "atardecer",             // clave de la selección, o "de_mi_color"
    "plantilla": "nocturna",              // "clasica" | "esencia" | "nocturna" | "galeria"
    "portada": {                          // null si no hay foto
      "url_2400": "…", "url_1600": "…", "url_800": "…",
      "enfoque": { "x": 0.42, "y": 0.35 } // 0–1, punto que se mantiene visible
    }
  }
  ```
  - **`texto_sobre_color`**: `claro` (blanco) si llega a 4.5:1; si no,
    `oscuro` (`#0B2A45`, el `store-ink-dark-button` de DESIGN.md). `null` en
    Configuración si el color guardado no permite ninguno (un color de antes de
    la 5.1): el editor lo marca para corregirlo. En la tienda nunca es `null`.
  - **Payload multipart**: `color_primario`, `logo: File`, `portada: File`,
    `apariencia[portada_estilo]`, `apariencia[degradado]`, `apariencia[plantilla]`,
    `apariencia[enfoque][x]` y `[y]` (van juntos), más `logo_eliminar` y
    `portada_eliminar`. Parche, como el resto: lo que no llega no se toca.
  - **Plantilla de la tienda** (2026-11-22): el diseño de la página de
    reservas. `clasica` por defecto (la de siempre); `esencia`, `nocturna` y
    `galeria` salen de las maquetas aprobadas. Otro valor: 422 en
    `apariencia.plantilla`. La tienda la recibe en `negocio.apariencia.plantilla`;
    los datos (servicios, promociones, reservas) son los mismos en todas.
  - **Sin foto, nunca un hueco**: `portada_estilo: "foto"` sin foto da 422 en
    `portada` («Sube una foto…»). Si se quita la foto, la respuesta cae a
    `degradado` (si hay uno elegido) o a `solido`. Elegir `degradado` sin
    clave guarda `de_mi_color`.
  - **Los ocho degradados** (clave → desde, hasta; todo el recorrido aguanta
    texto blanco a 4.5:1, lo comprueba una prueba del backend). Los pinta el
    frontend, a 135°: `atardecer` #B4235A→#C2410C · `oceano` #0E4C92→#0F766E ·
    `bosque` #166534→#115E59 · `uva` #6D28D9→#9D174D · `noche`
    #1E1B4B→#4338CA · `coral` #BE123C→#9A3412 · `cielo` #1D4ED8→#0369A1 ·
    `grafito` #1F2937→#475569. `de_mi_color`: lo genera el frontend a partir
    de `color_primario`.
  - **Imágenes (FR-79)**: el logo se guarda en WebP a 512 px de lado mayor; la
    portada en WebP a 2400, 1600 y 800 px de ancho (nunca se agranda), sin
    metadatos. Reemplazar o quitar borra las versiones anteriores. Al subir una
    portada el enfoque arranca en el centro (0.5, 0.5) si no llega otro.
  - **422**: logo que no sea PNG, JPG o WebP, de más de 1 MB o menor de
    256 × 256; portada de más de 5 MB o menor de 1600 × 600; color sin
    contraste posible en `errors.color_primario`, con el tono más cercano que
    sí cumple **dentro del mensaje** («…El tono más cercano que sí se lee es
    #767676.» para #7F7F7F): el editor puede extraer el hex y proponerlo.
  - «Publicar» es este mismo `PUT`: no existe borrador en el servidor en esta
    versión (el editor recuerda lo no publicado en el navegador, Story 5.3).
  - **`apariencia_publicada`** (Story 5.3, solo lectura): `{ por, en } | null`
    — el nombre de quien publicó y cuándo (ISO 8601). Se actualiza cuando el
    `PUT` toca la apariencia (color, logo, portada, `apariencia.*`,
    `adoptar_logo_de_sede`); guardar otra sección no cuenta.
  - **Transición hasta la 5.4**: `color_secundario`, `cover_url` (y `cover`,
    `cover_eliminar` en el payload) **siguen** funcionando para no romper la
    pantalla actual; la 5.4 los retira. Lo nuevo no los usa.
  - **Traslado de las sedes (Story 5.4, FR-82; backend hecho el 2026-11-18)**.
    Una migración de tenant copió al negocio el logo, el color y el banner de
    su sede principal (solo lo que el negocio no tenía o seguía en el
    predeterminado; las sedes **no pierden nada**). Lo cuenta, una vez:
    ```jsonc
    "aviso_traslado": {                   // null: nada que contar, o ya visto
      "cambios": ["logo", "color", "portada"],   // lo que pasó al negocio
      "sedes": [                          // sedes con color o logo distintos
        { "id": 3, "nombre": "Norte", "color": "#1D4ED8", "logo_url": "…" }
      ]
    }
    ```
    El editor muestra «Tus sedes tenían colores o logos distintos; ahora todas
    usan los del negocio», con «Usar el de esta sede» en cada una:
    - color → `PUT` con `color_primario` = el de la sede (puede dar el 422 de
      contraste: el color trasladado que no cumple se marca, no se rechaza al
      leerlo, `texto_sobre_color: null`);
    - logo → `PUT` con **`adoptar_logo_de_sede: <id>`**: se copia al negocio
      (la sede conserva el suyo). 422 si la sede no existe o no tiene logo.
    - Cerrar el aviso → `PUT` con **`aviso_traslado_visto: true`**.
  - ⚠️ Pendiente de la 5.4 en el frontend: la ficha de la sede deja de
    ofrecer color, banner y logo y dice que hereda los del negocio. Cuando
    eso y la tienda de la 5.1 estén en producción, el backend deja de emitir
    `color`/`banner_url`/`logo_url` de `Local` y retira `color_secundario` y
    `cover` (limpieza aparte).
- **Sitio público**: `sitio_publico_activo`, `mostrar_en_marketplace`,
  `terminos_servicio?`
- **`agenda`**: `{ modo_intervalo: "duracion_servicio"|"fijo", intervalo_min, plazo_confirmacion_min }`
  — `plazo_confirmacion_min` (Story 6.7): minutos para confirmar por correo una
  reserva de la tienda, 30 por defecto, de 15 a 120.
  — `cambios_hasta_min` (Story 6.8/6.9): hasta cuántos minutos antes de la cita
  el cliente puede cambiarla o cancelarla desde su enlace: 15, 30, 60, 120,
  360, 720, 1440 o 2880. 15 por defecto. Al panel no le limita.
  — ⚠️ **no existe en el backend anterior**, hay que crearlo

El `PUT` es un **parche**: llega lo que llega y se toca solo eso. El objeto
completo sigue funcionando porque es un caso particular.

La distinción que importa al mandar: **clave ausente** significa «no lo
toques»; **clave presente con valor vacío** sí escribe. Por eso
`sitio_publico_activo: false` se guarda y `email: ""` vacía el campo.

Cambió el 2026-09-04, cuando la pantalla se partió en cuatro secciones y
mandar el objeto entero dejó de ser posible.

**`zona_horaria` es una zona IANA de verdad** (`America/Lima` sí, `Lima` o
`GMT-5` dan 422). La lista viaja con el `GET` en **`zonas_horarias`, fuera de
`data`** — 419 sin etiquetas: los rótulos los pone el frontend y el desfase lo
calcula `Intl`.

**`agenda.intervalo_min`** es obligatorio solo con `modo_intervalo: "fijo"`
(entero 5–120), y los dos campos de `agenda` **viajan juntos**.

Los colores por defecto son **`#4f46e5`** y **`#06b6d4`**, los de las columnas
de `tenants`.

### Preferencias de avisos (Story 4.6a)

Lo que no está aquí es **esencial**: siempre sale y se enseña bloqueado
(`esenciales: [{ titulo, porque }]`). Valores por defecto: hoja 9 de
«Flujos de avisos».

| Método | Ruta | Quién | Cuerpo / respuesta |
|---|---|---|---|
| GET | `/avisos/mis-avisos` | cada persona | `{ data: { grupos: [{ clave, titulo, detalle, modo, canal }], esenciales, modos, canales, whatsapp_activo } }` |
| PUT | `/avisos/mis-avisos` | cada persona | `{ clave, modo: "instante"\|"apagado", canal: "correo"\|"whatsapp"\|"ambos" }` · 422 si la clave es esencial o no le toca. `resumen` llega con la 4.6b |
| GET | `/avisos/negocio` | `configuracion` | `{ data: { avisos: [{ clave, titulo, detalle, activo, defecto }], esenciales, whatsapp: { nota, nota_max, nota_incluida, emoji, emoji_incluido, emoji_rubro, plan_que_lo_incluye } } }` |
| PUT | `/avisos/negocio` | `configuracion,gestionar` | `{ clave, activo }` (agendada_panel, recordatorio, recordatorios_extra, whatsapp) o `{ clave: "whatsapp_nota"\|"whatsapp_emoji", valor }` · 422: esencial, nota con enlace/teléfono/>80, emoji inválido o plan que no lo incluye |

| GET | `/avisos/cuota` | `configuracion` | Story 4.7: `{ data: { usados, maximo, alcanzada, se_reinicia } }`. También va como `cuota` dentro de `/avisos/negocio` |

**Story 4.6b:** `modo: "resumen"` (si el plan incluye `resumen_diario`) junta
los avisos del día en un correo a las 7:00 pm (R-1). El grupo `agenda_hoy`
(`tipo: "agenda"`, plan con `agenda_del_dia`) lleva `hora` (`horas_agenda`:
06:00–10:00) y manda las citas del día (R-2). `GET /avisos/mis-avisos` añade
por grupo `tipo`, `hora`, `incluido`, y `resumen_incluido`, `horas_agenda`,
`plan_que_lo_incluye`.

**Story 4.7 (cuota de correos):** `planes.max_correos_mes` (Básico 1 000,
Premium 5 000, Pro 15 000). Al llegar, los opcionales quedan `omitido ·
cuota_correos`; lo esencial sale igual. X-3 al titular y a la plataforma, una
vez por mes.

Grupos del equipo: `citas_negocio` (dueño: C-2, C-6D), `mis_citas`
(profesional: C-2P, C-5P, C-6P), `asignaciones` (C-7P). La nota sale en los
WhatsApp a clientes como `💬 _nota_` antes del cierre.

### Ticket de soporte

`id`, `asunto`, `mensaje`, `respuesta?`, `estado`
(`abierto`|`en_proceso`|`cerrado`), `prioridad` (`baja`|`media`|`alta`),
`autor`, `respondido_por?`, `creado_en`, `actualizado_en`.
**Payload**: `{ asunto, mensaje, prioridad }` — el resto lo pone el backend.

### Plantilla de WhatsApp

`{ id, nombre, evento, contenido, activo }`, con `evento` en:
`confirmacion`, `recordatorio`, `cancelacion`, `finalizado`, `bienvenida`,
`pago_linea`, `redes_sociales`, `cumpleanos`, `personalizado`.

### Tienda pública

```jsonc
// GET /publico/{slug}
// Sin `id` del negocio (Story 6.1): es el que nombra su base de datos.
{ "negocio": { "nombre", "slug", "telefono", "email" },
  "locales": [ /* LocalPublico */ ] }

// LocalPublico: id, slug, nombre, direccion?, descripcion?, telefono?,
// banner_url?, logo_url?, latitud?, longitud?, color?, horario_desde?,
// horario_hasta?   (`slug` desde la Story 6.2)
//
// Story 5.1 (hecho en el backend el 2026-11-18): `negocio` gana logo_url,
//   color_primario, texto_sobre_color y apariencia (igual que en
//   Configuración); es la identidad de TODAS las sedes. Viaja en
//   GET /publico/{slug}, en /sucursal/{sede}, en la página de la cita y en el
//   423 de la tienda cerrada.
// ⚠️ Pendiente (Story 5.4, FR-82): LocalPublico pierde banner_url, logo_url y
//   color. Hasta entonces siguen saliendo; la tienda debe usar los del negocio.

// GET /publico/{slug}/sucursal/{sede}  → TiendaLocal   ({sede}: slug, slug antiguo o id)
{
  "negocio": { … },
  "local":   { … },
  "categorias": [
    { "id": 3, "nombre": "Faciales",        // id null = "Otros servicios"
      "servicios": [ { "id", "nombre", "descripcion", "duracion_min",
                       "precio", "color", "imagen_principal", "galeria" } ] }
  ],
  "profesionales": [ { "id", "nombre", "perfil", "foto_url",
                       "servicios": [4, 7] } ],   // Story 6.3
  "resenas": { "promedio": 4.7, "total": 38,
               "distribucion": { "5": 30, "4": 5, "3": 2, "2": 1, "1": 0 } },
  "ultimas_resenas": [ { "id", "cliente", "puntuacion", "comentario",
                         "fecha", "servicio", "respuesta" } ]
}
```

Solo salen los profesionales con algo que reservar en esa sede (activos, que
atienden, habilitados en ella y que prestan algún servicio del catálogo), y su
`nombre` es el `nombre_publico` si lo tiene. **`servicios`** (Story 6.3) son
los ids de los servicios del catálogo que presta **en esa sede**: la tienda
solo ofrece para cada servicio a quien lo presta, y en una cita única a quien
presta todos.

⚠️ **Reseñas no existen en el backend**: no hay tabla ni campo. El esquema
propuesto está en `vistas/tienda-publica.md`. `resenas: null` es válido.

```jsonc
// POST /publico/{slug}/sucursal/{localId}/reservar
{
  "modo": "unica",                    // "unica" | "separada"
  "cliente_nombre": "María",
  "cliente_apellido": "Quispe",       // opcional
  "cliente_telefono": "999888777",
  "cliente_email": "maria@correo.pe",
  "cliente_documento": "45678912",    // opcional (DNI)
  "acepta_whatsapp": false,           // la casilla desmarcada (Story 4.8c; la conecta la 6.7)
  "notas": null,
  "servicios": [
    { "id": 4, "cantidad": 1, "profesional_id": 7,
      "fecha": "2026-08-20", "hora_inicio": "10:30" }
  ]
}

// → ReservaConfirmada
{ "codigo": "R-482913", "modo": "unica", "total": 180,
  "citas": [ { "id", "servicio", "profesional", "fecha",
               "hora_inicio", "hora_fin" } ] }
```

- `modo: "unica"` → **una sola cita** encadenando todos los servicios, mismo
  profesional, duración sumada.
- `modo: "separada"` → una cita por servicio, cada una con su profesional,
  fecha y hora.
- Las citas entran como `estado: "pendiente"`, `canal: "tienda"` y sin
  `creada_por` (Story 1.13; sustituye a la antigua `fuente: "publica"`).

---

## 4. Cómo se calculan los huecos

Es la pieza con más lógica compartida y la que más fácil se desincroniza. Hoy
vive en el cliente (`features/calendario/disponibilidad.ts`) para el panel, y el
backend tiene que reproducirla **exactamente igual** en
`/publico/…/horarios`.

Precedencia de la jornada de un profesional en una fecha:

1. Excepción con `disponible: false` → no atiende ese día.
2. Excepción con `disponible: true` → **su horario reemplaza al habitual**
   (medio turno, refuerzo, cubrir a un compañero).
3. Horario propio y el día está `activo` → ese horario, con sus breaks.
4. Horario propio pero el día no está activo → no laborable.
5. **Sin horario propio → rige el horario del negocio.** Un profesional recién
   creado atiende, no queda sin agenda.

Dos matices que el backend cerró al implementarlo (2026-09-06):

- **Solo `cancelada` libera su hueco.** `no_asistio` **no**: el profesional
  estuvo esperando igual, y liberarlo reescribiría el pasado y los reportes que
  salgan de él.
- **Una excepción disponible no arrastra los breaks del día habitual.** Es un
  turno distinto —medio turno, refuerzo, cubrir a un compañero— y sus descansos
  habrían sido otros. El nivel 2 reemplaza entero.

Sobre esa jornada se descuentan breaks y citas ya tomadas (excluyendo las
`cancelada`), y se ofrecen los inicios donde **cabe entera** la duración
pedida. Los candidatos son la rejilla del paso **más los bordes**: el instante
en que termina cada cita y cada break. Sin esos bordes, una cita de 50 min a las
09:00 dejaría muerto el hueco de 09:50 a 10:00.

El paso lo decide `configuracion.agenda`:

- `duracion_servicio` → el paso es la duración del servicio (agenda compacta).
- `fijo` → rejilla cada `intervalo_min` minutos (más flexible, fragmenta).

> ⚠️ **Esta regla está escrita dos veces**: aquí la calcula
> `features/calendario/disponibilidad.ts` para pintar el selector, y en el
> backend `App\Services\Disponibilidad` para validar el `POST`. Mientras las
> dos existan tienen que dar lo mismo, o el selector ofrecerá horas que el
> backend rechaza con un 422. **Tocar una obliga a avisar de la otra.**

---

## 5. Flujos de pantalla

Qué endpoints se disparan y en qué orden. `↻` = invalida esas queries al
terminar.

### Sesión

```
/login
  navegador  POST /api/auth/login   { email, password, remember? }
  BFF        POST {API_URL}/login   { email, password }
             ← { data: { token, usuario } }
             guarda token   en cookie httpOnly mi_saas_token
             guarda negocio en cookie httpOnly mi_saas_tenant
  navegador  ← { data: Usuario }        (el token no sale del servidor)
             → /

cada request siguiente
  navegador  GET /api/clientes            (sin cabecera de auth: no la tiene)
  BFF        GET {API_URL}/clientes       Authorization: Bearer …
                                          X-Tenant: 12
                                          cache: 'no-store'

cerrar sesión
  navegador  POST /api/auth/logout
  BFF        POST {API_URL}/logout  con el Bearer → revoca el token
             borra las dos cookies
  navegador  ← 204 → queryClient.clear() → /login

401 en cualquier punto → redirect a /login (interceptor de axios)
```

Si Laravel no contesta, el BFF devuelve **502** con
`{ message: "No se pudo conectar con el servidor." }`, que es la forma que ya
sabe leer `toApiError()`. En el logout la cookie se borra igual aunque la
revocación falle: dejar al usuario dentro porque el backend no respondió es
peor que un token huérfano.

⚠️ **Las pantallas de auth siguen siendo las de la plantilla Modernize**: están
en inglés y sus botones son `<Link>`, no envían nada. `authApi` y `useAuth`
están escritos y probados de tipos, pero **ningún componente los usa todavía**
— tampoco `GET /user`. Cablearlos es parte del trabajo pendiente.

### Dashboard (`/`)

```
GET /dashboard        (una sola request; los 4 widgets comparten query key)
GET /configuracion    (para el enlace a la tienda pública)
GET /suscripcion      (banner de prueba, en el layout)
```

### Citas (`/citas`)

```
tabla        GET /citas?page&per_page&search
abrir form   GET /clientes?per_page=200 · /servicios · /profesionales · /inventario
             GET /configuracion            (paso de la rejilla)
             GET /citas?fecha=…            (huecos ocupados de ese día)
guardar      POST /citas  |  PUT /citas/{id}          ↻ citas
eliminar     DELETE /citas/{id}                        ↻ citas
historial    GET /citas/{id}/historial                 al abrir la ficha
```

`search` busca por nombre, apellido o teléfono del cliente, **o por el código
exacto de la cita**, sin distinguir mayúsculas: es lo que dicta por teléfono
quien la tiene apuntada (Story 3.1). Respeta el alcance: con `solo_propios`, el
código de una cita ajena no la encuentra.

El selector de horas no deja elegir un hueco que no esté en la lista: agendar
fuera de horario deja de ser algo que validar después.

### Calendario (`/calendario`)

```
GET /citas?fecha=YYYY-MM-DD&per_page=200      ← al cambiar de día
GET /profesionales?per_page=200                ← columnas del día
clic en hueco libre → mismo formulario de Citas, con fecha/hora/profesional ya puestos
```

Filtro por profesional y cambio de vista (calendario/lista) son **de cliente**,
no vuelven a pedir nada.

### Clientes · Servicios · Categorías · Inventario · WhatsApp · Grupos

Todos el mismo ciclo:

```
GET /{recurso}?page&per_page&search
POST /{recurso}   |  PUT /{recurso}/{id}   |  DELETE /{recurso}/{id}   ↻ {recurso}
```

Con dos particularidades: **Servicios** además pide `/categorias-servicios` y
`/profesionales` para sus selects, e **Inventario** añade
`POST /inventario/{id}/movimiento` para entradas y salidas de stock.

### Equipo (`/administracion/equipo/*`)

```
al entrar    GET /capacidades              ← el menu y los botones, una vez

usuarios     GET /usuarios?page&per_page&search      (solo el admin general)
             POST/PUT/DELETE /usuarios               JSON, sin contrasena
             POST /usuarios/{id}/invitacion          reenviar

profesionales GET /profesionales?page&per_page&search
             GET /profesionales/resumen    (tarjeta "activos . 3 de 5")
             POST/PUT multipart con foto, horario[] y excepciones[]
             + `usuario:{email,rol_id}` opcional     ↻ profesionales, usuarios

roles        GET /roles                    (+ `modulos` fuera de `data`)
             POST/PUT/DELETE /roles        (solo el admin general)
```

### Locales (`/administracion/locales/*`) — tres secciones

| Sección | Endpoints |
|---|---|
| Sedes | `GET/POST/PUT/DELETE /locales` (multipart: banner y logo) |
| Profesionales por local | `GET /locales/{id}/profesionales` · `PUT /locales/{id}/profesionales/{profId}` — el interruptor de la tabla y el modal llaman al mismo endpoint |
| Servicios de cada sede (Story 2.1) | `GET /locales/{id}/servicios?search&page` · `PUT /locales/{id}/servicios/{servicioId}` — el interruptor guarda al momento |
| ~~Grupos~~ | oculto desde la Story 1.14; los endpoints `/grupos` siguen |

### Caja (`/caja`)

```
GET /caja?local_id                 → EstadoCaja (selector de sede si hay varias)
sesion === null          → «Abrir caja»
sesion.abierta           → Ingreso · Egreso · Cerrar caja
!sesion.abierta          → solo lectura, con la diferencia del arqueo
pestañas: Movimientos · Por cobrar · Sin caja · Pagos por QR · Cierres

Citas / Calendario:
  «Marcar atendida» → PUT /citas/{id} → diálogo «¿Cobrar ahora?»
     GET /citas/{id}/saldo → método · monto (otro monto → motivo) · captura Yape/Plin
     POST /citas/{id}/cobros   ↻ caja, citas      «Cobrar después» → queda en Por cobrar
     «Aplicar rebaja» → POST /citas/{id}/rebaja  ↻ caja, citas
  «Atender ahora» → formulario sin fecha ni hueco → POST /citas { sin_reserva: true }
```

Toda acción de caja invalida `caja` y `citas`: la ficha de la cita enseña lo
cobrado y la pantalla de caja no sirve por partes.

### Reportes (`/reportes`)

```
cambiar rango  → GET /reportes?desde&hasta      (cacheado 5 min)
Exportar       → GET /reportes/exportar?desde&hasta  → blob → descarga
```

La descarga se fuerza desde el blob y no navegando a la URL, porque haría falta
arrastrar la sesión.

### Mi Plan (`/mi-plan`)

```
GET /planes  ·  GET /suscripcion
elegir plan + extras → POST /plan/{id}/solicitar    ↻ suscripcion, tickets
```

⚠️ **No hay pasarela de pago.** La solicitud abre un ticket de soporte con el
desglose para que el equipo contacte al negocio; por eso invalida también la
lista de tickets.

### Soporte (`/soporte`) — conectado el 2026-11-22

Los tickets son **centrales** (`soporte_tickets` + `soporte_mensajes`): el
panel de plataforma ve todos los negocios. Siempre del negocio del token (otro
negocio: 404). **Accesible aunque la suscripción esté vencida.** Permiso del
rol: módulo `soporte` (`ver` para leer, `gestionar` para escribir).

| Método | Ruta | Cuerpo | Respuesta |
|---|---|---|---|
| GET | `/soporte/tickets?page&per_page(≤200)&search&estado` | — | `{ data: Ticket[], meta: { …, por_estado: { abierto, en_proceso, cerrado } } }` |
| GET | `/soporte/tickets/{id}` | — | `{ data: Ticket + mensajes[] }` |
| POST | `/soporte/tickets` | `{ asunto (4–150), mensaje (10–5000), prioridad: baja\|media\|alta }` | 201, el ticket con su primer mensaje |
| POST | `/soporte/tickets/{id}/mensajes` | `{ texto (2–5000) }` | el ticket con la conversación; **si estaba cerrado, se reabre** |

`Ticket`: `id, asunto, mensaje` (el primero), `respuesta` (la última del
equipo, o null), `estado` (`abierto|en_proceso|cerrado`; el `resuelto` de la
tabla se muestra como `cerrado`), `prioridad, autor, respondido_por,
creado_en, actualizado_en`. `mensajes[]`: `{ id, autor: negocio|soporte,
nombre, texto, creado_en }`. Límite: 10 tickets y 20 mensajes por minuto.

### Soporte (`/soporte`)

```
GET /soporte/tickets?page&per_page&search[&estado=abierto|en_proceso|cerrado]
POST /soporte/tickets  { asunto, mensaje, prioridad }    ↻ tickets
```

El filtro por estado es un query param; al cambiarlo la tabla vuelve a la
página 1.

### Configuración (`/configuracion`)

```
GET /configuracion  →  PUT /configuracion (objeto completo)   ↻ configuracion
```

Se cachea 10 minutos porque el formulario de citas la consulta en cada apertura.

### Tienda pública (`{slug}.dominio` · `/reservar/{slug}`)

⚠️ **Cambio aprobado el 2026-09-19, pendiente de implementar**: la sede se elige **antes** del servicio cuando hay
varias; desde `{slug}.tivuapp.store/{sede}` llega preseleccionada y se puede
cambiar (si ya hay servicios elegidos, se avisa antes de reiniciar la
selección). Las rutas de sucursal usan el slug de la sede (FR-81).

```
1. GET /publico/{slug}
      1 sola sede → redirect (replace) a la sucursal
      varias      → rejilla de sedes
2. GET /publico/{slug}/sucursal/{localId}     catálogo, profesionales, reseñas
3. carrito                                    en memoria, no viaja al servidor
4. wizard:
      [Modalidad]  solo si hay más de un servicio: única o separada
      Fecha y profesional
          → GET …/horarios?fecha&servicios[]&profesional_id   (Story 6.4)
              una vez en cita única; una por línea en separada
      Tus datos    nombre, teléfono y correo obligatorios (validación de cliente)
      Confirmar
          → POST …/reservar  → comprobante con código
```

**`GET /publico/{slug}/sucursal/{sede}/horarios`** (Story 6.4) →
`{ "data": ["09:00", "10:15", …] }`

| Parámetro | Qué es |
|---|---|
| `fecha` | `YYYY-MM-DD`, de hoy (en la zona del negocio) a 90 días. Fuera: 422 |
| `servicios[]` | un id por **unidad**: dos cortes = el id dos veces. Varios distintos = una cita seguida con quien los preste todos. De 1 a 10 |
| `profesional_id` | opcional. Sin él, «cualquier profesional»: la unión de las horas de todos los que pueden |

- **La duración la calcula el servidor** desde los servicios (suma × cantidad).
  Antes era `duracion_min` del navegador: con ella cualquiera pedía huecos de
  un minuto, y el servidor no sabía qué servicio aplicar a la regla.
- Mismo motor que el panel (§4) y misma regla (Story 2.2) más
  `visible_publico`. Lo que no se puede reservar en esa sede es **404**
  `{ message, codigo: "no_reservable" }`, sin decir qué falla.
- Hoy no salen las horas que ya pasaron en la zona del negocio.
- Al reservar (Story 6.6), `profesional_id: null` = «cualquiera», y una hora
  que ya no está libre es 422 en `hora_inicio`: el asistente refresca las horas
  y vuelve al paso de elegir.

El carrito vive en memoria y **no en la query string** como en la app anterior:
allí cada cambio recargaba la página. Los huecos se cachean solo 30 s: entre que
el cliente elige y confirma, otro puede haberse llevado la hora.

### Promociones · tarjeta de sellos (`/promociones`) — Story 11.1

Función de Premium (`funcion:promociones`; sin ella, **403** `{ message, funcion: "promociones" }`).

| Método | Ruta | Permiso | Cuerpo / respuesta |
|---|---|---|---|
| GET | `/promociones` | `servicios` ver | `{ data: [promo] }`, con `clientes`, `sellos` y `canjes` |
| POST · PUT · DELETE | `/promociones[/{id}]` | `servicios` gestionar | `{ nombre, servicio_ids[], cantidad (2–20), recompensa_tipo: gratis·porcentaje·monto, recompensa_servicio_id \| recompensa_valor, vigente_desde?, vigente_hasta?, cuenta_atendidas, cuenta_qr, visible_tienda, local_ids? }` |
| POST | `/fidelidad/escanear` | `clientes` ver | `{ token }`: el enlace de la tarjeta o su token. `{ data: { cliente, resultados: [progreso + suceso] } }`. 404 si no es una tarjeta del negocio |
| GET | `/fidelidad/buscar?telefono=` | `clientes` ver | sin cámara: `{ data: [cliente + progreso] }` |
| POST | `/fidelidad/sumar` | `clientes` ver | `{ cliente_id }`: la visita a mano |
| POST | `/fidelidad/canjear` | `clientes` ver | `{ cliente_id, promocion_id }`. 422 si aún no completa la tarjeta |
| GET | `/clientes/{id}/tarjeta` | `clientes` ver | `{ data: { enlace, progreso } }`: el enlace que se le comparte |
| GET | `/publico/{slug}/tarjeta/{token}` | sin sesión | `{ data: { negocio (marca), cliente: { nombre }, enlace, promociones: [progreso] } }` |

`progreso`: `{ promocion_id, nombre, cantidad, llevas, listo, recompensa, servicios[], suceso?: "sumado" | "ya_hoy" }`.

**Reglas:**
- El cliente no tiene cuenta. Su tarjeta (`tarjetas_cliente`) tiene un **token al azar**: es lo que lleva su QR y su enlace `{tienda}/tarjeta/{token}`, nunca su teléfono.
- **Un sello por día y promoción**, venga de la cita atendida, del QR o de la suma a mano. Escanear dos veces no cuenta doble.
- Solo cuentan las citas **atendidas** (`completada`) con un servicio de la promo, nunca las reservas. Volver atrás el estado no quita el sello.
- Canjear descuenta los sellos de la recompensa (`promocion_canjes`) y la tarjeta sigue.
- La tarjeta pública lleva la **identidad del negocio** (Apariencia), no la de tivu.

### Paquetes de sesiones — Story 11.4

La plantilla es una promoción con `tipo: "paquete"`: `cantidad` son las sesiones, `precio` lo que cuesta y `vigencia_dias` cuánto dura desde la venta (`null` = no vence). No suma sellos.

| Método | Ruta | Permiso | Cuerpo / respuesta |
|---|---|---|---|
| POST · PUT | `/promociones[/{id}]` | `servicios` gestionar | `{ tipo: "paquete", nombre, servicio_ids[], cantidad (2–50), precio, vigencia_dias?, visible_tienda }`. La respuesta añade `precio`, `vigencia_dias`, `vendidos` y `sesiones_usadas` |
| POST | `/fidelidad/paquetes/vender` | `clientes` ver | `{ cliente_id, promocion_id, metodo?: efectivo·yape·plin·tarjeta·transferencia, precio?, sesiones? (1–100), vence_el? (≥ hoy), sin_vencimiento? }` → 201 `{ data: paquete }`. Lo opcional es lo pactado con ese cliente; sin ello, lo de la plantilla, que no cambia |
| POST | `/fidelidad/paquetes/usar` | `clientes` ver | `{ paquete_id }` → `{ data: paquete }`. 422 si venció o no le quedan sesiones |

`paquete`: `{ paquete_id, nombre, sesiones, usadas, quedan, vence_el, servicios[] }`. Escanear, buscar, `/clientes/{id}/tarjeta` y la tarjeta pública añaden `paquetes: [paquete]` (solo los que tienen sesiones y no vencieron, el que vence antes primero).

**Reglas:**
- Se vende en el local: el negocio cobra y aquí queda el registro con el precio de ese día.
- La cita **atendida** de un servicio del paquete descuenta una sesión sola, del que vence antes. Una cita nunca descuenta dos veces, aunque se vuelva a marcar.
- También se descuenta a mano desde el escáner (lo que pasa sin cita).

### Combos — Story 11.2

Una promoción con `tipo: "combo"`: sus servicios (2 a 6) y su `precio` juntos, que tiene que ser menor que la suma por separado (422 en `precio` si no).

| Método | Ruta | Permiso | Cuerpo / respuesta |
|---|---|---|---|
| POST · PUT | `/promociones[/{id}]` | `servicios` gestionar | `{ tipo: "combo", nombre, servicio_ids[], precio, vigente_desde?, vigente_hasta?, visible_tienda }`. La respuesta añade `precio_normal` y `combos_vendidos` |
| GET | `/publico/{slug}/sucursal/{sede}` | sin sesión | añade `combos: [{ id, nombre, servicio_ids[], precio, precio_normal, ahorro }]`: visibles, vigentes y con todos sus servicios reservables en esa sede |

**Reglas (`App\Promociones\Combos`, la misma que `aplicarCombos` del frontend):**
- Al reservar en la tienda, si vienen **todos** sus servicios, una unidad de cada uno, se cobra el precio del combo. Lo decide el servidor; el carrito solo lo enseña antes.
- Si caben varios, primero el que más ahorra; un servicio entra en un solo combo. Una línea con cantidad 2 o más no entra.
- El precio se reparte entre sus líneas en proporción a su precio de lista (en céntimos; el último se lleva el redondeo). Cada línea guarda `promocion_id` y `precio_lista` en `cita_servicio`.
- Vale también con citas separadas. Las citas del panel (un servicio) no llevan combos.

### Paquetes con cupo por servicio

`POST /promociones` de `tipo: "paquete"` acepta `cupos: [{ servicio_id, sesiones }]` en lugar de `servicio_ids` + `cantidad` («3 masajes + 2 faciales»). `servicio_ids` y `cantidad` (la suma, de 2 a 50) salen de los cupos.

- El paquete vendido copia los cupos. En `PaqueteActivo` llega `cupos: [{ servicio_id, nombre, sesiones, usadas, quedan }]` (null si no tiene).
- `POST /fidelidad/paquetes/usar` pide además `servicio_id` si el paquete tiene cupos (422 en `servicio_id` si falta o si de ese servicio ya no queda).
- La cita atendida descuenta del primer servicio de la cita que aún tenga cupo.

### Descuento por día u horario — Story 11.3

| Método | Ruta | Cuerpo / respuesta |
|---|---|---|
| POST · PUT | `/promociones[/{id}]` | `{ tipo: "horario", nombre, servicio_ids[], dias[] (1 = lunes … 7 = domingo), hora_desde, hora_hasta ("HH:MM"), recompensa_tipo: "porcentaje" \| "monto", recompensa_valor, vigente_desde?, vigente_hasta?, visible_tienda }`. La respuesta añade `aplicadas` (reservas con el descuento) |
| GET | `/publico/{slug}/sucursal/{sede}` | añade `descuentos: [{ id, nombre, servicio_ids[], dias[], desde, hasta, tipo, valor, vigente_hasta }]` |

- Vale para la hora de **inicio** dentro de [desde, hasta) del día indicado. Si caben varios, el que deja el precio más bajo.
- Se aplica por línea de la reserva de la tienda (guarda `promocion_id` y `precio_lista` como los combos). Una línea que entró en un combo no lleva además este descuento.
- La tienda marca los huecos con descuento (`rebajaEn` en el frontend, la misma regla que `App\Promociones\Descuentos::para`).

### Ocasiones — Story 11.5

| Método | Ruta | Cuerpo / respuesta |
|---|---|---|
| POST · PUT | `/promociones[/{id}]` | `{ tipo: "ocasion", nombre, ocasion: "primera_visita" \| "cumpleanos" \| "referido", recompensa_tipo: "porcentaje" \| "monto", recompensa_valor, vigente_desde?, vigente_hasta?, visible_tienda }`. La respuesta añade `aplicadas` |
| GET | `/publico/{slug}/sucursal/{sede}` | añade `ocasiones: [{ id, nombre, ocasion, tipo, valor }]` |
| POST | `/publico/{slug}/sucursal/{sede}/reservar` | acepta `referido` (el token de la tarjeta del cliente que invita; la tienda lo toma de `?ref=`) |
| GET | `/publico/{slug}/tarjeta/{token}` | añade `referido: { tipo, valor, … } \| null`: si hay premio por invitar, la tarjeta ofrece «Invita a un amigo» |

**Reglas (`App\Promociones\Ocasiones`):**
- **Primera visita:** el cliente no tiene ninguna cita anterior que siga en pie (las canceladas no cuentan).
- **Cumpleaños:** su `fecha_nacimiento` (de la ficha) cae en el mes de la cita. Una vez por año.
- **Referido:** llega con el token de la tarjeta de **otro** cliente y es su primera visita. Se guarda quién lo trajo (`referido_por_cliente_id`).
- Una sola vez por cliente (el cumpleaños, una por año), registrada en `promocion_ocasiones`. Si la cita se cancela, vuelve a estar disponible.
- Si cumple varias, la que más descuenta. Va a la **primera cita** de la reserva como `citas.descuento` (+ `descuento_promocion_id`), sobre lo que ya cuesta con combos y horario; `monto_total` ya lo resta y lo sigue restando si se edita la cita.

**En la cita del panel** (`GET /citas`, `GET /citas/{id}`): `descuento` (el de la ocasión, ya restado en `monto_total`) y `promociones: [{ nombre, ahorro }]` (combos y horario por línea, más la ocasión), para que recepción vea por qué el total es menor.

**Todas las promociones de la tienda (combos, horario, ocasiones)** se aplican solo si el plan del negocio trae `promociones`; si no, la tienda no las enseña ni el servidor las cobra. Las citas creadas desde el panel no las llevan.

---

## 6. Lo que todavía no está cableado

Cosas que el backend tendrá que servir, pero que hoy ningún componente pide:

| Qué | Estado |
|---|---|
| Login, registro y recuperación | pantallas de plantilla, en inglés, sin llamadas. `authApi` y el BFF existen; falta cablear los formularios con el payload nuevo de registro (ver [`vistas/registro.md`](vistas/registro.md)) |
| Registro con sesión | decidido que **no la abre**: `POST /register` va por el proxy sin escribir cookie; al terminar se muestra "revisa tu correo" y, tras verificar, el usuario hace login |
| Onboarding | especificado en [`vistas/onboarding.md`](vistas/onboarding.md) (checklist lateral no bloqueante); sin maquetar |
| `GET /user` | escrito en `useUsuarioActual`, nadie lo monta |
| `/configuracion/perfil` | formulario estático: no lee ni guarda nada |
| Reseñas de la tienda | sin tabla en el backend; el frontend ya las pinta |
| `configuracion.agenda` | ajuste nuevo, no existe en el backend anterior |
| `sort` en los listados | está en `ListParams`, ninguna tabla lo envía |
| `PUT`/`DELETE` de tickets | los genera la fábrica, los usa el panel de soporte (otra app) |
| Envío de prueba de WhatsApp | se resuelve en el cliente abriendo `api.whatsapp.com`; no hay `POST /plantillas-whatsapp/enviar-prueba` |
| Landing del SaaS | sin maquetar |

---

## 7. Checklist para el backend

1. **Paginar todo listado.** Nada de `->get()` suelto: el frontend lee `meta`.
2. **`search`**, nunca `buscar`.
3. **422 con `errors` por campo** — es lo único que los formularios saben pintar.
4. **Un solo envoltorio**: `{ data: … }` y `{ data: […], meta: {…} }`.
5. Filtros como query params, no rutas nuevas.
6. Los cuatro recursos con archivos aceptan `POST` con `_method=PUT` y arrays
   indexados.
7. Campos calculados que el frontend da por hechos: `hora_fin` de la cita,
   `total_citas`/`ultima_cita` del cliente, `servicios_count` de la categoría,
   `ingresos`/`egresos` de la caja, `stock` tras un movimiento.
8. Colores y etiquetas los pone el frontend; manda la clave del enum.
9. `/publico/*` sin sesión y con datos recortados: nada de costes, comisiones ni
   estados internos.
10. **Tokens de Sanctum, no sesión de cookie.** `POST /login` devuelve
    `{ data: { token, usuario } }`; `POST /logout` revoca solo el token en uso.
    Laravel solo recibe tráfico del BFF, así que no hace falta CORS,
    `SANCTUM_STATEFUL_DOMAINS` ni `statefulApi()`.
