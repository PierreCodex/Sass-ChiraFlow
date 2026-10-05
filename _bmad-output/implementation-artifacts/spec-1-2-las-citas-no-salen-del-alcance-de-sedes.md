---
title: 'Story 1.2: Las citas no salen del alcance de sedes'
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
baseline_commit: '51217cb18eca34a27a3e8769f332af4cd9199a4d'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** El alcance por sedes solo existe al LEER. `POST /citas` escribe el
`local_id` que llegue sin mirarlo, y sin `local_id` asigna la sede principal
aunque esté fuera del alcance; `PUT /citas/{id}` mueve una cita propia a una
sede ajena. Es el hueco **G-2**, verificado en el código.

**Approach:** La regla «la cita solo cae en una sede de mi alcance» vive en
`CitaService`, en el mismo punto de entrada que la de `solo_propios` (Story
1.1), resuelta desde la misma `Capacidades::locales()`. Crear y actualizar la
llaman; ninguna copia en el controlador ni en el Form Request.

## Boundaries & Constraints

**Always:**
- La regla se comprueba en `CitaService` (NFR-12), dentro de la transacción y
  antes de escribir nada.
- `Capacidades` se resuelve **una vez** por escritura y la comparten el eje
  profesional (1.1) y el eje sede; nunca la pasa el llamador externo.
- Sede fuera de alcance → **422** en `local_id`, en español. Cita ajena →
  **404** (ya lo pone `exigirVisibilidad()`, no se toca).
- `todos_los_locales` (alcance `null`) → nada cambia.
- Sin `local_id` al crear: la principal **si está dentro del alcance**; si no,
  la sede activa del alcance con el id más bajo; alcance sin ninguna sede
  activa (o vacío) → 422.
- Al actualizar sin `local_id`, la cita conserva su sede (ya visible para quien
  edita): no se inventa una.

**Never:**
- No validar sede activa ni profesional/servicio habilitado en la sede (G-3,
  Story 1.3).
- No cambiar la forma de la respuesta ni `api-contract.md`.
- No mover el filtro de lectura (`acotar()`, `exigirVisibilidad()`) al service.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Crea en su sede | Alcance {norte}, `local_id` = norte | 201, `local_id` = norte | Sin error |
| Crea en sede ajena | Alcance {norte}, `local_id` = sur | **422** en `local_id`, ninguna cita | Mensaje en español |
| Crea sin sede, principal dentro | Alcance {principal, norte}, sin `local_id` | 201, `local_id` = principal | Sin error |
| Crea sin sede, principal fuera | Alcance {norte}, sin `local_id` | 201, `local_id` = norte | Sin error |
| Crea sin sede, alcance vacío | Alcance {} o solo sedes inactivas | **422** en `local_id` | Mensaje en español |
| Mueve su cita a sede ajena | Cita en norte, `PUT` con `local_id` = sur | **422**, la cita sigue en norte | Mensaje en español |
| Edita sin tocar la sede | Cita en norte, `PUT` sin `local_id` | 200, sigue en norte | Sin error |
| Cita de sede ajena | `PUT` sobre cita de sur | **404** | Ya cubierto |
| Todas las sedes | `todos_los_locales`, crea/mueve a sur | 201/200 | Sin error |

</frozen-after-approval>

## Code Map

- `app/Services/CitaService.php` — `crear()` (:38-74) escribe `local_id` =
  `$datos['local_id'] ?? $this->localPorDefecto()`; `actualizar()` (:79-110)
  `$datos['local_id'] ?? $cita->local_id`. `exigirProfesionalEnAlcance()`
  (:161-204) resuelve `Capacidades::deUsuarioCentral()` como primera sentencia
  de la transacción — **su nota dice que G-2 entra aquí sin renombrarlo**.
  `localPorDefecto()` (:483) = `Local::where('es_principal', true)->value('id')`.
  Actualizar el docblock (:144-145 afirma que la sede sigue en el controlador).
- `app/Support/Capacidades.php` — `locales(): ?list<int>` (null = todas, `[]` =
  ninguna). Reutilizar tal cual.
