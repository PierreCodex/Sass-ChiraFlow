---
title: 'Story 1.1: Un profesional no agenda a nombre de otro'
type: 'bugfix'
created: '2026-09-20'
status: 'done'
route: 'full'
route_source: 'auto'
review: 'thorough'
review_source: 'auto'
lenses_ran: ['blind-hunter', 'edge-case-hunter', 'verification-gap', 'intent-alignment']
review_loop_iteration: 0
context: []
baseline_commit: '8499b9483a4eb93bb32fdb9e7908fb2ac988795d'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Con `solo_propios`, el filtro solo existe al LEER. Al escribir no:
`POST /citas` acepta cualquier `empleado_id` y `PUT /citas/{id}` permite
reasignar la cita a otro profesional — con lo que además desaparece de la vista
de quien la creó. Es el hueco de seguridad **G-1**, verificado en el código.

**Approach:** Que la regla «solo puedo agendar para mí» viva en `CitaService`,
en un único método al que llaman crear y actualizar, resuelta desde
`App\Support\Capacidades` (el mismo sitio del que ya sale el filtro de lectura).
Ninguna copia de la regla en el controlador ni en el Form Request.

## Boundaries & Constraints

**Always:**
- La regla se comprueba en `CitaService` (NFR-12): en el controlador protegería
  un endpoint, en el service protege todos — incluida la reserva pública de la
  Épica 6.
- **Una sola definición** de «quién soy yo como profesional», en `Capacidades`.
- Campo fuera de alcance → **422** en `empleado_id` y en español. Recurso ajeno
  → **404**, nunca 403.
- Falla cerrado: con `solo_propios` y sin ficha de profesional, no agenda para
  nadie (422).
- Sin `solo_propios` nada cambia.

**Never:**
- No tocar el alcance por sedes (G-2, Story 1.2) ni la combinación
  profesional/servicio/sede (G-3, Story 1.3): van después, sobre este mismo
  método.
- No cambiar la forma de la respuesta: `api-contract.md` no se toca.
- No reescribir `exigirVisibilidad()`: su 404 ya funciona y tiene prueba.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Agenda para sí mismo | Rol con `citas: gestionar` + `solo_propios`, ficha propia, `empleado_id` = su ficha | 201, cita creada | Sin error |
| Agenda para un compañero | Mismo rol, `empleado_id` de otro profesional | **422** en `empleado_id`, ninguna cita creada | Mensaje en español |
| Reasigna su cita a otro | Mismo rol, `PUT` sobre cita propia cambiando `empleado_id` | **422**, la cita conserva su profesional | Mensaje en español |
| Edita la cita de otro | Mismo rol, `PUT` sobre cita ajena | **404** | Ya cubierto por `exigirVisibilidad()` |
| Con `solo_propios` y sin ficha | Rol con `solo_propios`, usuario sin fila en `profesionales` | **422** en `empleado_id` | Falla cerrado |
| Sin `solo_propios` | Rol con `citas: gestionar` a secas | 201 para cualquier profesional | Sin error |

</frozen-after-approval>

## Code Map

- `app/Services/CitaService.php` — `crear()` (:38-70) y `actualizar()` (:76-110)
  hacen `Profesional::findOrFail($datos['empleado_id'])` y escriben
  `profesional_id` sin mirar quién pide. **Aquí entra la regla**, antes de
  `exigirHuecoLibre()`. Reciben `int $usuarioId` = id del usuario CENTRAL.
- `app/Support/Capacidades.php` — `::de(User)` resuelve permisos,
  `soloPropios()` y alcance desde `Usuario` por `central_user_id`. Descarta la
  `$cuenta` en el constructor: hay que guardarla para exponer la ficha.
  **Reutilizar, no duplicar.**
- `app/Http/Controllers/CitaController.php` — `fichaDe()` (:140-146) resuelve
  Usuario → Profesional a mano; lo usan `soloLasSuyas()` (:131) y
  `exigirVisibilidad()` (:118). Pasa a llamar a `Capacidades`.
- `tests/Feature/Agenda/CitasTest.php` — «Quién ve qué» (:447-520) ya monta rol
  con `solo_propios`, `User` central, `Usuario` y `Profesional`. **Reutilizar
  ese montaje**; `agendar()`, `citaValida()` y `comoOtro()` ya existen.

## Tasks & Acceptance

**Execution:**
- [x] `app/Support/Capacidades.php` — guardar la `$cuenta` y exponer la ficha de
  profesional del usuario (`profesional()`), devolviendo `null` si no tiene —
  para que exista UN solo sitio que responda «quién soy yo como profesional».
