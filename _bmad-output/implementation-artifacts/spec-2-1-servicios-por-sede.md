---
title: 'Story 2.1 — Elegir qué servicios se ofrecen en cada sede'
type: 'feature'
created: '2026-11-03'
status: 'ready-for-dev'
route: 'full'
review: 'thorough'
baseline_commit: 'develop'
---

## Intent

Que cada sede ofrezca solo los servicios que de verdad da: la del centro no
ofrece el tratamiento que solo hay en la principal (PRD FR-21, decisión A-7).
El catálogo sigue siendo **del negocio**; cada sede **habilita** los suyos.

## Estado de partida (2026-11-03)

- No existe `local_servicio`. Las sedes ya tienen su tabla de profesionales
  (`local_profesional`, con `habilitado`), que es el patrón a seguir.
- La pestaña «Servicios» de la sede se quitó del panel porque no tenía efecto
  (comentario en `web/src/features/administracion/nav.ts`).
- Hoy «reservable» se decide en `CitaService::exigirReservable` (1.3) y en el
  filtro de `CitaController::opciones` (1.7/1.10). La sede todavía no pinta
  nada en qué servicios se ofrecen.

## Decisiones

- **Modelo**: tabla de negocio `local_servicio` (`local_id`, `servicio_id`,
  `habilitado` boolean default true, timestamps; único por pareja; cascada al
  borrar la sede). Mismo patrón que `local_profesional`: para sacar un servicio
  de una sede se **apaga**, no se borra la fila.
- **Nadie pierde nada el día del despliegue**: la migración crea una fila
  habilitada por cada sede × servicio existente (incluidos los borrados con
  soft delete, por si se restauran). Archivo nuevo, desplegado con
  `tenants:migrar-provisionados` (AD-14), y sus pruebas de migración en
  `MigrarTenantsTest` (rebobinar y volver a migrar).
- **Lo nuevo nace habilitado**, como los profesionales desde la 1.3: una sede
  nueva habilita todos los servicios vivos; un servicio nuevo (o restaurado) se
  habilita en todas las sedes. El negocio recorta después.
- **Negocio sin sedes** (así nace todo negocio): no se filtra por sede, igual
  que en la 1.7.
- **Precio y duración por sede: no en v1** (FR-21). La tabla deja sitio para
  añadirlos más tarde con una migración nueva; no se exponen ahora.

## Contrato (primero aquí, AD-13)

| Método | Ruta | Payload | Respuesta | Permiso |
|---|---|---|---|---|
| GET | `/locales/{id}/servicios` | `?search&page&per_page` | `{ data: [{ id, nombre, categoria, habilitado }], meta }` — todo el catálogo vivo, con su estado en esta sede | `locales: ver` |
| PUT | `/locales/{id}/servicios/{servicioId}` | `{ habilitado: bool }` | `{ data: { id, nombre, categoria, habilitado } }` | `locales: gestionar` |

- Alcance de sedes: una sede fuera del alcance → **404** (como `/locales/{id}/profesionales`).
- Sin permiso → **403 `codigo: sin_permiso`**.
- Otro negocio → **404**, nunca 403.
- `GET /citas/opciones` → `servicios` solo trae los habilitados en las sedes
  del alcance (cuando se filtra por sede). La comprobación completa de
  «reservable» la unifica la 2.2.

## Plan

**Backend-Sass**
1. Migración de negocio `local_servicio` + relleno.
2. Relaciones `Local::servicios()` / `Servicio::locales()` con el pivote.
3. `LocalService::crear` habilita los servicios vivos; `ServicioService::crear`
   y la restauración habilitan en todas las sedes.
4. `LocalServicioController` (index + update), rutas bajo `puede:locales`,
   alcance de sedes reutilizando `alcanceDeSedes`/`deSusSedes`.
5. `CitaController::opciones`: servicios filtrados también por `local_servicio`.

**Panel**
1. Administración → Locales → nueva sección **«Servicios de cada sede»**: un
   selector de sede y la tabla del catálogo con un interruptor por servicio
   (mismo aspecto que «Quién atiende en cada sede»).
2. Servicio con rama mock; `docs/vistas/locales.md` al día.

## Pruebas (Pest)

- Migración: un negocio existente con sedes y servicios queda con todo habilitado; idempotente.
- Una sede nueva habilita todos los servicios; un servicio nuevo, en todas las sedes.
- PUT apaga y enciende; el GET lo refleja.
- Sin `locales: gestionar` → 403 `sin_permiso`; sede fuera del alcance → 404; otro negocio → 404.
- `/citas/opciones` no ofrece en una sede un servicio deshabilitado allí.

## Fuera de esta historia

- La regla única de reservabilidad (2.2) y el aviso «nadie lo presta» (2.3).
- El catálogo de la tienda pública (épica 6), que usará esta tabla.
