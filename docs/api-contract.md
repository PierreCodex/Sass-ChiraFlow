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
| POST `/api/auth/login` | `{ email, password, remember? }` | `{ data: Usuario }` + cookie httpOnly |
| POST `/api/auth/logout` | — | 204, cookie borrada |

| Del BFF a Laravel | Payload | Respuesta que se espera |
|---|---|---|
| POST `/login` | `{ email, password }` | `{ data: { token, usuario } }` · 422 credenciales · 403 sin verificar · 429 (10/min) |
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
| POST | `/forgot-password` | `{ email }` | 200 |
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
| Citas | `citas` | no | nombre, apellido o teléfono del cliente | `fecha`, `estado` | `DELETE` borra de verdad (no soft delete) |
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
| GET | `/citas` | `?fecha=YYYY-MM-DD&per_page=200` | `{ data: Cita[] }` | Calendario y selector de huecos |
| GET | `/capacidades` | — | `{ data: Capacidades }` | **el menú y los botones**: lo que puede hacer quien mira, ya resuelto |
| GET | `/profesionales/resumen` | — | `{ data: ResumenPlanProfesionales }` | tarjeta "Profesionales activos en tu plan" |
| POST | `/usuarios/{id}/invitacion` | — | `{ message }` | reenviar la invitación |
| POST | `/invitacion/aceptar` | `{ token, email, password, password_confirmation }` | `{ message }` | **público**. Broker propio, 7 días — NO es `/reset-password` |
| GET | `/locales/{localId}/profesionales` | — | `{ data: LocalProfesional[] }` | una fila por CADA profesional del negocio, tenga o no asignación. Con alcance por sedes, solo los que ya tienen fila en alguna de sus sedes (1.8) |
| GET | `/locales/{localId}/servicios` | `?search&page&per_page` | `{ data: LocalServicio[], meta }` | **Story 2.1.** Todo el catálogo vivo, cada servicio con su estado en **esta** sede. `locales: ver`; sede fuera del alcance → 404 |
| PUT | `/locales/{localId}/servicios/{servicioId}` | `{ habilitado: bool }` | `{ data: LocalServicio }` | **Story 2.1.** Habilita o deshabilita el servicio en esta sede. `locales: gestionar` (sin él, 403 `sin_permiso`); sede fuera del alcance → 404 |
| PUT | `/locales/{localId}/profesionales/{profesionalId}` | ver §3 | `{ data: LocalProfesional }` | `syncWithoutDetaching`: asigna y edita. **Parcial**: el interruptor manda `{habilitado}` a secas. Con alcance por sedes, un profesional sin fila en ninguna de sus sedes da **404**: el administrador de sede no se trae a nadie de otra (1.8, decidido el 2026-10-31) |
| POST | `/inventario/{id}/movimiento` | `{ tipo, cantidad, motivo }` | `{ data: Producto }` | el backend recalcula `stock` |
| GET | `/caja` | — | `{ data: EstadoCaja }` | sesión de hoy + movimientos, en una llamada |
| POST | `/caja/abrir` | `{ monto_inicial }` | `{ data: CajaSesion }` | |
| POST | `/caja/cerrar` | `{ monto_final }` | `{ data: CajaSesion }` | |
| POST | `/caja/movimientos` | `{ tipo, monto, concepto }` | `{ data: MovimientoCaja }` | acumula en `ingresos`/`egresos` del día |
| GET | `/configuracion` | — | `{ data: Configuracion }` | |
| PUT | `/configuracion` | **parche** de `Configuracion` (multipart si hay logo/cover) | `{ data: Configuracion }` | una petición por sección |
| GET | `/configuracion/direccion/disponible` | `?slug=` | `{ data: { disponible, motivo? } }` | Story 6.1. `motivo`: `formato` \| `reservado` \| `ocupado`; el texto lo pone el panel. Requiere `configuracion: gestionar` |
| PUT | `/configuracion/direccion` | `{ slug }` | `{ data: { slug, url } }` | Story 6.1. Cambia la dirección pública; la anterior **sigue llevando** a la tienda (ver «Tienda pública»). 422 en `slug` por formato, reservado u ocupado. Requiere `configuracion: gestionar` |
| GET | `/reportes` | `?desde&hasta` | `{ data: Reporte }` | todo el informe en una respuesta |
| GET | `/reportes/exportar` | `?desde&hasta` | **CSV** (`responseType: blob`) | con BOM, para que Excel lea los acentos |
| GET | `/suscripcion` | — | `{ data: Suscripcion }` | banner de prueba + Mi Plan |
| GET | `/planes` | — | `{ data: Plan[] }` | ordenados por `precio_mensual` |
| POST | `/plan/{planId}/solicitar` | `{ extra_profesionales, extra_whatsapp }` | 200 | **no cobra**: abre un ticket de soporte |

### Tienda pública — sin sesión, bajo `/publico/*`

| Método | Ruta | Query / payload | Respuesta |
|---|---|---|---|
| GET | `/publico/{slug}` | — | `{ data: { negocio, locales } }` |
| GET | `/publico/{slug}/sucursal/{sede}` | — | `{ data: TiendaLocal }` |
| GET | `/publico/{slug}/sucursal/{sede}/horarios` | `?profesional_id&fecha&duracion_min` | `{ data: string[] }` — `["09:00","09:45",…]` |
| POST | `/publico/{slug}/sucursal/{sede}/reservar` | `ReservaPayload` | `{ data: ReservaConfirmada }` |

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