- `app/Models/Local.php` — `SoftDeletes`, `activo`, `es_principal`.
- `app/Http/Controllers/CitaController.php` — `exigirVisibilidad()` ya da 404
  sobre la sede ACTUAL de la cita. No tocar.
- `app/Http/Requests/Citas/CitaRequest.php:39` — `local_id` nullable + exists.
  No tocar.
- `tests/Feature/Agenda/CitasTest.php` — `cuentaDelNegocio()` (:470) monta rol
  + `User` + `Usuario`; hoy crea el `Usuario` sin alcance (default de la
  columna). `CapacidadesTest.php:50-58` enseña cómo limitar: `todos_los_locales
  => false` + `locales()->sync([...])`.
- `docs/pendientes-contrato.md` — anotar el nuevo 422 en `local_id`.

## Tasks & Acceptance

**Execution:**
- [ ] `app/Services/CitaService.php` — resolver `Capacidades` una vez al inicio
  de `crear()`/`actualizar()`, pasarla a los chequeos privados, y añadir la
  resolución de sede en alcance (explícita → validar; ausente al crear →
  principal/primera activa del alcance/422) que devuelva el `local_id` a
  escribir — una regla, un sitio, para los dos caminos.
- [ ] `tests/Feature/Agenda/CitasTest.php` — opción `locales` en
  `cuentaDelNegocio()` y una prueba por fila de la matriz, con aserción del
  mensaje y de que la base no cambia en los 422.
- [ ] `docs/pendientes-contrato.md` — anotar el 422 en `local_id` para el
  frontend.

**Acceptance Criteria:**
- Given la regla implementada, when se busca `locales()` en `app/Services`,
  then aparece solo en `CitaService`, y no hay chequeo de sede de escritura en
  el controlador.
- Given la suite completa, when se ejecuta, then las pruebas anteriores siguen
  en verde y ninguna prueba de aislación entre negocios se relaja.

### Review Findings

`bmad-code-review` del 2026-09-28 sobre `59d6179` (4 lentes, diff contra `main`).

