---
title: 'Story 1.4: Nadie concede lo que no tiene'
type: 'bugfix'
created: '2026-09-28'
status: 'done'
route: 'full'
route_source: 'auto'
review: 'thorough'
review_source: 'auto'
lenses_ran: ['blind-hunter', 'edge-case-hunter', 'verification-gap', 'intent-alignment']
review_loop_iteration: 0
context: []
baseline_commit: 'b7c6355b6ddbf7a8084e65c64e5ea99058aa97dc'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `/usuarios` y `/roles` ya son solo del administrador general
(`Rango::soloElAdminGeneral`), pero `POST /profesionales` —y `PUT
/profesionales/{id}` a una ficha sin cuenta— crean cuentas a través de
`UsuarioService::crear()` con solo `empleados: gestionar`. Un administrador de
sede da así cualquier rol salvo el general (uno propio con Configuración o
Facturación) y la cuenta nace con `todos_los_locales = true`. Es el hueco
**G-4**: escalada fuera de su autoridad.

**Approach:** La regla «nadie concede lo que no tiene» vive en
`App\Support\Rango` y la llama `UsuarioService` al crear y al editar, que es
por donde pasan todos los caminos. Invitar (crear una cuenta) es solo del
administrador general (A-1); el rol asignado debe tener permisos ⊆ los del
actor y el alcance contenido en el suyo; el general puede todo salvo un segundo
general.

## Boundaries & Constraints

**Always:**
- Una regla, un sitio: `Rango`. Puntos de llamada permitidos: el service
  (obligatorio) y, si hace falta cortar antes de validar, un Form Request.
  Nunca una copia de la regla.
- El actor lo resuelve el service desde el id central que recibe (como
  `CitaService`), nunca lo entrega el llamador como `Capacidades`.
- Invitar lo hace solo el administrador general, por cualquier camino:
  `POST /usuarios`, `POST /profesionales` con `usuario`, y `PUT
  /profesionales/{id}` con `usuario` a una ficha sin cuenta. Otro actor → 403
  `codigo: sin_permiso`, mensaje en español, y **no se crea nada** (ni la
  ficha de profesional ni la cuenta central).
- «Permisos ⊆»: para cada módulo, el nivel del rol no supera el del actor
  (`null` < `ver` < `gestionar`); y si el actor tiene `solo_propios`, el rol
  también. El general cumple siempre.
- «Alcance contenido»: `todos_los_locales` solo si el actor lo tiene; una lista
  de sedes solo con sedes del alcance del actor.
- **Decisión (2026-09-28): 403 `sin_permiso`** también para «concede más»
  (permisos o alcance), como pide la historia y no 422 como el PRD: es falta de
  permiso, y el panel pinta el mismo aviso.
- **Decisión (2026-09-28): asignar el alcance de una cuenta NO entra aquí.**
  Ningún endpoint escribe hoy `todos_los_locales` ni `usuario_local`, y eso
  llega con la 1.8. La 1.4 deja la regla de alcance en `Rango` probada
  directamente; como solo el general invita, las cuentas siguen naciendo con
  todas las sedes sin escalada.
- Se conservan: un solo administrador general (422 en `rol_id` / 
  `usuario.rol_id`, como hoy) y el general no cambia de rol.

**Never:**
- No tocar `/roles` ni la matriz de presets (Recepción es la 1.5).
- No cambiar la forma de las respuestas de `/usuarios` ni de `/profesionales`.
- No aplicar el alcance a profesionales (1.8).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Sede invita por profesionales | Admin de sede, `POST /profesionales` con `usuario` | **403** `sin_permiso`; ni ficha ni cuenta | Mensaje en español |
| Sede da cuenta al editar | Admin de sede, `PUT /profesionales/{id}` sin cuenta, con `usuario` | **403**; la ficha no cambia | Mensaje en español |
| Sede sin cuenta | Admin de sede, `POST /profesionales` sin `usuario` | 201, como hoy | Sin error |
| General invita | Admin general, cualquier rol no general, cualquier camino | 201 | Sin error |
| Segundo general | Admin general, `rol_id` del general | 422 como hoy | Mensaje en español |
| Rol con más permisos | Actor no general (prueba directa de `Rango`) con rol ⊄ suyo, o rol sin `solo_propios` si el actor lo tiene | **403** `sin_permiso` | Mensaje en español |
| Alcance mayor | Actor con alcance acotado (prueba directa de `Rango`), cuenta con `todos_los_locales` o sede ajena | **403** `sin_permiso` | Mensaje en español |
| Mismo o menos | Actor no general, rol ⊆ y alcance contenido (prueba directa) | Se permite | Sin error |

