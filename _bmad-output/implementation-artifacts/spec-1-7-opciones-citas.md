---
title: 'Story 1.7 — Quien puede agendar, puede abrir el formulario'
type: 'feature'
created: '2026-10-20'
status: 'in-review'
route: 'full'
review: 'quick'
baseline_commit: 'sandro/develop'
---

## Intent

Dar al formulario de citas un endpoint de opciones propio, autorizado por
`citas: gestionar`, sin abrir los índices de gestión de profesionales,
servicios, locales, inventario o configuración.

## Implementation

- Se documentó primero `GET /citas/opciones` en `docs/api-contract.md`.
- Devuelve profesionales, servicios, locales y agenda con proyecciones mínimas.
- Recorta profesionales y locales por alcance y `solo_propios`.
- Incluye productos solo con `inventario: ver` y clientes solo con
  `clientes: ver`.
- Los índices de gestión conservan sus middlewares originales.

## Verification

Con PHP de Laragon y `pdo_mysql` activo pasaron los tres criterios nuevos:
acceso con solo citas, recorte por `solo_propios`, y 403 para el endpoint de
profesionales y para cuentas sin permiso de citas.

### Review Findings

- [x] [Review][Decision] Definir paginación de las opciones — profesionales,
  servicios, sedes y productos se cargan completos; clientes se limita a 50 sin
  `meta`. Resuelto: cada colección devuelve `{data, meta}` y acepta
  `per_page` con máximo 50.
- [x] [Review][Patch] Filtrar servicios a combinaciones reservables
  [Backend-Sass/app/Http/Controllers/CitaController.php:63] — actualmente se
  incluían servicios activos sin profesional asociado, que luego fallaban al
  crear la cita.
- [x] [Review][Patch] Cubrir ramas de productos, clientes y búsqueda
  [Backend-Sass/tests/Feature/Agenda/CitasTest.php:572] — faltan pruebas con
  `inventario: ver`, `clientes: ver` y `?search=`; ahora están cubiertas.
- [x] [Review][Patch] Cubrir alcance, inactivos y valores de agenda
  [Backend-Sass/tests/Feature/Agenda/CitasTest.php:572] — faltan pruebas de
  sedes fuera de alcance, profesionales deshabilitados, servicios inactivos,
  `modo_intervalo`, `intervalo_min` y zona horaria; la cobertura quedó añadida.
