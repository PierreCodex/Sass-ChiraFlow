---
title: 'Story 1.8 — El alcance por sedes también en los profesionales'
type: 'feature'
created: '2026-10-20'
status: 'in-review'
route: 'full'
review: 'quick'
baseline_commit: 'sandro/develop'
---

## Intent

Hacer que el alcance de sedes del administrador de sede también limite el
listado, la ficha y las altas de profesionales.

## Implementation

- `GET /profesionales` solo filtra cuando la cuenta tiene sedes explícitas;
  el administrador general conserva la visión completa.
- Un profesional solo aparece si está habilitado en una sede dentro del
  alcance.
- La ficha fuera del alcance responde 404.
- Las altas de un administrador de sede solo se habilitan en sus sedes.
- Se mantiene el aislamiento entre negocios y los permisos de gestión.

## Verification

Las pruebas nuevas cubren listado/ficha por sede, altas acotadas, mutaciones
fuera de alcance y pivotes deshabilitados. La suite de profesionales y locales
se ejecutó con PHP de Laragon y `pdo_mysql` activo.

### Review Findings

- [x] [Review][Patch] No enlazar sedes inactivas en nuevas altas
  [Backend-Sass/app/Services/ProfesionalService.php:62] — corregido y cubierto.
- [x] [Review][Patch] Probar update/delete fuera del alcance y pivotes
  deshabilitados [Backend-Sass/tests/Feature/Profesionales/ProfesionalesTest.php]
  — corregido y cubierto.

#### Rejected

- El hallazgo sobre paginación pertenecía a los cambios de Story 1.7 incluidos
  en el contrato compartido, no a Story 1.8.