</frozen-after-approval>

## Code Map

- `app/Support/Rango.php` — hoy solo `soloElAdminGeneral(?User)` (403
  `sin_permiso`, mira `users.rol`). Aquí va la regla nueva; reutilizar el mismo
  cuerpo de 403.
- `app/Support/Capacidades.php` — `deUsuarioCentral(int)`, `permisos()` (14
  módulos, `null` sin acceso), `soloPropios()`, `locales()` (`null` = todas).
- `app/Models/Rol.php` — `permisosCompletos()`, `solo_propios`,
  `esAdminGeneral()`.
- `app/Services/UsuarioService.php` — `crear(array $datos, string $campo)`
  (:62; ya llama `prohibirAdminGeneral`) y `actualizar()` (:131, llama
  `protegerAlAdminGeneral`). Recibirán el id central del actor.
- `app/Http/Controllers/UsuarioController.php` — `store`/`update` ya llaman
  `soloElAdminGeneral`; pasar `$request->user()->id` al service.
- `app/Services/ProfesionalService.php` — `crear()` (:35) llama
  `cuentaSiSePide()` (:191) ANTES de la transacción de la ficha;
  `actualizar()` (:81) la llama si `usuario_id` es null. Pasar el actor.
- `app/Http/Controllers/ProfesionalController.php` — pasa el actor al service.
- `app/Models/Usuario.php` — `todos_los_locales` (default `true`), `locales()`.
- Pruebas: `tests/Feature/Usuarios/UsuariosTest.php`,
  `tests/Feature/Profesionales/ProfesionalesTest.php` (buscar las que crean
  cuenta como admin local: hoy esperan 201).
- `docs/pendientes-contrato.md` — anotar el 403 al invitar por profesionales.

## Tasks & Acceptance

**Execution:**
- [x] `app/Support/Rango.php` -- regla única: solo el general invita; permisos ⊆ y alcance contenido -- G-4 en un sitio
- [x] `app/Services/UsuarioService.php`, `app/Services/ProfesionalService.php` y sus controladores -- recibir el actor y llamar a `Rango` al crear y editar, antes de escribir nada -- todos los caminos
- [x] `tests/Feature/Profesionales/ProfesionalesTest.php`, `tests/Feature/Usuarios/UsuariosTest.php` y una prueba directa de `Rango` -- una por fila de la matriz, con base intacta en los rechazos -- fijar la regla
- [x] `docs/pendientes-contrato.md` -- anotar el nuevo 403 -- el panel debe ocultar «dar acceso» al admin de sede

**Acceptance Criteria:**
- Given la regla implementada, when se busca la comprobación de permisos ⊆ en `app/`, then vive solo en `Rango`.
- Given la suite completa, when se ejecuta, then todo en verde, incluidas las pruebas de aislación.

## Implementation Notes

## Spec Change Log

## Review Triage Log

**Pasada 1 (2026-09-29)** — 4 lentes sobre el diff desde `b7c6355`; pruebas
afectadas verdes (76). Veredictos: 2 medium y 4 low (patch), 1 medium (defer),
10 rechazados. **Sin loopback.**

