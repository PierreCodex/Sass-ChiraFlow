---
title: 'Story 6.2 — Cada sede tiene su propio enlace'
type: 'feature'
created: '2026-11-04'
status: 'done'
route: 'full'
review: 'thorough'
baseline_commit: 'develop'
---

## Intent

Que cada sede tenga su enlace, `pepito.tivuapp.store/balta`, para que quien
viene del cartel de una sede no tenga que elegirla a mano (PRD FR-81, FR-36).

## Decisiones

- **Slug de sede** (`locales.slug`, base del negocio): se deriva del **nombre
  al crear la sede** (`Str::slug`). Renombrarla **no** lo cambia —el enlace ya
  repartido no se mueve sin que el dueño lo decida, igual que el del negocio
  en la 6.1—; se cambia **a mano** con `slug` en `PUT /locales/{id}` (cambio de
  contrato aprobado el 2026-09-19). Único **dentro del negocio**, contando el
  historial de las demás sedes. Formato: minúsculas, números y guiones, 1–63,
  sin guion al principio ni al final ni dos seguidos.
- **Historial** (`local_slugs`, base del negocio): el slug vigente y los
  anteriores. Un slug que tuvo una sede no lo toma otra nunca; el antiguo
  redirige para siempre al vigente. `nullOnDelete`, como el de los negocios.
- **Reservados de sede**: `sucursal` (la ruta antigua por id) y `cita` (la
  página de la cita, Story 6.8). Un nombre que dé uno de ellos lleva sufijo.
- **`GET /publico/{negocio}/sucursal/{sede}`**: `{sede}` es el slug vigente,
  uno antiguo o —en transición— el id numérico. Responde la sede con
  `local.slug` **vigente**; si no coincide con lo pedido, la página redirige
  con 301. Sede inexistente, inactiva o borrada → el **mismo 404** de la 6.1.
  El catálogo (`categorias`, `profesionales`) es de la **6.3**: aquí sale
  vacío y `resenas: null`.
- **Direcciones**: `pepito.tivuapp.store/balta` y `/reservar/pepito/balta`. La
  ruta antigua `/reservar/pepito/sucursal/3` redirige con 301 a la de slug.
- **Preseleccionada y se puede cambiar**: la página de la sede ofrece «Cambiar
  de sede» cuando el negocio tiene más de una; si el carrito tiene algo, avisa
  antes de que cambiar vacíe la selección.
- **Panel**: `Local.slug` sale en la API y se acepta al editar, para enseñar,
  copiar y cambiar el enlace de cada sede (la pantalla de sedes: Codex).

## Plan

**Backend (Backend-Sass)**
1. Migración de negocio: `locales.slug` + `local_slugs`, y relleno de las sedes
   existentes (derivar, sin chocar, y anotar).
2. `SlugDeSede`: derivar, validar y anotar; `Local` lo deriva al crear y lo
   anota al cambiar; `LocalRequest` acepta `slug` al editar.
3. `LocalResource` y `LocalPublicoResource` con `slug`.
4. `GET /publico/{slug}/sucursal/{sede}` con la resolución de arriba.

**Frontend**
5. Contrato y fichas.
6. Ruta `/reservar/[slug]/[sede]` (la página de la sede) con su `layout.tsx`
   de servidor: 404 real y 301 al slug vigente conservando el resto.
7. `/reservar/[slug]/sucursal/[localId]` pasa a redirigir a la ruta con slug.
8. El selector y la redirección de sede única usan `local.slug`.
9. «Cambiar de sede» con aviso si hay algo en el carrito.

## Pruebas

**Pest**
- Crear una sede le da su slug; dos con el mismo nombre → `-2`.
- Renombrar NO cambia el slug; cambiarlo con `PUT` sí, y el antiguo resuelve a
  la sede con el vigente. 422 en `slug` por formato, reservado u ocupado.
- Un slug antiguo de una sede no lo toma otra al renombrarse.
- `sucursal` y `cita` nunca son slug de sede.
- `/publico/{negocio}/sucursal/{sede}`: por slug, por slug antiguo y por id →
  200 con el vigente; inexistente, inactiva, borrada o de otro negocio → 404
  idéntico al de la 6.1.
- `LocalPublico` y `Local` traen `slug`.
- Migración de datos: sedes existentes sin slug quedan con uno único y en el
  historial; repetible.

**Navegador**: `/reservar/{n}/{sede}`, el 301 desde la ruta con id y desde un
slug antiguo, el selector y «Cambiar de sede» con el aviso.

## Depende de

- 6.1 (zona pública, `ResolverNegocioPublico`, layout de la tienda).
