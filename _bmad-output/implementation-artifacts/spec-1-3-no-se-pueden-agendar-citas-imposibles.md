---
title: 'Story 1.3: No se pueden agendar citas imposibles'
type: 'bugfix'
created: '2026-09-28'
status: 'done'
route: 'full'
route_source: 'auto'
review: 'thorough'
review_source: 'auto'
lenses_ran: ['blind-hunter', 'edge-case-hunter', 'verification-gap', 'intent-alignment']
review_loop_iteration: 1
context: []
baseline_commit: 'd3f42716cb0231ee3bf24ec6544eaeb7a4b65d91'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `CitaService` agenda con cualquier profesional que exista: dado de
baja (`activo = false`), sin fila habilitada en `local_profesional` para la sede
de la cita, o sin el servicio en `servicio_profesional`. Es el hueco **G-3**:
se promete al cliente algo que nadie va a atender.

**Approach:** Un único método reutilizable en `CitaService` («¿es reservable
esta combinación profesional + servicio + sede?») que `crear()` y `actualizar()`
llaman después de resolver la sede (G-2) y antes del anti-solape. La Épica 2
le añadirá la dimensión `local_servicio` (FR-67) sin duplicarlo.

## Boundaries & Constraints

**Always:**
- La regla vive solo en `CitaService` (NFR-12), dentro de la transacción y
  antes de escribir. Un solo método; ninguna copia en controlador ni Form
  Request.
- 422 en español: profesional inactivo o no habilitado en la sede → en
  `empleado_id`; profesional que no presta el servicio → en `servicio_id`,
  **nombrando el servicio** (p. ej. «Rosa Paredes no presta «Corte de
  cabello».»). Ningún mensaje depende del género del nombre (nada de «está
  dado de baja» tras «Rosa Paredes»).
- Orden de chequeos: `solo_propios` (G-1) → sede (G-2) → reservable (G-3) →
  hueco libre. El 404 de la cita ajena sigue ganando (controlador).
- Cita sin sede (`local_id` NULL: negocio sin locales, o cita antigua sin
  sede) → la dimensión sede no aplica; activo y servicio sí.
- «Habilitado en la sede» = fila en `local_profesional` con `habilitado = true`.
- **Decisión (2026-09-28): estricto + migración de datos.** FR-67 sin
  excepciones para pivotes vacíos. Una migración **nueva** de tenant rellena
  los datos existentes para que hoy no se rompa ninguna agenda: cada
  profesional (no borrado) **sin ninguna fila** en `local_profesional` queda
  habilitado en todas las sedes (no borradas); cada servicio (no borrado)
  **sin ningún profesional** en `servicio_profesional` queda asignado a todos
  los profesionales (no borrados); y cada profesional (no borrado) **sin ningún
  servicio** pasa a prestar todos los servicios (no borrados); y cada sede (no
  borrada) **sin ningún profesional vivo** queda con todos los profesionales
  (no borrados) habilitados (2026-09-28, `bmad-code-review`) — ampliado el
  2026-09-28 tras la revisión: si no, quien antes lo agendaba todo no agendaría
  nada tras desplegar. Lo que ya tiene filas no se toca: una
  asignación deliberada no se ensancha. Idempotente; en una base recién
  provisionada no hace nada. Se despliega con `tenants:migrar-provisionados`.
- **Decisión (2026-09-28): al editar, solo si cambia la promesa.** En
  `actualizar()` la reservabilidad se comprueba solo si cambia el profesional,
  el servicio, la sede o el inicio (`starts_at`) respecto a lo guardado.
  Cambiar estado, notas, monto, cliente o productos no la comprueba: la cita de
  un profesional dado de baja se puede seguir cerrando. **Excepción
  (2026-09-28, `bmad-code-review`):** REABRIR cuenta como promesa nueva: pasar
  de `cancelada` a un estado activo (`pendiente`, `confirmada`, `en_curso`) sí
  la comprueba.
