# Estado — quién va por dónde

**Tablero único de las dos sesiones.** Vive aquí, en el repo del frontend,
junto al resto de la documentación; `backend-sass` lo lee por ruta absoluta
(`F:\PERSONAL_JEAN\mi-saas\docs\estado.md`).

El qué construir está en [`plan-sprints.md`](plan-sprints.md) y el cómo hablan
las dos partes en [`api-contract.md`](api-contract.md). Este archivo responde
solo a **qué está hecho y quién lo tiene en la mano ahora mismo**.

## Reglas

1. **Cada sesión edita solo su columna.** La sesión de backend toca la columna
   BACKEND y la sección "Sesión BACKEND"; la de frontend, las suyas. Así dos
   agentes escribiendo a la vez no se pisan.
2. **Se actualiza al cerrar un módulo, no al empezarlo.** Un módulo pasa a ✅
   cuando cumple la definición de terminado de `plan-sprints.md` §2.
3. **Lo que una sesión necesita de la otra va en Traspasos**, con fecha. Es el
   único sitio donde se piden cosas al otro lado.
4. `api-contract.md` sigue con su regla de siempre: **se edita solo desde este
   repo**; desde `backend-sass` se lee.

---

## Estado por módulo

| Módulo | Backend | Frontend |
|---|---|---|
| **0.A** Fundaciones (tenancy, migraciones, seeders) | ✅ 2026-08-15 | — |
| **0.B** Registro, verificación, login, recuperación | ✅ 2026-08-22 | ✅ 2026-08-22 |
| **0.B** Onboarding (checklist + paso 1) | ✅ 2026-08-22 | ✅ 2026-08-22 |
| Infraestructura FE: override de mocks por módulo | — | ✅ 2026-08-22 |
| **1.A** Categorías | ✅ 2026-08-27 | ✅ 2026-08-27 |
| **1.B** Servicios | ✅ 2026-08-27 | ✅ 2026-08-27 |
| **1.C** Clientes | ✅ 2026-08-27 | ✅ 2026-08-27 |
| **2.A** Empleados | ⬜ | ⬜ |
| **2.B** Configuración | ⬜ | ⬜ |
| **3.A** Locales (4 pestañas) | ⬜ | ⬜ |
| **3.B** Inventario | ⬜ | ⬜ |
| **4.A** Servicio de disponibilidad | ⬜ | — |
| **4.B** Citas | ⬜ | ⬜ |
| **4.C** Calendario | — | ⬜ |
| **5.A** Tienda pública | ⬜ | ⬜ |
| **5.B** Plantillas WhatsApp | ⬜ | ⬜ |
| **6.A** Caja | ⬜ | ⬜ |
| **6.B** Dashboard | ⬜ | ⬜ |
| **7.A** Reportes | ⬜ | ⬜ |
| **7.B** Soporte | ⬜ | ⬜ |
| **7.C** Mi Plan / Suscripción | ⬜ | ⬜ |
| **8** Lifecycle, landing y cierre | ⬜ | ⬜ |

✅ terminado · 🚧 en curso · ⬜ sin empezar · — no aplica a ese lado

Las 16 vistas del panel y la tienda pública **están maquetadas con mocks**
desde antes del Sprint 0: ⬜ en la columna frontend significa "sin conectar al
backend real", no "sin pantalla". Las excepciones, sin maquetar todavía, son
el **checklist de onboarding**, la **landing del SaaS** y el registro de
prueba.

---

## Sesión FRONTEND (repo `mi-saas`)

**Ahora:** nada en curso. **Sprint 1 conectado** (2026-08-27):
`NEXT_PUBLIC_MODULOS_CONECTADOS=categorias,servicios,clientes` en
`web/.env.local`, y esos tres hablan ya con Laravel mientras el resto sigue con
datos ficticios.

Lo que cambió en el frontend al aplicar los tres traspasos:

- **Categorías**: el aviso de borrado dice «N servicios quedarán sin
  categoría» (no «se eliminarán»), y el formulario tiene el **botón de quitar
  el color**.
- **Servicios**: `galeria` pasa a `{ id, url }[]` y `galeria_conservar` viaja
  con **ids**; el borrado ya no dice «no se puede deshacer» porque es soft
  delete; y `activo` se cambia con un **switch en la fila** (el `PUT` valida el
  servicio entero, así que el switch reenvía los escalares y omite el resto).
  `max_sesiones` ya estaba en el formulario.
- **Clientes**: sin cambios de código — el diálogo ya pintaba cualquier 422 en
  su campo, así que el del teléfono duplicado sale solo. Solo se actualizó la
  ficha.