**Imágenes.** Hoy las URLs de logo y banner van a Laravel
(`/api/archivos/{id-del-negocio}/…`), así que llevan el id interno. Se cambia en
la Story 5.2 (claves opacas en R2 detrás de Cloudflare), antes de que la 6.3
muestre fotos en la tienda.

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

```jsonc
// GET /caja  → el estado completo de la pantalla
{
  "fecha": "2026-08-14",
  "sesion": {                        // null = no se ha abierto caja hoy
    "id": 12,
    "fecha": "2026-08-14",
    "monto_inicial": 200,
    "ingresos": 1340.5,              // acumulados por el backend
    "egresos": 85,
    "monto_final": null,             // null = LA CAJA SIGUE ABIERTA
    "abierta_por": "Ana Torres",
    "abierta_en": "2026-08-14T08:12:00Z",
    "cerrada_en": null
  },
  "movimientos": [
    { "id": 3, "tipo": "ingreso", "monto": 120, "concepto": "Cita 14:00",
      "fecha": "2026-08-14", "creado_en": "2026-08-14T14:41:00Z",
      "usuario": "Ana Torres" }
  ]
}
```

> ⚠️ **Divergencia deliberada con el backend anterior.** Allí `saldo` guardaba
> primero el monto inicial y al cerrar se sobrescribía con el final: se perdía
> con cuánto se abrió y no había forma de saber si la caja seguía abierta. Aquí
> son **dos columnas** y `monto_final: null` es el marcador de "abierta". El
> frontend calcula el saldo esperado (`inicial + ingresos − egresos`) y la
> diferencia de arqueo; el backend no las manda.

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
| `actual` / `anterior` | `{ citas, completadas, canceladas, ingresos, ocupacion, inasistencias }` — los dos últimos en % |
| `por_servicio` / `por_profesional` | `{ id, nombre, total, monto_total }[]` |
| `horas` | `["09:00","10:00",…]` — franjas del negocio |
| `por_hora` | `{ dia: "Lunes", data: number[] }[]` — alineado con `horas` |
| `fuentes` | `{ clave, label, actual, anterior }[]` — `web` / `panel` / `publica` |
| `diario` | `{ etiqueta: "12/08", actual, anterior: number\|null }[]` — la etiqueta ya viene formateada |

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

  ⚠️ **Cambio aprobado el 2026-09-19, pendiente de implementar** (PRD FR-77 a FR-79, FR-82): la marca pasa a ser
  **`apariencia`**, la misma en todas las sedes y en todos los planes:
  ```jsonc
  "color_primario": "#9B2C5A",          // el texto encima se calcula (AA)
  "texto_sobre_color": "claro",          // "claro" | "oscuro" — solo lectura
  "logo_url": "…/logo-512.webp",
  "apariencia": {
    "portada_estilo": "foto",             // "solido" | "degradado" | "foto"
    "degradado": "atardecer",             // clave de la selección, o "de_mi_color"
    "portada": {                          // null si no hay foto
      "url_2400": "…", "url_1600": "…", "url_800": "…",
      "enfoque": { "x": 0.42, "y": 0.35 } // 0–1, punto que se mantiene visible
    }
  }
  ```
  - `color_secundario` **se retira** de la respuesta y del payload.
  - Payload multipart: `color_primario`, `logo: File`, `portada: File`,
    `apariencia[portada_estilo]`, `apariencia[degradado]`,
    `apariencia[enfoque][x|y]`, más `logo_eliminar` y `portada_eliminar`.
  - 422: logo que no sea PNG, JPG o WebP, de más de 1 MB o menor de 256 × 256;
    portada de más de 5 MB o menor de 1600 × 600; color sin contraste posible
    (`errors.color_primario`).
  - «Publicar» es este mismo `PUT`: no existe borrador en el servidor en esta
    versión.
- **Sitio público**: `sitio_publico_activo`, `mostrar_en_marketplace`,
  `terminos_servicio?`
- **`agenda`**: `{ modo_intervalo: "duracion_servicio"|"fijo", intervalo_min }`
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
// ⚠️ Cambio aprobado el 2026-09-19, pendiente de implementar (FR-77, FR-81, FR-82):
// negocio gana: logo_url, color_primario, texto_sobre_color, apariencia (igual
//   que en Configuración); es la identidad de TODAS las sedes.
// LocalPublico pierde banner_url, logo_url y color (el `slug` ya está, 6.2).

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
GET /caja                          → { sesion, movimientos }
sesion === null          → solo se ofrece "Abrir caja"
monto_final === null     → abierta: se pueden registrar movimientos y cerrar
monto_final !== null     → cerrada: solo lectura, con la diferencia de arqueo

POST /caja/abrir        { monto_inicial }   ↻ caja
POST /caja/movimientos  { tipo, monto, concepto }   ↻ caja
POST /caja/cerrar       { monto_final }     ↻ caja
```

Las tres acciones invalidan el estado completo: la pantalla no sirve por partes.

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