- [x] `app/Http/Controllers/CitaController.php` — sustituir `fichaDe()` por la
  consulta a `Capacidades`, sin cambiar el comportamiento del 404 — quitar la
  copia antes de que nazca la segunda.
- [x] `app/Services/CitaService.php` — añadir un método privado que exija que el
  `empleado_id` sea la ficha propia cuando `solo_propios`, y llamarlo desde
  `crear()` y desde `actualizar()` — la regla en el service protege todos los
  caminos.
- [x] `tests/Feature/Agenda/CitasTest.php` — cubrir los seis casos de la matriz,
  incluida la prueba de que el `PUT` sobre una cita ajena responde 404.

**Acceptance Criteria:**
- Given un rol con `citas: gestionar` y `solo_propios`, when se intenta agendar
  o reasignar a otro profesional por cualquier endpoint, then responde 422 y la
  base no cambia.
- Given la regla implementada, when se busca en el repositorio, then aparece en
  `CitaService` y en ningún otro sitio.
- Given la suite completa, when se ejecuta, then las 312 pruebas anteriores
  siguen en verde y ninguna prueba de aislación entre negocios se relaja.

## Implementation Notes

Hecho el 2026-09-20 sobre `sprint-1/1-1-agendar-solo-lo-propio`.

- **`Capacidades`** guarda ahora la `$cuenta` (promovida a propiedad del
  constructor) y expone `profesional(): ?Profesional`, que sale de la relación
  `Usuario::profesional()` y se trae con `with()` en la misma consulta de
  siempre — no hay una consulta extra por petición.
- **`Capacidades::deUsuarioCentral(int)`** es nueva y `de(User)` delega en ella.
  Hizo falta porque el service recibe el id central y no el modelo: sin esto
  habría que traer el `User` de la base central solo para leerle el id. Una sola
  resolución, dos puertas.
- **`CitaService::exigirProfesionalEnAlcance()`** es la regla, y se llama como
  PRIMERA sentencia de la transacción en `crear()` y en `actualizar()` — antes
  incluso de `Profesional::findOrFail()`, para que no se toque nada. Resuelve
  las `Capacidades` desde el `$usuarioId` que ya recibía; no se pasan por
  parámetro, como pide Design Notes.
- Lanza `ValidationException` en `empleado_id` dentro de `DB::transaction`, así
  que la base no cambia. **Dos mensajes**: «Solo puedes agendar citas para ti.»
  cuando el `empleado_id` es de otro, y «Tu cuenta no tiene ficha de
  profesional…» cuando no hay ficha — ese segundo caso no tiene un «ti» al que
  mandar al usuario, así que el primer mensaje no sería accionable.
- El `empleado_id` se lee con `?? null` y se castea a `int`: la regla `integer`
  del Form Request acepta la cadena "3" y `validated()` no castea, y un llamador
  que no pase por `CitaRequest` recibe un rechazo y no un 500.
- **`CitaController::fichaDe()`** ya no resuelve Usuario → Profesional a mano:
  delega en la `Capacidades` que el middleware dejó en el request. El import de
  `Usuario` se fue con ella. El 404 de `exigirVisibilidad()` no se tocó.
- Los tests repetidos de montaje se unificaron en dos helpers,
  `cuentaDelNegocio()` y `otroProfesional()`; los dos tests de «quién ve qué»
  que existían pasan por ellos.

**Nota de alcance para 1.2 y 1.3:** el método se llama
`exigirProfesionalEnAlcance()` y no `exigirFichaPropia()` a propósito — G-2
(sedes) y G-3 (profesional/servicio/sede) entran ahí mismo sin renombrarlo.

## Spec Change Log

**2026-09-27 — parches de la pasada 1 aplicados.** Los nueve hallazgos con ruta
`patch` del Review Triage Log. La intención y la matriz (bloque congelado) no
cambian: ninguno era `intent_gap` ni `bad_spec`. Verificado sobre el diff en
stage; `--filter=Citas` en verde (45 pruebas, 215 aserciones).