- **Decisión (2026-09-28, tras la revisión): lo nuevo nace asignado.** La
  migración solo arregla lo que existe; sin esto, todo lo creado después nace
  sin poder agendarse (una sede nueva deja sin agenda a un negocio de una
  sede, y la `reserva_prueba` del dueño independiente falla). Al CREAR se
  asigna todo y el negocio recorta después:
  - Sede nueva (`LocalService::crear`) → habilita a todos los profesionales
    no borrados, **también los de baja** (2026-09-28, `bmad-code-review`: así
    un profesional reactivado ya está en las sedes creadas mientras tanto,
    igual que con servicios).
  - Profesional nuevo (`ProfesionalService::crear`) → habilitado en todas las
    sedes (no borradas) y presta todos los servicios (no borrados). La 1.8
    acotará luego el alta a las sedes propias.
  - Servicio nuevo (`ServicioService::crear`, también el que restaura uno
    borrado) con `empleado_ids` ausente **o vacío** → lo prestan todos los
    profesionales (no borrados). El formulario del panel manda siempre
    `empleado_ids`, `[]` si no se eligió a nadie. Al EDITAR, `[]` sigue
    significando «desasignar a todos».
  - El provisioning no cambia: al provisionar no hay sedes ni servicios; los
    recibe el dueño independiente por las dos reglas anteriores.

**Never:**
- No crear `local_servicio` ni filtrar servicios por sede (Épica 2).
- No tocar `Disponibilidad`, `GET /citas/opciones` ni los selectores (1.7).
- No cambiar la forma de la respuesta ni `api-contract.md`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Combinación válida | Activo, habilitado en la sede, presta el servicio | 201 | Sin error |
| Profesional inactivo | `activo = false` | **422** `empleado_id`, ninguna cita | Mensaje en español |
| No trabaja en esa sede | Sin fila, o `habilitado = false`, en esa sede | **422** `empleado_id` | Mensaje en español |
| No presta el servicio | Sin fila en `servicio_profesional` | **422** `servicio_id`, nombra el servicio | Mensaje en español |
| Negocio sin sedes | `local_id` NULL, activo y presta el servicio | 201 | Sin error |
| Editar a combinación imposible | `PUT` cambiando a un profesional que no presta el servicio | **422**, la cita no cambia | Mensaje en español |
| Cerrar cita de profesional dado de baja | Cita guardada con profesional ahora inactivo; `PUT` misma combinación y hora, `estado` = `completada` | 200 | Sin error |
| Reprogramar esa cita | Igual, pero cambia la hora, o solo la fecha | **422** `empleado_id` | Mensaje en español |
| Cerrar sin sede | Negocio sin sedes, profesional ahora inactivo; `PUT` solo `estado` | 200 | Sin error |
| Migración: pivotes vacíos | Profesional sin sedes; servicio sin profesionales; profesional sin servicios | Habilitado en todas las sedes / asignado a todos / presta todos | — |
| Primera sede de un negocio | Profesional activo, crea su primera sede, agenda sin `local_id` | 201 en esa sede | Sin error |
| Profesional nuevo | Alta por `/profesionales` con sedes y servicios existentes | Se le puede agendar cualquier servicio en cualquier sede | Sin error |
| Servicio nuevo sin elegir | Alta con `empleado_ids: []` | Lo presta cada profesional | Sin error |
| Editar servicio a nadie | `PUT` servicio con `empleado_ids: []` | Nadie lo presta (422 al agendarlo) | Mensaje en español |
| Migración: asignación deliberada | Profesional con fila solo en norte; servicio con un profesional | No cambia nada | — |

</frozen-after-approval>

## Code Map

- `app/Services/CitaService.php` — `crear()` (:38) y `actualizar()` (:85):
  resuelven `Capacidades`, llaman `exigirProfesionalEnAlcance()` y
  `sedeEnAlcance()` (devuelve `$localId`), luego `findOrFail` de `Servicio` y
  `Profesional` y `exigirHuecoLibre()` (:304). El nuevo método va entre los
  `findOrFail` y `exigirHuecoLibre()`, con firma del tipo
  `exigirReservable(Profesional, Servicio, ?int $localId)`. Actualizar el
  docblock de `sedeEnAlcance()` (:240) que remite G-3 a esta historia.
- `app/Models/Profesional.php` — `activo` (bool), `locales()` sobre
  `local_profesional` con pivote `habilitado`, `servicios()` sobre
  `servicio_profesional`. SoftDeletes (el Form Request ya excluye borrados).
- `app/Http/Requests/Citas/CitaRequest.php` — no tocar.
- `tests/Feature/Agenda/CitasTest.php` — el `beforeEach` (:15) crea
  profesional y servicio **sin pivotes**: hay que enlazarlos (y, en las pruebas
  de sedes, habilitarlos en `tresSedes()`), o todas las pruebas existentes
  darán 422. `DisponibilidadTest.php` no pasa por `CitaService`.
- `app/Models/Cita.php:65` — `servicios()` (líneas de `cita_servicio`): de ahí
  sale el servicio guardado para saber si la promesa cambia al editar.
