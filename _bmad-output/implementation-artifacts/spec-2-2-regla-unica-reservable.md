---
title: 'Story 2.2 — Una sola regla decide si algo es reservable'
type: 'feature'
created: '2026-11-03'
status: 'done'
route: 'full'
review: 'thorough'
baseline_commit: 'develop'
---

## Intent

Que el panel, la tienda y el enlace del cliente usen **el mismo criterio** para
decidir si se puede reservar algo (PRD FR-67, AD-6, NFR12). Sin sorpresas según
por dónde se entre.

## Estado de partida (2026-11-03)

La regla vive hoy en **tres sitios que no coinciden**:

| Sitio | Qué comprueba |
|---|---|
| `CitaService::exigirReservable` (1.3) | profesional activo, habilitado en la sede y que preste el servicio |
| `CitaController::opciones` (1.7/1.10) | sus propios `whereHas` sobre profesionales, sedes y servicios |
| `Disponibilidad::huecos` | nada: calcula huecos aunque la combinación no sea reservable |

Falta además la sede del servicio (`local_servicio`, Story 2.1) y que el
servicio esté activo.

## La regla (FR-67)

Servicio + profesional + sede es **reservable** si y solo si:

1. el servicio está **activo** (y no borrado);
2. el profesional está **activo** y **atiende**;
3. el profesional **presta** ese servicio (`servicio_profesional`);
4. si hay sede: la sede está **activa**, el servicio está **habilitado** en
   ella (`local_servicio`, 2.1) y el profesional está **habilitado** en ella
   (`local_profesional`).

En un negocio **sin sedes** solo cuentan 1 a 3, como hoy.

## Decisiones

- **Una sola clase**, `App\Services\Reservabilidad`, con dos caras de la misma
  regla para no copiarla:
  - `evaluar(Servicio, Profesional, ?Local): Veredicto` — sí/no y, si no, el
    **primer motivo** con su campo (`servicio_id`, `empleado_id`, `local_id`) y
    un mensaje en español que nombra lo que falla.
  - `restringir*(Builder)` — las mismas condiciones como restricciones de
    consulta, para listar solo lo reservable (opciones, y mañana el catálogo de
    la tienda) sin traer todo a memoria.
  Una prueba de **coherencia** recorre una matriz de combinaciones y exige que
  lo que lista la consulta sea exactamente lo que `evaluar` aprueba.
- **Panel → 422** con el motivo exacto, en el campo que toca (lo que hace la
  1.3 hoy, sin cambiar los mensajes que ya existen).
- **Tienda pública → 404**, sin revelar qué falla a un desconocido. La tienda
  llega en la épica 6; aquí se deja el método (`exigirParaPublico`) y su prueba.
- **Disponibilidad** pregunta a la regla antes de calcular: si no es
  reservable, **no hay huecos**.
- El orden de los motivos se mantiene como en la 1.3 (baja → sede → servicio)
  para no cambiar respuestas que el panel ya pinta. Las precedencias con
  `solo_propios` y el alcance de sedes (1.1–1.3) no se tocan.
- Del lado del panel no hay copia de la regla: el formulario ya solo ofrece lo
  que devuelve `/citas/opciones` (1.10).

## Plan (Backend-Sass)

1. `Reservabilidad` + `Veredicto`, con la regla completa (incluida `local_servicio`).
2. `CitaService::exigirReservable` delega en `evaluar` y lanza el 422.
3. `Disponibilidad::huecos` consulta la regla (vacío si no es reservable).
4. `CitaController::opciones`: profesionales y servicios con `restringir*`.
5. `exigirParaPublico` (404) con su prueba, listo para la épica 6.

## Pruebas (Pest)

- Cada condición, una prueba: servicio inactivo, profesional de baja o que no
  atiende, no presta el servicio, sede inactiva, servicio deshabilitado en la
  sede, profesional deshabilitado en la sede → no reservable con su motivo.
- Negocio sin sedes: basta con 1–3.
- Coherencia: la consulta lista exactamente lo que `evaluar` aprueba.
- `POST`/`PUT /citas`: 422 en el campo correcto; las pruebas de la 1.3 siguen
  en verde sin tocarlas.
- Disponibilidad: combinación no reservable → sin huecos.
- `exigirParaPublico` → 404.
- La suite `Concurrencia` sigue en verde (la regla corre dentro de la
  transacción de la agenda).

## Depende de

- **2.1** (`local_servicio`). Se empieza cuando la 2.1 esté en `develop`.

## Cómo quedó (2026-11-03)

- `App\Services\Reservabilidad` (`evaluar`, `exigirParaPublico`,
  `restringirProfesionales`, `restringirServicios`,
  `restringirServiciosDelProfesional`) y `App\Support\Veredicto`. Las
  restricciones son UNA subconsulta de ternas (servicio + profesional + sede
  en la misma sede), no `whereHas` sueltos.
