- source_spec: `spec-1-1-agendar-solo-lo-propio.md`
  summary: El service no comprueba de quién ES la cita al actualizar ni al eliminar; ese 404 lo pone hoy solo `CitaController::exigirVisibilidad()`.
  evidence: Real pero no alcanzable hoy — `CitaController` es el único llamador de `CitaService::crear/actualizar/eliminar` (grep en `app/`). Se vuelve alcanzable en cuanto la Épica 6 entre al service sin pasar por ese controlador: hay que cerrarlo ANTES de abrir la reserva pública (Story 6.6).

- source_spec: `spec-1-1-agendar-solo-lo-propio.md`
  summary: Sin fila en `usuarios`, `Capacidades::soloPropios()` es `false` y el candado de escritura deja pasar todo.
  evidence: Misma raíz que el anterior. Hoy lo tapa `puede:citas`, que ya exige cuenta con permiso; un llamador sin cuenta de panel (reserva pública, comando, job) entraría sin candado. Lo que lo settle: que el camino público declare explícitamente su actor en vez de heredar «sin cuenta = sin restricción».

- source_spec: `spec-1-1-agendar-solo-lo-propio.md`
  summary: `GET /capacidades` no emite `profesional_id`, así que el panel no puede preseleccionar ni bloquear el selector de profesional y el usuario descubre la regla con un 422.
  evidence: Cambio de contrato: requiere acuerdo con el frontend antes de implementarse (AD-13). Anotado en `docs/pendientes-contrato.md` del backend.

- source_spec: `spec-1-1-agendar-solo-lo-propio.md`
  summary: Cada escritura de cita resuelve `Capacidades` por segunda vez, y `profesional` se carga con eager load en toda petición autenticada del panel.
  evidence: Coste real y medible; la decisión de no aceptarla por parámetro se mantiene (el candado no puede depender de quien llama). Si el perfil lo pide, el sitio para memoizar por petición es `Capacidades`, nunca el service.

## Deferred from: code review of spec-1-1-agendar-solo-lo-propio.md (2026-09-27)

- source_spec: `spec-1-1-agendar-solo-lo-propio.md`
  summary: Un `PUT /citas/{id}` sobre una cita ajena (por `solo_propios` o por sede) con payload inválido responde 422 de `CitaRequest` antes que el 404 de `exigirVisibilidad()`, y eso sirve de oráculo de existencia.
  evidence: El Form Request se resuelve antes del cuerpo de `CitaController::update()`; el binding da 404 con un id inexistente y el 422 aparece con uno que existe. Es preexistente (Story 4.B). Para cerrarlo, la visibilidad tiene que comprobarse antes de validar (p. ej. en `CitaRequest::authorize()` o en un middleware), sin copiar la regla.

- source_spec: `spec-1-2-las-citas-no-salen-del-alcance-de-sedes.md`
  summary: Una cuenta con alcance acotado puede editar o borrar citas con `local_id` NULL que no ve en su listado.
  evidence: `CitaController::exigirVisibilidad()` solo comprueba la sede si `local_id !== null`, y `acotar()` las excluye con `whereIn`. Viene del Sprint 4.B. Es alcanzable si el negocio agendó antes de crear su primer local (el primero se vuelve principal en `LocalService`). Para decidir: si una cita sin sede es visible para una cuenta acotada o no (404).

- source_spec: `spec-1-2-las-citas-no-salen-del-alcance-de-sedes.md`
  summary: `GET /locales` devuelve TODAS las sedes a una cuenta con alcance vacío.
  evidence: `LocalController.php:28` filtra con `->when($this->alcanceDeSedes($request), ...)`; `[]` es falso, así que no filtra. `CitaController::acotar()` compara con `!== null` y sí lo hace bien. Viene de antes. El arreglo es de una línea, más una prueba.

- source_spec: `spec-1-2-las-citas-no-salen-del-alcance-de-sedes.md`
  summary: Un `local_id` explícito a una sede inactiva (o borrada) del alcance se acepta al crear o mover una cita.
  evidence: `sedeEnAlcance()` solo mira la pertenencia al alcance; el camino por defecto sí se salta las inactivas. Es G-3, planificado como Story 1.3.

- source_spec: `spec-1-2-las-citas-no-salen-del-alcance-de-sedes.md`
  summary: Sin fila en `usuarios`, `Capacidades::locales()` es `null` y el eje sede tampoco restringe.
  evidence: Misma raíz que el diferido de la 1.1 sobre `soloPropios()` sin cuenta. Hoy lo tapa `puede:citas`; la reserva pública de la Épica 6 tiene que resolver su propio actor.

## Deferred from: code review of spec-1-2-las-citas-no-salen-del-alcance-de-sedes.md (2026-09-28)

- source_spec: `spec-1-2-las-citas-no-salen-del-alcance-de-sedes.md`
  summary: Con `todos_los_locales` y sin `local_id`, `localPorDefecto()` no filtra `activo` ni falla sin principal: la cita cae en una principal inactiva o con `local_id` NULL.
  evidence: `CitaService::sedeEnAlcance()` delega en `localPorDefecto()` cuando el alcance es `null`, y ese método es `Local::where('es_principal', true)->value('id')`. La rama acotada sí se salta las inactivas y falla cerrado. Preexistente. La cita con NULL es la que alimenta el hueco de `exigirVisibilidad()` (diferido de la pasada 1). Para decidir: si agendar sin ninguna sede creada sigue permitido (hoy es la única salida de un negocio sin locales).

- source_spec: `spec-1-2-las-citas-no-salen-del-alcance-de-sedes.md`
  summary: Con `todos_los_locales`, un `local_id` de una sede borrada (soft delete) se acepta.
  evidence: `CitaRequest.php:39` usa `Rule::exists('locales', 'id')` sin `->whereNull('deleted_at')`. A una cuenta acotada no le pasa porque la relación `locales` excluye las borradas. Preexistente; va con G-3 (Story 1.3).

- source_spec: `spec-1-3-no-se-pueden-agendar-citas-imposibles.md`
  summary: `CitaService::exigirReservable()` no mira `servicios.activo`: un servicio desactivado se sigue pudiendo agendar desde el panel.
  evidence: El `exists` de `CitaRequest` solo excluye borrados y `Servicio::findOrFail()` no filtra `activo`. Previo a la 1.3, cuya intención es el profesional; FR-67 pide «servicio activo y habilitado en la sede», que entra con `local_servicio` en la Épica 2, dentro del mismo método.

- source_spec: `spec-1-4-nadie-concede-lo-que-no-tiene.md`
  summary: Asignar el alcance de una cuenta (`todos_los_locales` y sedes) al invitar o editar en `/usuarios`.
  evidence: Ningún endpoint escribe hoy `todos_los_locales` ni `usuario_local`; toda cuenta nace con todas las sedes. El PRD (FR-63) lo sitúa al invitar o editar; el humano decidió el 2026-09-28 dejarlo para la 1.8. La regla de alcance ya vive en `Rango` desde la 1.4.

- source_spec: `spec-1-4-nadie-concede-lo-que-no-tiene.md`
  summary: Dar de alta un profesional con cuenta no es atómico: la cuenta central, la fila de `usuarios` y la invitación se crean antes de la transacción de la ficha.
  evidence: `ProfesionalService::crear()` y `actualizar()` llaman `cuentaSiSePide()` antes de `DB::transaction(fn () => $this->rellenar(...))`; si `rellenar()` falla (foto, error de base) queda una cuenta huérfana con la invitación ya enviada. Previo a la 1.4, que solo evita que un no general llegue a crearla.