- `database/migrations/tenant/` — la última es
  `2026_09_04_000003_alcance_por_sedes.php`. La nueva va con fecha
  `2026_09_28_…`; nunca editar una existente. Sin modelos Eloquent dentro
  (`DB::table`), con `whereNull('deleted_at')`, e `insertOrIgnore` sobre los
  UNIQUE de los dos pivotes. `down()` no deshace datos.
- `app/Services/LocalService.php` — `crear()` (:22): transacción; el primero es
  principal. Habilitar a los profesionales activos tras guardar la sede.
- `app/Services/ProfesionalService.php` — `crear()` (:35): la ficha nace en
  `DB::transaction(fn () => $this->rellenar(...))`. Adjuntar sedes y servicios
  dentro de esa transacción.
- `app/Services/ServicioService.php` — `crear()` (:37, incluye el camino que
  restaura un borrado con `empleado_ids => []`) y `sincronizarProfesionales()`
  (:133, «ausente = no se toca; vacío = desasignar»; esa semántica sigue en
  `actualizar()`).
- `app/Jobs/ProvisionTenantDatabase.php` — :100-120 crea la ficha del dueño
  independiente; no tocar.
- Pruebas de esos módulos: buscar las existentes de locales, profesionales y
  servicios en `tests/Feature/` y añadir allí los casos de alta.
- `docs/pendientes-contrato.md` — anotar los nuevos 422 y las asignaciones por
  defecto al crear.

## Tasks & Acceptance

**Execution:**
- [x] `app/Services/CitaService.php` -- añadir el método único de reservabilidad y llamarlo desde `crear()` y `actualizar()` -- G-3 en un sitio, extensible por la Épica 2
- [x] `database/migrations/tenant/2026_09_28_000001_rellenar_pivotes_de_reservabilidad.php` -- migración de datos de la decisión -- que ninguna agenda existente se rompa
- [x] `tests/Feature/Agenda/ReservabilidadMigracionTest.php` -- ejecutar `up()` de la migración sobre datos sembrados: pivotes vacíos se rellenan, asignaciones deliberadas no cambian, dos pasadas dan lo mismo -- fijar la migración
- [x] `tests/Feature/Agenda/CitasTest.php` -- enlazar los fixtures con sus pivotes; una prueba por fila de la matriz (crear y editar), con mensaje y base intacta en los 422 -- fijar la regla
- [x] `app/Services/LocalService.php`, `app/Services/ProfesionalService.php`, `app/Services/ServicioService.php` -- asignaciones por defecto al crear, según la decisión «lo nuevo nace asignado» -- que nada nuevo nazca sin poder agendarse
- [x] `tests/Feature/` (las pruebas existentes de locales, profesionales y servicios) -- un caso por fila nueva de la matriz, incluido que al editar un servicio `[]` sigue desasignando -- fijar los valores por defecto
- [x] `docs/pendientes-contrato.md` -- anotar los 422 en `empleado_id` y `servicio_id` y las asignaciones por defecto al crear -- el frontend debe pintarlos y saber que puede recortar

**Acceptance Criteria:**
- Given la regla implementada, when se busca `local_profesional`/`servicios()` en `app/Services` y `app/Http`, then el chequeo de reservabilidad aparece solo en `CitaService`.
- Given la suite completa, when se ejecuta, then todo en verde, incluidas las pruebas de aislación entre negocios.

### Review Findings

`bmad-code-review` del 2026-09-28 sobre `1283e5b` (4 lentes, diff contra `main`; `verification-gap` sin huecos).