| # | Parche | Dónde |
|---|---|---|
| 1 | El `PUT` sobre la cita ajena manda `empleado_id` = Rosa (también fuera de alcance): el 404 y el 422 compiten de verdad y la prueba fallaría con la precedencia invertida | `CitasTest` — `la cita de otro profesional responde 404…` |
| 2 | Lectura sin ficha cubierta: listado vacío y 404 en `GET`/`PUT`/`DELETE` de la cita ajena | `CitasTest` — `con solo_propios y sin ficha no ve ninguna cita` |
| 3 | `empleado_id` como cadena sigue siendo el suyo; el `(int)` queda protegido por una prueba | `CitasTest` — `…el empleado_id como cadena sigue siendo el suyo` |
| 4 | El docblock deja de prometer «todos los caminos»: declara que cubre solo el DESTINO y enumera lo que no (propiedad de la cita, sede) y el requisito para la Épica 6 | `CitaService::exigirProfesionalEnAlcance()` |
| 5 | Prueba positiva de `PUT`: con `solo_propios` y ficha, edita su propia cita | `CitasTest` — `con solo_propios sí edita su propia cita` |
| 6 | `$datos['empleado_id'] ?? null`: un llamador sin `CitaRequest` recibe 422, no 500 | `CitaService::exigirProfesionalEnAlcance()` |
| 7 | Mensaje propio sin ficha («Tu cuenta no tiene ficha de profesional, así que no puede agendar citas.»), con aserción del texto | `CitaService`, `CitasTest` |
| 8 | `cuentaDelNegocio()` deriva rol y email de un contador: dos llamadas conviven; `quien solo tiene ver no agenda` pasa por ella | `CitasTest` |
| 9 | Nuevo 422 anotado para el frontend, con la propuesta de `profesional_id` en `/capacidades` (sigue diferida, #14) | `Backend-Sass/docs/pendientes-contrato.md` |

**Queda antes de mergear:** suite completa y segunda pasada de
`bmad-code-review` sobre el diff parcheado.

## Review Triage Log

**Pasada 1 (2026-09-20)** — 4 lentes, 24 hallazgos. Veredictos: 4 medium, 5 low,
9 defer, 6 rechazados. **Sin loopback**: ningún hallazgo es intent_gap ni bad_spec.

| # | Lente | Veredicto | Ruta | Evidencia |
|---|---|---|---|---|
| 1 | blind | **medium** | patch | La prueba del «404 antes que 422» manda `empleado_id` = la ficha PROPIA, así que la rama del 422 nunca se dispara: pasaría igual con la precedencia invertida. Verificado en el diff. |
| 2 | verif-gap | **medium** | patch | Pre-verificado. El test de lectura sin ficha pasó a montar cuenta CON ficha: la rama `?->id ?? 0` y el 404 sin ficha quedan sin cubrir. Relajar `CitaController:122` no rompería nada. |
| 3 | verif-gap | **medium** | patch | Pre-verificado. `CitaRequest` valida `integer` pero `validated()` no castea: `"3"` llega como cadena. Ninguna prueba manda cadena, así que quitar el `(int)` de `:157` bloquearía al propio profesional sin que falle nada. |
| 4 | blind | **medium** | patch | El docblock de `exigirProfesionalEnAlcance()` promete proteger «todos los caminos, incluida la reserva pública de la Épica 6». Solo protege el DESTINO (`empleado_id`); la propiedad de la cita y la sede siguen en el controlador. La promesa es falsa hoy. |
| 5 | blind | low | patch | No hay prueba positiva de `PUT`: nadie demuestra que con `solo_propios` y ficha se pueda editar la cita propia. Una regresión que bloquee la edición legítima pasa en verde. |
| 6 | edge/blind | low | patch | `$datos['empleado_id']` se indexa directo; un llamador que no pase por `CitaRequest` daría 500 en vez de 422. Corrección directa (`?? null`), falla cerrado. |
| 7 | blind | low | patch | El 422 sin ficha dice «Solo puedes agendar citas para ti», que no es accionable: no existe ese «ti». Y el texto no está cubierto por ninguna aserción. |
| 8 | blind | low | patch | `cuentaDelNegocio()` promete servir «TODOS los casos» pero fija los permisos y usa email/rol únicos: llamarla dos veces revienta. Por eso `quien solo tiene ver no agenda` conservó su montaje manual. |
| 9 | blind | low | patch | El nuevo 422 sobre `empleado_id` es comportamiento visible para el cliente y no está anotado en `docs/pendientes-contrato.md`, que es lo que pide CLAUDE.md. |
| 10 | edge/blind/intent | medium (diferido) | defer | `actualizar()` no comprueba de quién ERA la cita y `eliminar()` no comprueba nada: el 404 lo pone el controlador. **No alcanzable hoy** (`CitaController` es el único llamador, verificado por grep), pero es el seam que heredaría la Épica 6. |
| 11 | blind/intent | medium (diferido) | defer | Sin fila en `usuarios`, `soloPropios()` es `false` y el candado deja pasar todo. No alcanzable hoy: `puede:citas` ya exige cuenta con permiso. Misma raíz que #10. |
| 12 | blind/intent | — | defer | El eje SEDE tiene el mismo agujero sin tapar. Es G-2, **ya planificado como Story 1.2**. |
| 13 | edge | — | defer | Una ficha con `activo=false` satisface el candado. Es G-3, **ya planificado como Story 1.3**. |
| 14 | blind | — | defer | `GET /capacidades` no emite `profesional_id`, así que el panel no puede preseleccionar el selector. Cambio de contrato: exige acuerdo con el frontend (AD-13). |
| 15 | edge/blind/verif | low (diferido) | defer | Segunda resolución de `Capacidades` por escritura + `profesional` en el `with()` de toda petición del panel. Coste real; la decisión de no pasarla por parámetro se mantiene. |
| 16 | edge | **false** | rechazado | `fichaDe()` devolvería `null` sin el atributo `capacidades`. Las seis rutas de citas están tras `puede:citas` (`routes/api.php:236-244`), que es quien lo pone. No alcanzable. |
| 17 | edge | low | rechazado | `(int)` aceptaría `'7abc'` o `[7]`. `CitaRequest` valida `integer` + `exists`; el fix añade ramas para un caso no alcanzable. |
| 18 | edge | **false** | rechazado | «El código afirma cero coste extra por petición». Esa frase está en el informe del implementador, no en el código. El comentario que sí está (`CitaController:136`) es exacto: la ficha viene cargada del middleware. |
| 19 | intent | **false** | rechazado | «`Usuario::profesional()` es un `hasOne` nuevo». Existe desde el Sprint 3.A (`ea71688`); el diff no lo toca. |
| 20 | intent (a) | — | defer | La premisa «al escribir no hay filtro» abarca dos ejes y solo se cierra uno. Mismo contenido que #12 (Story 1.2). |
| 21 | intent (b) | — | (ver #4, #10) | La ordenación «404 antes que 422» es propiedad de la capa HTTP, no del service. Recogido en el parche #1 y en el diferido #10. |
| 22 | intent (e) | low | rechazado | Ninguna prueba llama a `CitaService` directamente, así que la colocación solo se verifica leyendo. Cierto, pero el criterio de aceptación por `grep` ya cubre la colocación, y probar un private por reflexión empeora el diseño. |
| 23 | intent (f) | low | rechazado | `fichaDe()` es del camino de lectura y se tocó en un cambio de escritura. Es el precio de quitar la duplicación, que la intención pide explícitamente. |
| 24 | intent (d) | — | (ver #15) | Una copia de la REGLA, dos resoluciones por petición. Diferido con #15. |

**Pasada 2 (2026-09-27)**: 4 lentes sobre el diff con los parches de la pasada 1 (en stage, baseline `8499b94`). Verification Gap no encontró nada. Resultado: 0 decision-needed, 3 patch, 5 defer (1 nuevo y 4 ya diferidos en la pasada 1), 4 rechazados. **Sin loopback**: ningún hallazgo es intent_gap ni bad_spec.

| # | Lente | Veredicto | Ruta | Evidencia |
|---|---|---|---|---|
| 25 | blind+edge | **medium** | patch | El docblock de `Capacidades::profesional()` dice que el `null` sin cuenta «es lo que hace que la regla de escritura falle CERRADA». Es falso: sin cuenta, `soloPropios()` es `false` (constructor, `(bool) $rol?->solo_propios`) y `exigirProfesionalEnAlcance()` retorna antes de llegar a mirar la ficha. Es una promesa de seguridad falsa justo donde la Épica 6 irá a buscar. El comportamiento en sí sigue diferido (#11). |
| 26 | blind | low | patch | El comentario de `acotar()` habla de `whereRaw(0)`, pero el código hace `where('profesional_id', …?->id ?? 0)`. La prueba nueva cita «la rama `?->id ?? 0`» y contradice el comentario. |
| 27 | blind+edge | low | patch | El docblock de `cuentaDelNegocio()` promete que «dos llamadas conviven», pero si se pasa `rol` o `email` a mano el contador no interviene y el unique revienta. Basta con corregir el texto. |
| 28 | edge | **medium** | defer | Un `PUT` sobre una cita ajena con payload inválido recibe el 422 de `CitaRequest` ANTES que el 404 de `exigirVisibilidad()`: el Form Request se resuelve antes del cuerpo del método. Un id inexistente da 404 (binding) y uno ajeno da 422, así que sirve de oráculo de existencia contra la política «404, nunca 403» (vale también para el alcance por sedes). Viene de la Story 4.B, no lo causa este cambio. |
| 29 | blind+edge | — | defer (= #11) | Sin fila en `usuarios` el candado falla abierto. Ya diferido. |
| 30 | blind+intent | — | defer (= #10) | La propiedad de la cita y `eliminar()` siguen solo en el controlador, y la Épica 6 queda fuera del alcance real. Ya diferido. |
| 31 | blind | — | defer (= #15) | Doble resolución de `Capacidades` y eager load de `profesional` en toda petición con `puede:`. Ya diferido. |
| 32 | blind | — | defer (= #13) | Una ficha con `activo=false` sigue contando como «yo». Es G-3, Story 1.3. |

### Review Findings

- [x] [Review][Patch] Corregir el docblock de `profesional()`: el `null` sin cuenta NO hace fallar cerrada la regla de escritura [app/Support/Capacidades.php:110]
- [x] [Review][Patch] Comentario de `acotar()`: `whereRaw(0)` → `?->id ?? 0` [app/Http/Controllers/CitaController.php:104]
- [x] [Review][Patch] Docblock de `cuentaDelNegocio()`: las dos llamadas conviven solo si no se fijan `rol` ni `email` a mano [tests/Feature/Agenda/CitasTest.php:462]
- [x] [Review][Defer] Un payload inválido sobre una cita ajena devuelve 422 antes que 404 (oráculo de existencia) [app/Http/Controllers/CitaController.php:62] — deferred: preexistente (Story 4.B)
- [x] [Review][Defer] Sin cuenta en `usuarios` el candado falla abierto [app/Services/CitaService.php] — deferred: ya diferido en la pasada 1 (#11)
- [x] [Review][Defer] La propiedad de la cita y `eliminar()` solo se comprueban en el controlador [app/Http/Controllers/CitaController.php] — deferred: ya diferido en la pasada 1 (#10)
- [x] [Review][Defer] Doble resolución de `Capacidades` y eager load global de `profesional` [app/Support/Capacidades.php] — deferred: ya diferido en la pasada 1 (#15)
- [x] [Review][Defer] Una ficha inactiva satisface el candado [app/Support/Capacidades.php] — deferred: ya diferido en la pasada 1 (#13, Story 1.3)

**Rechazados (pasada 2)**

- `false`: el comentario de `fichaDe()` («ya viene cargada del middleware, no cuesta una consulta») sería engañoso. Es exacto para esa llamada; el coste de la segunda resolución es el #15.
- `false`: la entrada de `pendientes-contrato.md` sería inconsistente. La fecha 2026-09-20 es la de la implementación; `CapacidadesController` se cita como el sitio donde caería la propuesta, no como algo ya tocado; y los Traspasos de `estado.md` están derogados desde el 2026-09-20 (lo dice la cabecera de `estado.md`).
- `low`: faltan pruebas que llamen al service directamente. Los casos que cubrirían no son alcanzables hoy (#11), y es lo mismo que el #22 de la pasada 1.
- `low`: la rama `?? null` no tiene prueba. `CitaRequest` declara `empleado_id` como `required`, así que por HTTP no se alcanza; probarla exige montar una prueba de service solo para un caso defensivo.

## Design Notes

La ficha de profesional es «sobre quién» visto desde el otro lado, así que su
sitio es `Capacidades`: el controlador ya la necesitaba y el service la
necesita ahora, y dos resoluciones distintas de lo mismo son el error que costó
tres escaladas en septiembre.

El service resuelve `Capacidades` desde el `$usuarioId` que ya recibe, **no**
como parámetro: si el que llama pudiera pasarla —o pasar `null`—, el candado
volvería a depender de quién llama, que es lo que este arreglo viene a quitar.

## Verification

**Commands:**
- `C:/laragon/bin/php/php-8.3.33-nts-Win32-vs16-x64/php.exe artisan test --filter=Citas` — esperado: verde, con las pruebas nuevas incluidas
- `C:/laragon/bin/php/php-8.3.33-nts-Win32-vs16-x64/php.exe artisan test` — esperado: 312 + nuevas en verde (tarda ~41 min: solo antes de mergear)
- `grep -rn "solo_propios\|soloPropios" app/` — esperado: la regla de escritura aparece una sola vez, en `CitaService`