- Orden de motivos: baja → servicio inactivo → no atiende → sede inactiva →
  profesional no habilitado en la sede → la sede no ofrece el servicio → no
  presta. Los tres mensajes de la 1.3 no cambian.
- `Disponibilidad::huecosReservables()` pregunta a la regla; `huecos()` queda
  como cálculo de horario puro para el anti-solape, que ya aplicó la regla
  (o la salta a propósito al cerrar la cita de un profesional de baja).
- `/citas/opciones` ya no lista profesionales sin nada agendable, y acepta
  `?local_id=`: con la sede elegida en el formulario, solo lo reservable EN
  ella (decidido en la revisión). El panel la manda desde `SelectorOpcion`;
  lo ya elegido se sigue pidiendo sin sede para no desaparecer.
- Pruebas: `tests/Feature/Agenda/ReservabilidadTest.php` (28, con la matriz de
  coherencia, filas borradas y `solo_propios`). En `CitasTest` solo cambió la preparación: las sedes creadas con
  el modelo ahora también ofrecen los servicios (`ofrecerServiciosEnSedes`).
- Panel: con una sola sede el selector no se pinta, así que un 422 en
  `local_id` sale como aviso en el formulario.
- Suite completa 489 + Concurrencia 2, en verde (tras los arreglos de la revisión).

### Review Findings

Revisión `bmad-code-review` del 2026-11-03 (Backend-Sass #18 + Sass-ChiraFlow #37).

- [x] [Review][Patch] Recortar `/citas/opciones` por la sede elegida (`?local_id=`) y que el formulario la mande — decidido 2026-11-03: arreglarlo en la 2.2 [Backend-Sass app/Http/Controllers/CitaController.php; web/src/features/citas]
- [x] [Review][Patch] Probar `solo_propios` en los servicios de `/citas/opciones` [Backend-Sass app/Http/Controllers/CitaController.php:61]
- [x] [Review][Patch] Filas borradas (soft delete) en la matriz de coherencia [Backend-Sass tests/Feature/Agenda/ReservabilidadTest.php]
- [x] [Review][Patch] Dos pruebas que no afirman nada útil: `expect(true)` en la tienda y `not->toBeEmpty()` en disponibilidad [Backend-Sass tests/Feature/Agenda/ReservabilidadTest.php]
- [x] [Review][Patch] El contrato dice que la disponibilidad ya usa la regla; `huecosReservables()` aún no tiene quien la llame (la tienda, épica 6) [docs/api-contract.md]
- [x] [Review][Patch] Comillas dobles «««» en la tabla de mensajes del contrato [docs/api-contract.md]
- [x] [Review][Patch] El docblock de `evaluar()` no lista el orden real de los motivos [Backend-Sass app/Services/Reservabilidad.php:47]
- [x] [Review][Patch] `ofrecerServiciosEnSedes()` reactiva filas que una prueba haya apagado antes [Backend-Sass tests/Feature/Agenda/CitasTest.php]
- [x] [Review][Defer] Verificar en el navegador el aviso de `local_id` con una sola sede [web/src/features/citas/components/CitaFormDialog.tsx] — deferred: con datos ficticios no se puede provocar ese 422; se comprueba al conectar las citas al backend.

**Rechazados**

- `false` — «Al editar, el selector se queda vacío si lo elegido ya no es reservable»: `SelectorOpcion` enseña lo que ya se sabía de la cita (`conocida`) cuando `_ids` no lo devuelve.
- `false` — «Una sede inexistente recibe el mensaje de desactivada»: `CitaRequest` valida `local_id` con `exists:locales`.
- `false` — «Faltan índices para la subconsulta»: las tres pivotes tienen índice único compuesto y claves foráneas indexadas.
- `false` — «`atiende = false` es un 422 nuevo al mover citas existentes»: es la regla de la ficha (punto 2) y está en el contrato; cerrar o cambiar el estado sigue sin pasar por la regla.
- `false` — «La tienda y el enlace del cliente no usan la regla»: no existen todavía; la ficha los deja para la épica 6 con `exigirParaPublico` listo.
- `low` — «Cita sin sede en un negocio con sedes se evalúa sin la dimensión sede»: solo ocurre con citas antiguas sin sede (toda sede creada por la API deja una principal, que no se puede borrar); es el comportamiento de la 1.3.
- `low` — «`Disponibilidad` crea `Reservabilidad` con `new`»: `Disponibilidad` también se crea con `new`; inyectarla añade un parámetro sin daño concreto hoy.
- Rechazado por editar la ficha — «Son 26 pruebas, no 25».