- [x] [Review][Patch] (decidido: rellenarla) La migración no rellena una sede sin ningún profesional — Rellena profesionales sin sede, servicios sin profesional y profesionales sin servicio, pero no la sede con cero filas vivas en `local_profesional`. Si todos los profesionales estaban enlazados solo a Norte, Sur (agendable hasta hoy) queda sin nadie tras desplegar y todo `POST /citas` en Sur da 422 «no atiende en esa sede». Arreglarlo amplía la regla congelada de la migración.
- [x] [Review][Patch] (decidido: reabrir cuenta como promesa) Reabrir una cita cancelada no pasa por la reservabilidad — `cambiaLaPromesa()` no cuenta el estado: un `PUT` que pasa una cita `cancelada` a `pendiente`/`confirmada` sin tocar profesional, servicio, sede ni hora revive la promesa aunque el profesional ya esté de baja o desasignado. Lo congelado dice «cambiar estado no la comprueba».
- [x] [Review][Patch] (decidido: la sede nueva habilita también a los de baja) Un profesional reactivado no está en las sedes creadas mientras estuvo de baja — `LocalService::crear()` habilita solo activos (lo congelado), mientras `ServicioService` y `ProfesionalService` no filtran `activo`; y `pendientes-contrato.md:1916` promete «al reactivarlo ya está asignado», falso para esas sedes. Rechazado en la pasada 2 de `bmad-build` por editar la spec; vuelve porque la nota del contrato lo contradice.
- [x] [Review][Patch] La migración no va en transacción: si falla entre bucles y se relanza, el profesional vacío que recibió un servicio ya no cuenta como vacío y se queda incompleto [database/migrations/tenant/2026_09_28_000001_rellenar_pivotes_de_reservabilidad.php:39]
- [x] [Review][Patch] «restaurar un servicio borrado…» compara ids sin ordenar (`pluck` sin `orderBy` contra la respuesta sin `sort`): puede fallar según el orden de MySQL [tests/Feature/Catalogo/ServiciosTest.php:209]
- [x] [Review][Defer] `servicios.activo` no se mira en `exigirReservable()` [app/Services/CitaService.php:339] — deferred: ya en `deferred-work.md` (pasada 2 de `bmad-build`), Épica 2 / FR-67.

