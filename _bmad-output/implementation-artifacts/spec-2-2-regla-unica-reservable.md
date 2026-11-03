---
title: 'Story 2.2 — Una sola regla decide si algo es reservable'
type: 'feature'
created: '2026-11-03'
status: 'ready-for-dev'
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