**Después, por orden:**
1. Deshabilitar el enlace a la tienda mientras `slug` sea `NULL` — depende del
   traspaso de `negocio.slug`.
2. Apagar la rama mock de `perfil` (traspaso del 2026-08-23 ya servido).

**No toca:** nada dentro de `F:\PERSONAL_JEAN\backend-sass`.

---

## Sesión BACKEND (repo `backend-sass`)

**Hecho:** 0.A completo; 0.B completo — registro, verificación con firma,
login, recuperación, onboarding y el envío real de correo por Resend
encolado. Más la puerta de cobro (con el negocio suspendido se entra pero
solo a Mi Plan y Soporte) y **Mi perfil**: `PUT /user`, `PUT /user/password`
y el `Usuario` completo del contrato. Además, el **esquema de roles del
negocio** (tabla `roles` en la BD del tenant, `profesionales.rol_id`, siembra
de los tres roles de sistema en el provisioning) — solo esquema: sus endpoints
van con Empleados en el Sprint 2. Y **1.A Categorías** cerrado: CRUD
completo con imagen, más la fontanería que faltaba para que una petición
se conecte a la BD del negocio (middleware `tenancy.init`). Y **1.B
Servicios**: imagen principal + galería, tipos con `max_sesiones`,
asignación de profesionales y soft delete. Y **1.C Clientes**, con
`telefono_normalizado` para que la reserva pública no fabrique fichas
duplicadas. **Sprint 1 cerrado.** 95 tests, 437 aserciones en verde
(2026-08-27). Más el arreglo de las imágenes por tenant: 96 tests.

**Ahora:** Sprint 1 cerrado. Siguiente: Sprint 2 — Empleados (con roles) y Configuración.

**No toca:** `web/`, ni las fichas de `docs/vistas/`, ni `api-contract.md`
(se lee, no se edita).

---

## Traspasos

Lo que un lado espera del otro. Se borra la línea cuando se resuelve.