- [x] [Review][Patch] La prueba «con un solo local la cita se asigna sola a la sede principal» ya no prueba un solo local: llama a `tresSedes()` y corre con tres, así que fija «cuenta sin alcance → principal por defecto», no el caso de una sola sede (§2.12) que dice su título. Crear solo la principal (el mismo `forceFill` de `tresSedes()`) o renombrarla. [tests/Feature/Agenda/CitasTest.php:145]
- [x] [Review][Patch] Ninguna prueba manda un `local_id` EXPLÍCITO con alcance vacío (`[]`): la única de alcance vacío va sin `local_id` y toma la rama por defecto. Una regresión a `if ($alcance && …)` —el mismo fallo de `LocalController` (#7)— dejaría a una cuenta sin sedes agendar en cualquiera con la suite en verde. Añadir: `cuentaConSedes($this, [])` + `POST` con `local_id` de una sede → 422 «No puedes agendar citas en esa sede.» y 0 citas. [tests/Feature/Agenda/CitasTest.php, bloque «En qué sede»] — `bmad-review` del 2026-09-28 (verification-gap).
- [x] [Review][Defer] Con `todos_los_locales` y sin `local_id`, `localPorDefecto()` no filtra `activo` ni falla sin principal: la cita cae en una principal inactiva o con `local_id` NULL, que es justo la cita que alimenta el hueco de `exigirVisibilidad()`. [app/Services/CitaService.php:273] — deferred: preexistente, la rama sin alcance conserva el comportamiento anterior a propósito («nada cambia»); sin sedes creadas NULL es hoy la única salida.
- [x] [Review][Defer] Con `todos_los_locales`, un `local_id` de una sede borrada (soft delete) pasa: `Rule::exists('locales','id')` no mira `deleted_at`. [app/Http/Requests/Citas/CitaRequest.php:39] — deferred: preexistente, fuera del diff; va con G-3 (Story 1.3).
- [x] [Review][Defer] Cita con `local_id` NULL editable por una cuenta acotada. — deferred: ya registrado en deferred-work (pasada 1, #6).
- [x] [Review][Defer] `GET /locales` con alcance vacío devuelve todas. — deferred: ya registrado en deferred-work (pasada 1, #7).
- [x] [Review][Defer] `local_id` explícito a sede inactiva del alcance se acepta. — deferred: G-3, Story 1.3, ya registrado.

**Rechazados**
- false — `tresSedes()` supone el orden principal < norte < sur: el provisioning de las pruebas no crea principal, así que la crea primero; la prueba donde la principal nace después monta su propio escenario.
- false — Elegir otra sede del alcance cuando la principal queda fuera «excede la intención»: lo fija la matriz congelada de la spec.
- false — «El 404 gana al 422» depende del orden en el controlador: está especificado y lo fija una prueba.
- false — `Capacidades` resuelta en el service y no la misma instancia del middleware: decisión de diseño explícita (el llamador no puede entregarla).
- low — La pertenencia `in_array` repetida en `Controller::exigirAlcance()` y `sedeEnAlcance()`: leen la misma `locales()` (ints), no divergen hoy; centralizarla añade API pública (ya rechazado en la pasada 1, #10).
- low — El 422 en `local_id` distingue «no existe» (regla `exists`) de «fuera de tu alcance», y deja enumerar ids de sedes del mismo negocio: antes del cambio esa sede se aceptaba con 201, y el 422 lo fija el bloque congelado.
- low — Una sede desactivada o sacada del alcance en paralelo entre la lectura y el `INSERT`: ventana de milisegundos sobre un cambio administrativo (pasada 1, #14).
- low — El alcance cambia entre el chequeo del middleware y el del service en la misma petición: ventana de milisegundos.
- low — `PUT` con `local_id: null` explícito conserva la sede en vez de quitarla: comportamiento anterior (`?? $cita->local_id`) y el que dice la spec.
- low — Sin prueba con `solo_propios` y alcance acotado a la vez: dos 422 en campos distintos y orden fijo (pasada 1, #11).
- low — Doble resolución de `Capacidades` por petición: coste ya registrado en el diferido de la 1.1.
- low — `PATCH /citas/{id}` sin prueba propia: es la misma acción `update` por `Route::match`.

## Implementation Notes

Hecho el 2026-09-28 sobre `sprint-1/1-2-citas-alcance-de-sedes`.

- `crear()` y `actualizar()` resuelven `Capacidades` una vez y la pasan a los
  dos ejes privados: `exigirProfesionalEnAlcance()` (1.1) y el nuevo
  `sedeEnAlcance()`, que devuelve el `local_id` a escribir. Mensajes: «No puedes
  agendar citas en esa sede.» y «Tu cuenta no tiene ninguna sede activa a su
  alcance, así que no puede agendar citas.»
- Pruebas: opción `locales` en `cuentaDelNegocio()`, helpers `tresSedes()` y
  `cuentaConSedes()`, 12 pruebas en «En qué sede».
- **Incidencia**: a las 01:18 `CitasTest.php` desapareció del disco y Windows
  bloqueó el nombre (borrado pendiente) hasta cerrar VS Code, Codex y la sesión.
  Se restauró desde `HEAD` y un segundo implementador rehízo las pruebas. Causa
  no confirmada.
- **Sorpresa**: el provisioning de las pruebas no crea sede principal;
  `tresSedes()` la crea con `forceFill` si falta (`es_principal` no es
  asignable en masa).
- `--filter=Citas`: 57 en verde (270 aserciones) antes de la revisión.
- **Segunda incidencia** (02:54): `CitasTest.php` volvió a desaparecer al copiar la
  versión con los parches #1 y #2. Se recuperó de la copia de esa sesión en su
  scratchpad (02:31) — los parches #3–#5 ya estaban en el árbol. Tras la
  pasada 1: `--filter=Citas` 58 en verde (275 aserciones).

## Spec Change Log

## Review Triage Log

**Pasada 1 (2026-09-28)** — 4 lentes. Veredictos: 2 medium, 3 low (patch), 4
defer, 8 rechazados. **Sin loopback**: ningún hallazgo es intent_gap ni bad_spec.

| # | Lente | Veredicto | Ruta | Evidencia |
|---|---|---|---|---|
| 1 | verif-gap+blind | **medium** | patch | Pre-verificado. La prueba «con un solo local… sede principal» compara null con null (el provisioning de las pruebas no crea principal), así que la rama `$alcance === null` → `localPorDefecto()` no está fijada: devolver `null` no rompe nada. |
| 2 | verif-gap | **medium** | patch | Pre-verificado. En `tresSedes()` la principal siempre tiene el id más bajo: quitar `orderByDesc('es_principal')` no rompe ninguna prueba. |
| 3 | blind+edge+verif | low | patch | El docblock de `sedeEnAlcance()` dice que la cita editada «ya es visible» para quien edita; falso con `local_id` NULL, porque `exigirVisibilidad()` salta el chequeo de sede. El comportamiento es previo (ver #6); el comentario es de este cambio. |
| 4 | blind | low | patch | «Una sola resolución por escritura»: el middleware `puede:` ya resolvió otra para la misma petición. Corrección de texto. |
| 5 | blind | low | patch | `pendientes-contrato.md`: «el 404 gana al 422» solo vale en `PUT`; «ya las filtra `GET /locales`» es falso con alcance vacío (#7); y el 422 «ninguna sede activa» llega en un campo que el panel puede tener oculto (§2.12). |
| 6 | blind+edge+verif+intent | **medium** | defer | Una cuenta acotada edita o borra citas con `local_id` NULL que no ve en el listado: `exigirVisibilidad()` salta el chequeo si es NULL y `acotar()` las excluye con `whereIn`. Previo a esta historia (Sprint 4.B); alcanzable si hubo citas antes de crear el primer local. |
| 7 | (implementador) | **medium** | defer | `LocalController::index` filtra con `when($this->alcanceDeSedes(...))`: un alcance `[]` es falso y la cuenta sin sedes ve TODAS en `GET /locales`. Verificado en `LocalController.php:28`. Previo. |
| 8 | blind+edge+intent | — | defer | Un `local_id` explícito a una sede inactiva del alcance se acepta, mientras que el camino por defecto se salta las inactivas. Es G-3, Story 1.3; la spec lo excluye expresamente. |
| 9 | blind | — | defer | Sin fila en `usuarios`, `locales()` es `null` y el eje sede no restringe. Misma raíz que el #11 de la 1.1; el docblock ya lo advierte para la Épica 6. |
| 10 | blind | low | rechazado | «La regla de sede existe dos veces» (`Controller::exigirAlcance` y `sedeEnAlcance`). Las dos leen la MISMA fuente, `Capacidades::locales()`; lo repetido es un `in_array`. Centralizarlo añade API pública a `Capacidades` y el único daño citado (int contra cadena) no se alcanza: `locales()` devuelve ints. |
| 11 | blind | low | rechazado | Falta una prueba con `solo_propios` y alcance acotado a la vez. Los dos ejes lanzan 422 en campos distintos y en orden fijo; ningún fallo concreto. |
| 12 | blind | false | rechazado | «`tresSedes()` supone el orden sin comprobarlo». Crea la principal (si falta), Norte y Sur en ese orden en la misma base: el orden por id es el de creación. |
| 13 | blind | false | rechazado | «El docblock presenta como normal que sin cuenta el eje sede no restrinja». Lo dice como advertencia explícita para la Épica 6, igual que `Capacidades::profesional()`. |
| 14 | edge | low | rechazado | Una sede desactivada en paralelo entre el chequeo y el `INSERT`. Ventana de milisegundos sobre un cambio administrativo; bloquear `locales` en cada reserva cuesta más que el caso. |
| 15 | intent | low | rechazado | Ninguna prueba llama al service sin el controlador. Igual que el #22 de la 1.1: la colocación la cubre el criterio de aceptación por `grep`. |
| 16 | intent | false | rechazado | 422 al escribir frente a 404 al leer una sede ajena. Lo fija el bloque congelado (422 en `local_id`), igual que `empleado_id` en la 1.1. |
| 17 | blind | low | rechazado | «No hay prueba que fije que un `local_id` inactivo explícito da 201 hoy». Es comportamiento que la 1.3 va a cambiar a propósito; fijarlo ahora es escribir una prueba para borrarla. |

**Pasada 2 (2026-09-28)** — tras los dos `[Review][Patch]` de `bmad-code-review`
y el de `bmad-review` (alcance `[]` con `local_id` explícito). 4 lentes sobre el
diff desde `51217cb`. Veredictos nuevos: 1 medium (patch), 7 rechazados; el
resto, `carried`. **Sin loopback**.

| # | Lente | Veredicto | Ruta | Evidencia |
|---|---|---|---|---|
| 1 | verif-gap | **medium** | patch | Pre-verificado. Ninguna prueba fija que `PUT` sin `local_id` conserve la sede cuando el fallback de creación elegiría otra: «edita su cita sin tocar la sede» tiene alcance `[$norte]`, y las `PUT` del dueño editan citas con `local_id` NULL. Borrar la rama `$cita !== null` deja la suite en verde. |
| 2 | blind | low | carried | #10: `in_array` repetido en `Controller::exigirAlcance()` y `sedeEnAlcance()`. |
| 3 | blind+edge+verif | — | carried | #9: sin fila en `usuarios` el eje sede no restringe. |
| 4 | blind | low | carried | Rechazado en `bmad-code-review`: el 422 distingue «no existe» de «fuera de tu alcance». |
| 5 | blind+edge | — | carried | Diferido en `bmad-code-review`: `localPorDefecto()` con `todos_los_locales` no filtra `activo` y puede dar NULL. |
| 6 | blind+edge | **medium** | carried | #6: cita con `local_id` NULL editable por cuenta acotada. |
| 7 | blind | **medium** | carried | #7: `GET /locales` con alcance `[]` devuelve todas. |
| 8 | edge | — | carried | #8 + diferido de soft delete: `local_id` explícito inactivo o borrado se acepta (G-3). |
| 9 | edge | low | carried | #14: carrera entre la lectura de `Local` y el `INSERT`. |
| 10 | intent | low | carried | #15 y #16: las pruebas van por HTTP, no por el service; 422 y no 404; el 404 de la cita ajena sigue en `exigirVisibilidad()` (bloque «Never»). |
| 11 | blind | low | rechazado | Falta `PUT` con `local_id` como cadena. Mismo `(int)` en la misma función que ya fija la prueba de `POST`; no hay rama distinta que pueda romperse. |
| 12 | blind | false | rechazado | «"no mueve su cita" comprueba poco». Que `estado` no sea `confirmada` ya prueba que el `fill()` completo no se escribió: la transacción es una sola. |
| 13 | blind | low | rechazado | `todos_los_locales` sin `local_id` con varias sedes sin prueba. `localPorDefecto()` solo mira la principal: el número de sedes no cambia su resultado, y la prueba de :145 la fija. |
| 14 | blind | false | rechazado | «La prueba de un solo local esconde que el provisioning no crea principal». La prueba es de la asignación de `CitaService`; en producción la primera sede la marca principal `LocalService`. Antes comparaba null con null y tampoco miraba el provisioning. |
| 15 | blind | low | rechazado | El `tap(... forceFill(['es_principal' => true]))` repetido en tres pruebas. Solo pruebas; extraer un helper no corrige ningún fallo. |
| 16 | verif-gap | low | rechazado | `orderBy('id')` sin prueba que lo distinga del orden natural de InnoDB por PK. Fijarlo en MySQL es frágil y hoy el resultado coincide. |
| 17 | intent | low | rechazado | El orden «principal, luego id más bajo» y el 422 «ninguna sede activa» son decisiones de producto no pedidas: las fija la matriz congelada. |

**Pasada 3 (2026-09-28)** — `bmad-code-review` sobre `5f3b798` (el parche #1 de
la pasada 2), 4 lentes, diff `main...HEAD`. `verification-gap`: sin huecos.
Veredictos: 0 decision, 0 patch; 6 defer, todos **ya registrados** en
`deferred-work.md` (no se duplican); 11 rechazados. **Sin loopback**.

| # | Lente | Veredicto | Ruta | Evidencia |
|---|---|---|---|---|
| 1 | edge+blind+intent | **medium** | carried | Cita con `local_id` NULL: editable por cuenta acotada, y ahora también **movible a una sede propia** con `local_id` explícito (edge). Misma raíz: `exigirVisibilidad()` salta NULL. `deferred-work.md:24`. |
| 2 | edge+blind | — | carried | `localPorDefecto()` con `todos_los_locales`: principal inactiva o NULL. `deferred-work.md:42`. |
| 3 | edge+blind | — | carried | `local_id` explícito inactivo del alcance se acepta (G-3). `deferred-work.md:32`. |
| 4 | edge | — | carried | Sede borrada (soft delete) pasa `Rule::exists`. `deferred-work.md:46`. |
| 5 | edge | — | carried | Sin fila en `usuarios`, `locales()` = `null`. `deferred-work.md:36`. |
| 6 | blind | **medium** | carried | `GET /locales` con alcance `[]` devuelve todas. La parte «no está registrado, solo en una nota del contrato» es **falsa**: `deferred-work.md:28`. |
| 7 | blind | false | rechazado | «Id más bajo es una adivinanza; debería ser 422 con varias sedes». Lo fija la matriz congelada; el arreglo edita la spec. |
| 8 | blind | false | rechazado | «La prueba del `PUT` 422 comprueba menos de lo que dice». Transacción única: `estado` intacto prueba que el `fill()` no se escribió, y el payload solo puede poner `confirmada` (pasada 2 #12). |
| 9 | blind | low | rechazado | `PATCH` sin prueba: misma acción `update` por `Route::match`. |
| 10 | blind+intent | low | rechazado | Sin prueba con los dos ejes fallando a la vez: 422 en campos distintos, orden fijo (pasada 1 #11). |
| 11 | blind | low | rechazado | `tap(... forceFill(...))` repetido tres veces: solo pruebas (pasada 2 #15). |
| 12 | blind | false | rechazado | «El provisioning de las pruebas difiere del real y esconde el caso sin principal»: la prueba es de `CitaService`; el caso sin principal es el diferido #2 (pasada 2 #14). |
| 13 | edge | low | rechazado | El commit `59d6179` dice «alcance sin sedes activas: 422» y con `local_id` explícito a una inactiva da 201. El mensaje resume la rama por defecto; `pendientes-contrato.md` lo acota bien («crea sin `local_id`»). Un commit no se reescribe. |
| 14 | intent | low | rechazado | Unicidad de `Capacidades` y ausencia de copia en el controlador sin prueba: lo cubre el criterio por `grep` (pasada 1 #15). |
| 15 | intent | low | rechazado | Principal **inactiva** dentro del alcance sin prueba (el `where('activo')` también la salta). Lectura razonable de la matriz («alcance sin sede activa → 422»); raro en uso diario y el arreglo es una prueba más sobre un orden ya rechazado en la pasada 2 #16. |
| 16 | intent | false | rechazado | «Cambió el fixture de una prueba existente»: es el parche de la revisión anterior, a propósito. |
| 17 | intent | false | rechazado | `PUT` sin `local_id` sobre cita NULL la deja NULL: es el #1 (carried), no un desvío nuevo. |

## Design Notes

«Primera activa del alcance» y no 422 cuando la principal queda fuera: la
historia dice que la cita **se asigna**, y el contrato ya delega en el backend
la sede cuando no hay elección (`local_id` «con una sola la pone el backend»).
El orden por id la hace determinista y comprobable.

Una sola resolución de `Capacidades` por escritura también cierra a medias el
diferido #15 de la 1.1 (doble resolución) sin abrir el candado: el parámetro es
de métodos **privados**; el llamador externo sigue sin poder entregarla.

## Verification

**Commands:**
- `C:/laragon/bin/php/php-8.3.33-nts-Win32-vs16-x64/php.exe artisan test --filter=Citas` — esperado: verde, con las nuevas
- `C:/laragon/bin/php/php-8.3.33-nts-Win32-vs16-x64/php.exe artisan test` — esperado: todo verde (~41 min: solo antes de mergear)
- `grep -rn "locales()" app/Services app/Http/Controllers/CitaController.php` — esperado: el chequeo de escritura solo en `CitaService`
