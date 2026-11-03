---
title: 'Story 1.13 — Cada cita dice de dónde vino y quién la registró'
type: 'feature'
created: '2026-11-03'
status: 'done'
route: 'full'
review: 'thorough'
baseline_commit: 'develop'
---

## Intent

Que el dueño pueda resolver un «yo no moví esa cita» sin adivinar: cada cita
dice si vino del panel o de la tienda y quién la registró, y guarda un
historial de lo que le pasó (PRD FR-33 y FR-68, decisión A-2, F-03).

## Decisiones

- **Una tabla de eventos por base, `eventos_dominio`** (AD-8), y no
  `cita_eventos`: el texto de la regla manda sobre el diagrama. El historial de
  la cita es la consulta de sus eventos, y los avisos de la Épica 4 leerán de la
  misma tabla.
- **El nombre del actor se guarda en el evento**, tal como era en ese momento.
  Si mañana se renombra o se borra su cuenta, el historial sigue diciendo quién
  fue. `creada_por` de la cita, en cambio, muestra el nombre actual.
- **Se anotan solo los campos que importan**: estado, fecha, hora, profesional,
  servicio, sede (por nombre) y monto. Cambiar solo notas, cliente o productos
  no deja evento.
- **`fuente` se queda en la tabla pero deja de usarse** (AD-14: las migraciones
  solo añaden). Pasa a admitir NULL sin valor por defecto, para que las citas
  nuevas no nazcan con un `publica` que ya no significa nada.
- **Pagos**: el criterio habla de «cambio de pago», pero hoy no existe ningún
  camino que registre pagos (llegan con la Épica 7). Lo que sí existe, el monto
  editable, se anota.

## Implementation

**Contrato** (`docs/api-contract.md`): `Cita.canal`, `Cita.creada_por`, y
`GET /citas/{id}/historial` con la forma `EventoCita`.

**Backend-Sass**
- Migración de negocio `2026_11_03_000001_canal_y_autor_en_citas`: `canal`
  (`panel`|`tienda`) y `creada_por_usuario_id`. Las existentes: `admin` →
  `panel`, `publica` → `tienda`, sin autor.
- Migración `2026_11_03_000002_create_eventos_dominio_table` y modelo
  `EventoDominio`.
- `CitaService`: `crear` pone `canal = panel` y el autor y anota
  `cita.creada`; `actualizar` compara una foto antes y después y anota
  `cita.modificada` con los cambios; `eliminar` anota `cita.eliminada`. Todo
  dentro de la transacción de la operación.
- `CitaResource` emite `canal` y `creada_por`, con el nombre rellenado en una
  consulta a la base central por página (`rellenarAutores`).
- `GET /citas/{cita}/historial`: mismo permiso y alcance que verla.

**Panel**
- Tipos `CanalCita` y `EventoCita`; `citasApi.historial` con rama mock;
  `useHistorialCita`, que cuelga de `citasKeys.all` y se refresca al guardar.
- `HistorialCita` al final de la ficha de edición: el origen y la línea de
  tiempo.
- `docs/vistas/citas.md` al día.

## Verification

- `CitasTest`: 8 pruebas nuevas (canal y autor en la respuesta y en la base,
  `fuente` nula; historial al crear; cambios de estado y hora con antes y
  después; profesional y monto; guardar sin cambios no anota; 404 a quien no
  ve la cita; el borrado deja evento; la migración de las citas existentes).
  Las cuatro principales fallan sin los cambios de `CitaService`.
- `npm run typecheck` en verde; ficha comprobada en el navegador.
