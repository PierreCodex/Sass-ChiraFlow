---
title: 'Story 1.6 — Un permiso propio para los pagos'
type: 'feature'
created: '2026-10-20'
status: 'done'
route: 'full'
review: 'quick'
baseline_commit: 'sandro/develop'
---

## Intent

Declarar `pagos` como módulo de permisos del backend para que el panel pueda
resolver quién consulta o gestiona pagos, aunque sus endpoints lleguen en la
Épica 7.

## Implementation

- `RolesSistema::MODULOS` ahora incluye `pagos`.
- Administrador general y administrador de sede reciben `pagos: gestionar`.
- Profesional recibe `pagos: null`.
- Los negocios existentes reciben el permiso mediante una migración idempotente
  que no pisa roles personalizados (`editado_at` no nulo).
- `GET /api/capacidades` y `GET /api/roles` emiten siempre el módulo.

## Verification

Se ejecutaron con el PHP de Laragon y `pdo_mysql` activo las suites de roles,
capacidades, provisioning y migraciones; también se validaron sintaxis PHP y
`git diff --check`.

Los endpoints de evidencia, aprobación y rechazo de pagos quedan fuera de esta
historia, tal como indica la planificación.