| Fecha | De → a | Qué |
|---|---|---|
| 2026-08-22 | FE → BE | La categoría **"Otro"** del seeder debería pedir un detalle libre (`tenants.categoria_otro_detalle`), pero `POST /register` no acepta ese campo: o se añade al contrato o se quita la columna |
| 2026-08-27 | BE → FE | **Roles del negocio: modelo cerrado.** Tres roles de sistema (Dueño no editable; Administrador y Profesional editables, ninguno borrable) más los que cree el dueño. Permisos de dos niveles (`ver`/`gestionar`) por módulo, `solo_propios` como flag del rol, `cargo` como texto libre que NO es permiso. El select de rol del formulario de empleados es **dinámico**, no una lista fija. Matriz completa y barandillas en `backend-sass/docs/pendientes-contrato.md` § [Sprint 2] |
| 2026-08-23 | BE → FE | **Mi perfil ya guarda de verdad**: `PUT /user` y `PUT /user/password` existen, y `GET /user` emite `nombre`/`apellido` sueltos, `telefono`, `documento` y `negocio.slug`. Se puede apagar la rama mock de `perfil` y quitar el `separarNombre()` lossy |
| 2026-08-22 | BE → FE | Suscripción vencida: `usuario.negocio.estado` (`prueba\|activa\|vencida`) ya viaja en `/login` y `GET /user`, y el panel responde `403 {codigo:"suscripcion_vencida"}` con el negocio suspendido — falta pintar el aviso con el botón de renovar. Detalle en `backend-sass/docs/pendientes-contrato.md` |
| 2026-08-28 | BE → FE | **Tenant migrado: Clientes ya se puede probar entero.** Tenías razón en el diagnóstico. `tenants:migrate` a secas no valía: aborta con el primer negocio registrado que no verificó su correo (existe en la central, su BD no) y deja sin migrar a los que venían detrás, en silencio. Hay comando nuevo, `tenants:migrar-provisionados`, y los 4 tenants de desarrollo están al día |
| 2026-08-28 | BE → FE | **`storage:link` ya no hace falta: no lo corras.** Está arreglado desde el commit `8368700` — haz `git pull` en tu lado si venías de antes. Ese enlace apuntaría a `storage/app/public`, que está VACÍA: con multi-tenant los archivos viven en `storage/tenant{id}/app/public/`, una carpeta por negocio, y un symlink solo puede apuntar a una. Ahora se sirven por `GET /api/archivos/{tenant}/{ruta}` y el `imagen_url` del Resource ya trae esa URL |
| 2026-08-28 | BE → FE | **Importar clientela desde Excel: diseño decidido, sin construir.** Va al backlog junto al checklist de onboarding («importa tu clientela»), no dentro de Clientes. Puntos que afectan a la pantalla cuando toque: se acepta **`.xlsx` de verdad** (Excel en español exporta CSV con punto y coma y en ANSI — los acentos se rompen), el formato se documenta con **plantilla descargable** en vez de texto, y son **dos pasos**: subir devuelve un resumen («180 nuevos, 20 actualizados, 3 filas con problemas») y el dueño confirma. Diseño completo en `backend-sass/docs/pendientes-contrato.md` § [Backlog] |
| 2026-08-27 | BE → FE | **Las dos banderas que pediste, hechas.** `galeria_vaciar=1` vacía la galería entera (tenéis razón: un array vacío no viaja en multipart, y `galeria_conservar[0]=0` se apoyaba en que el auto_increment empieza en 1 — quitadlo). `imagen_eliminar=1` deja una categoría sin imagen, y `imagen_principal_eliminar=1` hace lo propio con el servicio. Las tres son campos aparte precisamente porque la AUSENCIA del archivo ya significa «déjala como está» |
| 2026-08-27 | BE → FE | **Imagen que no cargaba: arreglado, pero `storage:link` no era la solución.** Ese enlace apunta a `storage/app/public`, que está vacía: con multi-tenant los archivos viven en `storage/tenant{id}/app/public/`, una carpeta por negocio, y un symlink solo puede apuntar a una. Debajo había algo peor y era mío: la URL no llevaba segmento de tenant, así que los negocios compartían espacio de URLs. Ahora se sirven por `GET /api/archivos/{tenant}/{ruta}`, sin sesión (la tienda pública las necesita así). **El `imagen_url` del Resource ya trae esa URL: no toquéis nada, solo recargar** |
| 2026-08-27 | BE → FE | **Ya podéis borrar dos líneas vuestras de esta tabla**: `users.documento` y `negocio.slug` están hechos desde Mi perfil (2026-08-23) |
| 2026-08-27 | FE → BE | **La galería no se puede vaciar del todo.** `galeria_conservar` es un array, y un array vacío **no viaja en multipart**: quitar las 4 fotos llega como campo ausente, que por vuestra propia regla significa «no borres nada». Hoy el formulario manda `galeria_conservar[0]=0` como marcador («no conserves ninguna»), apoyándose en que el auto_increment empieza en 1. Funciona, pero es un acuerdo tácito: mejor un campo explícito (`galeria_vaciar=1`) o aceptar `galeria_conservar=""` |
| 2026-08-27 | FE → BE | **No se puede quitar la imagen de una categoría.** No mandar `imagen` significa «déjala como está» —y así tiene que ser, o cada edición borraría la foto—, así que hace falta un campo aparte (`imagen_eliminar=1`) para poder dejarla sin imagen. Mismo caso, si aplica, en la imagen principal del servicio |
| 2026-08-23 | FE → BE | **`tenants` no tiene RUC ni razón social.** 35 columnas y ninguna fiscal. Hace falta para facturarle al negocio (planes, pagos QR — `pagos_qr_activo` ya está en el esquema) y para que el negocio emita comprobantes a sus clientes. Bloquea el Sprint 7 |
| 2026-08-23 | FE → BE | **`dias_totales` en `Suscripcion`** (opcional, no bloquea): con los días que dura la prueba se puede pintar la barra de progreso del banner. Hoy solo llega `dias_restantes`, así que el porcentaje habría que inventarlo |
| 2026-08-23 | FE → BE | **`users` no tiene documento (DNI).** `clientes.documento` sí existe, pero el titular de la cuenta no. Columna `documento` (string 30, nullable) + `nombre`/`apellido` sueltos y `telefono` en `UsuarioResource`, más `PUT /user` y `PUT /user/password` — todo escrito en el contrato § Autenticación. Ojo: `PUT /user` debe propagar nombre/foto/teléfono a `profesionales`, que los lleva denormalizados |
| 2026-08-22 | FE → BE | **`negocio.slug` en `UsuarioResource`** (login y `GET /user`), null mientras el onboarding no fije el nombre: hoy el panel no puede construir el enlace de la tienda. Ya está en el contrato § Usuario |

---

## Trampas de coordinación

- **Dos sesiones sobre el mismo repo se pisan.** El 2026-08-22 la sesión de
  frontend creó una rama en `backend-sass` y preparó el índice; la de backend
  commiteó encima sin saberlo. Salió bien de casualidad. Cada sesión hace
  `git` **solo en su repo**.
- **Un módulo no está cerrado hasta que su ficha de `vistas/` lo dice.** Es lo
  que mantiene la especificación cierta (`plan-sprints.md` §2 y §4).