| # | Lente | Veredicto | Ruta | Evidencia |
|---|---|---|---|---|
| 1 | blind+edge | **medium** | patch | Dos definiciones de «administrador general» dentro de `Rango`: `soloElAdminGeneral(User)` mira `users.rol` y `soloElAdminGeneralInvita(Capacidades)` mira `roles.clave`. Es la regla escrita dos veces que prohíbe el bloque Always. Arreglo: una sola — el service llama `Rango::soloElAdminGeneral(User::find($actorCentralId))`, se borran `soloElAdminGeneralInvita` y `Capacidades::esAdminGeneral`, y `rolContenido`/`alcanceContenido` dejan el atajo del general (lo pasa solo: `gestionar` en los 14 módulos, sin `solo_propios`, con todas las sedes). |
| 2 | edge | **medium** | patch | Comprobado: `ProfesionalRequest` valida `usuario.email` con `unique` global antes del 403 del service y no tiene `authorize()`. Un admin de sede aprende si un correo existe en CUALQUIER negocio (422 «ya existe» contra 403). Igual en `UsuarioRequest`. Arreglo: `authorize()` con `Rango::soloElAdminGeneral` en los dos (en `ProfesionalRequest`, solo si llega `usuario`), el segundo punto de llamada que permite la historia. De paso el 403 gana al 422 del cupo. |
| 3 | blind+edge | low | patch | `UsuarioService::actualizar()` no exige ser el general: ese candado vivía solo en el controlador. Una línea en el service. Deja sin objeto «degradar una cuenta que te supera». |
| 4 | verif-gap | low | patch | Pre-verificado: quitar las llamadas de `UsuarioService` a `Rango` no rompe ninguna prueba (todas las del service van con el general). Pruebas a nivel de service con un actor no general → 403 y nada escrito. |
| 5 | verif+edge | low | patch | `alcanceContenido` (y `rolContenido` con un rol vacío) pasan con un actor SIN cuenta: falla abierto en un método público. Sin API nueva: `permisos() === []` solo sin cuenta → 403. |
| 6 | blind | low | patch | Funciones globales de `RangoTest.php` con nombres genéricos (riesgo de «cannot redeclare» en toda la suite): prefijarlas. La prueba de editar no comprueba `Notification::assertNothingSent()`. |
| 7 | blind | **medium** | defer | La cuenta (central + `usuarios` + invitación) se crea ANTES de la transacción de la ficha: si `rellenar()` falla, queda huérfana con la invitación enviada. Previo a la 1.4. En `deferred-work.md`. |
| 8 | blind+edge | low | rechazado | `PUT /profesionales/{id}` con `usuario` a una ficha que ya tiene cuenta se ignora con 200: previo y documentado; con #2 un no general ya recibe 403. |
| 9 | blind | low | rechazado | `/capacidades` no dice quién es el general: el panel tiene `usuario.rol` del login, la misma fuente que queda tras #1. |
| 10 | blind | low | rechazado | La petición al frontend en Traspasos de `estado.md`: sustituido desde el 2026-09-20; se anota en `sprint-status.yaml` al cerrar. |
| 11 | blind | low | rechazado | Bordes de `rolContenido` (módulo en `null`, clave fuera de `MODULOS`, nivel desconocido): `permisosCompletos()` normaliza y `nivel()` da 0. |
| 12 | blind | low | rechazado | `alcanceContenido` acepta `[]`: si una cuenta sin sedes vale lo decide la 1.8. |
| 13 | blind | low | rechazado | La recarga del rol sin prueba propia: la fija `data.rol.clave` en `UsuariosTest`. |
| 14 | edge | false | rechazado | «`actualizar` no comprueba el alcance»: no lo edita (decisión congelada, 1.8). |
| 15 | intent | false | rechazado | Rechazos inalcanzables por HTTP y 403 en vez de 422: las dos decisiones congeladas del 2026-09-28. |
| 16 | intent | low | rechazado | La recarga del rol no estaba en la intención: arreglo de un fallo que destapó la prueba nueva. |
| 17 | blind | low | rechazado | `actorCon` sin `email_verified_at`: fixture de prueba sin efecto en lo comprobado. |

## Verification

**Commands:**
- `C:/laragon/bin/php/php-8.3.33-nts-Win32-vs16-x64/php.exe artisan test --filter="Profesionales|Usuarios|Rango"` -- expected: verde
- `C:/laragon/bin/php/php-8.3.33-nts-Win32-vs16-x64/php.exe artisan test` -- expected: todo verde (antes de mergear)