**Rechazados**
- low — Sin `lockForUpdate` sobre el profesional: carrera de milisegundos contra una baja administrativa (carried #9).
- false — `value()` sin orden en `cambiaLaPromesa()`: `guardarLineas()` sincroniza UN servicio (carried #8).
- low — `insertOrIgnore` traga también errores de FK o truncado: los ids salen de las propias tablas vivas en la misma pasada; no hay valor que pueda violar nada.
- low — El 422 de sede nombra una sede no elegida (negocio de una sede): solo si el negocio deshabilitó a propósito a ese profesional allí, y entonces el 422 es correcto (carried).
- low — Filas parciales o `habilitado = false` previas ahora bloquean: asignación deliberada; lo congelado dice no ensancharla (carried #14).
- low — Faltan pruebas de `PUT` solo de hora con el servicio retirado y de `POST /profesionales` con `activo: false`: mismas ramas que ya fijan las pruebas de servicio no prestado y de alta.
- low — Docblock no menciona que el provisioning inserta la ficha sin pivotes, ni que restaurar/rehabilitar no pasa por el relleno: hoy no hay sedes ni servicios al provisionar; nota sin fallo concreto.
- false — Cambios fuera de `CitaService`, puerta condicional al editar, fixtures ajustados: decisiones congeladas (carried pasada 2 #13).

## Implementation Notes

## Spec Change Log

**2026-09-28 — loopback 1 (intent_gap, pasada 1 #1 y #2).** El humano decidió
«lo nuevo nace asignado» y ampliar la migración al profesional sin servicios.
Añadidos al bloque congelado con su aprobación, más cuatro filas de matriz y
los patches #4–#7 de la pasada 1 (mensajes sin género, docblock de sede NULL,
pruebas de cerrar sin sede y de mover solo la fecha). Estado malo que se
evita: tras desplegar, una sede o un profesional nuevos no se pueden agendar y
el onboarding del independiente falla. Se revirtió el código; copia en el
scratchpad (`impl-1-3-pasada1.diff`).

**KEEP** (funcionó bien en la pasada 1 y debe sobrevivir):
- `CitaService::exigirReservable(Profesional, Servicio, ?int $localId)` con los
  tres 422 en ese orden, llamado en `crear()` tras `sedeEnAlcance()`, y en
  `actualizar()` solo si `cambiaLaPromesa()` (profesional, servicio leído de
  `cita_servicio`, sede con NULL tratado como NULL, `starts_at` `Y-m-d H:i`).
- Migración con `DB::table`, `whereNotExists`, `insertOrIgnore`, `down()` vacío
  y comentario de despliegue por `tenants:migrar-provisionados`.
- Pruebas: `habilitarEnSedes()` llamado desde `tresSedes()`; `otroProfesional()`
  con parámetro `reservable: false`; el `beforeEach` adjunta el servicio a
  Rosa; aserción de base intacta en cada 422; pruebas de orden (G-1 gana, G-2
  gana, G-3 gana al hueco).
- `ReservabilidadMigracionTest.php` ejecutando `up()` sobre datos sembrados; se
  corre con `--filter` (los helpers viven en `ProvisioningTest.php`).

## Review Triage Log

**Pasada 2 (2026-09-28)** — tras el loopback 1; 4 lentes sobre el diff desde
`d3f4271`; suite completa previa: 364 en verde. Veredictos nuevos: 1 high
(patch), 3 low (patch), 1 medium (defer, carried de la pasada 1 #3), 12
rechazados o carried. **Sin loopback.**

| # | Lente | Veredicto | Ruta | Evidencia |
|---|---|---|---|---|
| 1 | verif+edge+blind | **high** | patch | Pre-verificado y comprobado en la migración (:46-60): los `whereNotExists` no miran el otro lado del pivote. Un servicio cuyo único profesional se borró (soft delete), o un profesional cuya única sede o servicio se borró, cuenta como «con filas» y no se rellena: queda sin poder agendarse el día del despliegue. Los `eliminar()` de los tres services solo hacen `delete()`, así que esas filas existen. Arreglo: `join` con la tabla del otro lado y `whereNull('deleted_at')` dentro del subquery, y una prueba por conjunto. |
| 2 | blind | low | patch | `LocalesTest.php:93`: `not->toContain($inactivo, $borrado)` sobre ids sin castear pasa aunque falte uno solo; la línea :91 (`toBe([$activo])`) ya lo cubre. Borrarla. |
| 3 | blind | low | patch | `ServiciosTest.php:108`: `assertJsonCount(1, …)` depende de que el fixture sea `independiente`. Comparar con los ids de profesionales leídos de la base, como la prueba de «lo prestan todos». |
| 4 | blind | low | patch | `pendientes-contrato.md` no dice que `POST /profesionales` con `activo: false` también nace con todas las sedes y servicios, ni que reprogramar una cita cuyo servicio le quitaron al profesional ahora da 422. Dos líneas. |
| 5 | blind+edge | **medium** | defer | carried #3: `servicios.activo` no se mira; previo, FR-67 / Épica 2. Ahora sí se anota en `deferred-work.md` (en la pasada 1 lo cortó el loopback). |
| 6 | edge+blind+verif+intent | low | rechazado | Un profesional reactivado no está en las sedes creadas mientras estuvo de baja (`LocalService` asigna solo activos; los otros dos no filtran `activo`). Es exactamente lo congelado («habilita a todos los profesionales activos»); el arreglo edita la spec. El negocio lo resuelve desde la sede. |
| 7 | blind | false | rechazado | «Sede inactiva sin seguimiento»: ya en `deferred-work.md:32` (G-3 explícito inactivo). |
| 8 | edge+blind | low | rechazado | carried #9: sin `lockForUpdate` sobre el profesional. |
| 9 | edge | low | rechazado | carried #15: sede borrada → mensaje «no atiende en esa sede». |
| 10 | edge | false | rechazado | Servicio guardado borrado → `value()` NULL → «la promesa cambió»: cualquier `PUT` con ese `servicio_id` ya muere en el Form Request (`exists` sin borrados). carried #8. |
| 11 | blind | low | rechazado | carried #10: faltan variantes de la exención (sin servicio, sin sede habilitada, NULL→sede, solo servicio). Mismas ramas de `cambiaLaPromesa()` que ya fijan las pruebas. |
| 12 | blind | low | rechazado | El error de sede nombra una sede no elegida en un negocio de una sede: solo ocurre si el negocio deshabilitó a propósito al profesional en su única sede, y entonces el 422 es correcto. |
| 13 | intent | false | rechazado | Cambios fuera de `CitaService`, puerta condicional al editar, oferta sin tocar: son las decisiones congeladas y el bloque Never. |
| 14 | intent | false | rechazado | «`cambiaLaPromesa` lee solo la primera línea»: carried #8, nunca hay dos. |
| 15 | intent | low | rechazado | carried #11: la migración no se prueba vía `tenants:migrar-provisionados`. |

**Pasada 1 (2026-09-28)** — 4 lentes sobre el diff desde `d3f4271`. Veredictos:
2 high (intent_gap), 1 medium (defer), 4 low (patch), 11 rechazados.
**Loopback por intent_gap** (`review_loop_iteration` → 1). Copia del código de
esta pasada: `impl-1-3-pasada1.diff` en el scratchpad de la sesión.

| # | Lente | Veredicto | Ruta | Evidencia |
|---|---|---|---|---|
| 1 | blind+edge+verif+intent | **high** | intent_gap | Lo que se crea DESPUÉS del despliegue nace sin poder agendarse: `LocalService::crear()` no habilita a nadie en la sede nueva (y la primera sede se vuelve la de por defecto, así que un negocio de una sede deja de agendar entero, con el error en `empleado_id`); `ProvisionTenantDatabase` (:109) crea la ficha del dueño `independiente` sin servicios; `ServicioService` sincroniza `empleado_ids ?? []`. La `reserva_prueba` del onboarding falla. La decisión congelada aceptó «lo nuevo exige asignar», pero no estos efectos. |
| 2 | edge (×2) | **high** | intent_gap | La migración no cubre al profesional **sin ningún servicio** cuando cada servicio ya tiene a alguien: antes podía agendarlo todo, tras desplegar no agenda nada. La regla congelada solo rellena servicios vacíos. |
| 3 | blind | **medium** | defer | `exigirReservable()` no mira `servicios.activo`: un servicio desactivado se sigue agendando. Previo (el `exists` del Form Request tampoco lo mira) y fuera de la intención (G-3 = profesional). FR-67 lo pide con `local_servicio`, Épica 2. |
| 4 | blind | low | patch | «{Nombre} está dado de baja» es masculino para «Rosa Paredes» y el contrato pide pintarlo tal cual. Texto neutro. |
| 5 | verif-gap | low | patch | Pre-verificado. Sin prueba de cerrar la cita de un profesional dado de baja en un negocio **sin sedes** (`local_id` NULL): simplificar la comparación de sede en `cambiaLaPromesa()` no rompe nada. |
| 6 | verif-gap | low | patch | Pre-verificado. Sin prueba de mover solo la `fecha` (misma hora) de la cita de un profesional dado de baja. |
| 7 | blind | low | patch | El docblock dice «sin sede (negocio sin locales)», pero el salto aplica a todo `local_id` NULL (también citas antiguas sin sede). Corrección de texto. |
| 8 | blind+edge | false | rechazado | `value()` sin orden en `cambiaLaPromesa()`: `guardarLineas()` hace `sync()` de UN servicio, nunca hay dos líneas. Servicio borrado: el Form Request ya rechaza su `servicio_id`. |
| 9 | blind+edge | low | rechazado | Sin `lockForUpdate` sobre el profesional: carrera de milisegundos contra una baja administrativa (igual que 1.2 #14). |
| 10 | blind | low | rechazado | Faltan pruebas de cambiar cliente o productos sin comprobar: mismas ramas que `estado`/`notas`/`monto`. `hora_inicio` es `H:i`: no hay otra forma de escribirla. |
| 11 | blind | low | rechazado | La migración no se prueba vía `tenants:migrar-provisionados`: el comando ya existe y recorre la carpeta `tenant/`; la prueba de `up()` fija la lógica. |
| 12 | blind | false | rechazado | «La migración da permisos a profesionales inactivos»: antes de esta historia ya podían agendarse con todo; no se amplía nada que existiera. |
| 13 | blind | low | rechazado | La petición al frontend va en Traspasos de `estado.md` y no solo en `pendientes-contrato.md`: se hace al cerrar, no es código. |
| 14 | edge | low | rechazado | Pivotes parciales (fila solo en algunas sedes): es una asignación deliberada; lo congelado dice no ensancharla. |
| 15 | edge | low | rechazado | Sede borrada (soft delete) → «no atiende en esa sede»: el `local_id` de una sede borrada ya es un diferido (`deferred-work.md:46`). |
| 16 | intent | false | rechazado | «La puerta condicional al editar no está en la intención»: es la decisión congelada del 2026-09-28. |
| 17 | intent | false | rechazado | «No toca la oferta (disponibilidad, selectores)»: el bloque Never lo excluye (1.7). |
| 18 | intent | low | rechazado | Los fixtures de toda la suite van por el camino «todo asignado»: es lo que exige la regla; las pruebas nuevas cubren el camino no asignado. |

## Design Notes

Profesional inactivo y no habilitado van al mismo campo (`empleado_id`) con
mensajes distintos: el panel pinta el error bajo el selector de profesional en
los dos casos. El servicio va en `servicio_id` porque es la mitad de la pareja
que el usuario puede cambiar para arreglarlo.

## Verification

**Commands:**
- `C:/laragon/bin/php/php-8.3.33-nts-Win32-vs16-x64/php.exe artisan test --filter=Citas` -- expected: verde, con las nuevas
- `C:/laragon/bin/php/php-8.3.33-nts-Win32-vs16-x64/php.exe artisan test` -- expected: todo verde (antes de mergear)
