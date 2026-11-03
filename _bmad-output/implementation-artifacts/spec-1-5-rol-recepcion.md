---
title: 'Story 1.5 — Un rol de Recepción listo para usar'
type: 'feature'
created: '2026-10-20'
status: 'done'
route: 'full'
route_source: 'auto'
review: 'quick'
review_source: 'auto'
lenses_ran: []
baseline_commit: 'sandro/develop'
context:
  - 'D:/PERSONAL_JEAN/Sass-ChiraFlow/_bmad-output/implementation-artifacts/epic-1-context.md'
  - 'D:/PERSONAL_JEAN/Backend-Sass/AGENTS.md'
---

<frozen-after-approval reason="historia asignada a Sandro">

## Intent

**Problem:** Un negocio recién provisionado recibe solo tres roles de sistema. Para contratar recepción, el dueño tiene que inventar permisos y puede conceder acceso de más.

**Approach:** Añadir un cuarto preset de sistema, Recepción, con citas y clientes en gestionar, pagos en gestionar cuando exista el módulo, y sin configuración ni facturación. Sembrarlo en negocios nuevos y mediante una migración idempotente en negocios ya provisionados, sin modificar roles personalizados.

## Boundaries & Constraints

**Always:** Los roles de sistema no se borran; la matriz sale de `RolesSistema`; migraciones de tenant nuevas, nunca editar las existentes; texto visible en español y `admin_local` se presenta como «Administrador de sede».

**Never:** No tocar roles personalizados ni sus permisos; no crear endpoints de pagos; no cambiar la autorización de usuarios ni el alcance por sedes.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|-----------------------------|----------------|
| Nuevo negocio | Provisionamiento | Cuatro roles de sistema, incluido Recepción | Reejecución no duplica |
| Negocio existente | Migración | Inserta Recepción y conserva roles propios | Idempotente |
| Rol personalizado | `editado_at` no nulo | No cambia | Sin error |

</frozen-after-approval>

## Code Map

- `Backend-Sass/app/Support/RolesSistema.php` — presets y módulos de roles.
- `Backend-Sass/app/Jobs/ProvisionTenantDatabase.php` — siembra de presets en negocios nuevos.
- `Backend-Sass/database/migrations/tenant/` — migración de datos para negocios existentes.
- `Backend-Sass/tests/Feature/ProvisioningTest.php` y `tests/Feature/Roles/RolesTest.php` — expectativas actuales de tres roles.
- `D:/PERSONAL_JEAN/Sass-ChiraFlow/_bmad-output/planning-artifacts/epics.md` — criterios de aceptación de Story 1.5.

## Tasks & Acceptance

**Execution:**
- [x] Actualizar preset y siembra de Recepción.
- [x] Añadir migración tenant idempotente que inserte solo el rol ausente.
- [x] Ajustar y ampliar pruebas de provisioning, roles y migración.

**Acceptance Criteria:**
- Given un negocio nuevo, when lista roles, then existen cuatro roles de sistema y Recepción no es borrable.
- Given el preset Recepción, when se consultan sus permisos, then permite citas y clientes en gestionar, pagos en gestionar cuando esté declarado, y no configuración ni facturación.
- Given un negocio existente, when corre la migración, then aparece Recepción y los roles personalizados permanecen iguales.
- Given cualquier salida visible, when aparece `admin_local`, then se muestra «Administrador de sede».

## Implementation Notes

- `pagos` aún no está en `RolesSistema::MODULOS`; se dejará el preset preparado para que Story 1.6 complete su exposición sin fabricar endpoints.

## Verification

**Commands:**
- `php artisan test --filter=ProvisioningTest`
- `php artisan test --filter=RolesTest`
- `php artisan test --filter=MigrarTenantsTest`

Las pruebas se ejecutaron con el PHP de Laragon (`php-8.3.33`) y `pdo_mysql`
activo. Pasaron `MigrarTenantsTest`, `ProvisioningTest` y `RolesTest` (32 tests
en la última suite, incluyendo los casos de colisión); también se validaron
sintaxis PHP y `git diff --check`.

## Review Triage Log

- Revisión rápida: corregidas las colisiones con nombres únicos y el rollback
  de una Recepción personalizada.
- Pendiente de integrar `pagos` en `RolesSistema::MODULOS` dentro de Story 1.6;
  esta historia deja el permiso preparado sin crear endpoints.
