---
title: 'Story 1.10 — Ningún selector pierde opciones en silencio'
type: 'feature'
created: '2026-11-03'
status: 'done'
route: 'full'
review: 'thorough'
baseline_commit: 'develop'
---

## Intent

Que un negocio con más de 200 clientes (o productos, servicios, profesionales)
no pierda opciones en los selectores sin que nadie lo note (F-05, NFR5, NFR6).

## Lo que había

- El formulario de citas cargaba clientes, profesionales, servicios y
  productos enteros con `per_page=200`: lo que pasaba de ahí no existía para
  el panel.
- `recurso.all()` pedía una sola página de 200 para todo lo que se pinta entero.
- `GET /citas/opciones` (Story 1.7) ya existía, paginado y con el alcance y los
  permisos de quien agenda, pero el formulario nunca lo usó y solo buscaba
  clientes.

## Implementation

**Backend-Sass — `GET /citas/opciones`**
- `{coleccion}_search` por nombre en profesionales, servicios, productos y
  clientes (`search` a secas se sigue aceptando para clientes).
- `{coleccion}_ids` para pedir lo ya elegido aunque no esté en la primera página.
- `solo=` para devolver solo las colecciones pedidas.
- `profesionales` solo con `atiende = true`, como la agenda del panel.
- `locales` con `es_principal` y `clientes` con `email`, que el formulario usa.

**Panel**
- `SelectorOpcion`: un Autocomplete que pide 20 opciones y vuelve a buscar en
  el servidor al escribir (300 ms de retardo); lo elegido se pide por id, y si
  ya no vuelve (p. ej. un servicio inactivo de una cita vieja) se enseña con lo
  que trae la cita. Clave por id: dos opciones pueden llamarse igual.
- Formulario de citas: profesional, servicio y producto con `SelectorOpcion`;
  el cliente busca en el servidor y enseña el teléfono para distinguir
  homónimos. Huecos, duración y precios salen de lo pedido por id. Sin
  `inventario: ver` no aparece la sección de productos.
- `recurso.all()` recorre todas las páginas: lo que se pinta entero
  (columnas del calendario, sedes, la lista de profesionales del servicio) ya
  no corta en 200.
- Contrato y `docs/vistas/citas.md` al día.

## Decisiones

- **Listas que se quedan enteras**: el calendario (una columna por
  profesional) y la casilla de profesionales del formulario de Servicios
  necesitan a todos, no buscar uno. Siguen con `all()`, que ahora no corta. Los
  profesionales los limita el plan.
- `GrupoFormDialog` no se toca: Grupos está oculto desde la 1.14.

## Verification

- Backend: 4 pruebas nuevas en `CitasTest` (búsqueda y `solo`, carga por id,
  solo quien atiende, sede principal), que fallan sin el cambio. Agenda,
  catálogo, clientes e inventario: 219/219.
- Panel: `npm run typecheck` en verde.
- En el navegador contra el backend real, con una cuenta de Recepción: escribir
  «bar» busca en el servidor y encuentra al profesional; al elegirlo se pide
  por id y salen sus huecos; ninguna petición `per_page=200`; al editar, lo
  elegido aparece (también un servicio inactivo); dos clientes homónimos se
  distinguen por el teléfono y al elegir uno se rellena el suyo.
