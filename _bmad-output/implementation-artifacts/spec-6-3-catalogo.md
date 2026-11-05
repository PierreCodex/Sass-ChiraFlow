---
title: 'Story 6.3 — El catálogo que ve el cliente'
type: 'feature'
created: '2026-11-05'
status: 'in-progress'
route: 'full'
review: 'thorough'
baseline_commit: 'develop'
---

# Story 6.3 — El catálogo que ve el cliente

## Intent

Que quien abre la tienda de una sede vea qué servicios ofrece, con su precio y
su duración, agrupados por categoría, para elegir sin llamar por teléfono
(PRD FR-37). Solo lo que de verdad se puede reservar en esa sede.

## Decisiones

- **Una sola regla.** El catálogo sale de `Reservabilidad` (Épica 2): las
  combinaciones servicio + profesional que la regla aprueba **en esa sede**.
  Encima, un filtro propio de la tienda: `visible_publico`. Un servicio oculto,
  inactivo, borrado, no habilitado en la sede o sin nadie que lo preste ahí no
  sale. Nueva cara de la regla, `Reservabilidad::paresEn($localId)`, con su
  prueba de coherencia contra `evaluar()` en la matriz de la 2.2.
- **Profesionales**: los que tienen al menos un servicio del catálogo en esa
  sede. Nombre = `nombre_publico` de la pivote si lo tiene; `perfil` de la
  pivote.
- **Cambio de contrato (solo añade):** `ProfesionalPublico.servicios: number[]`,
  los ids de los servicios del catálogo que presta **en esa sede**. Lo
  necesitan la 6.4 («cualquier profesional» = los que lo prestan) y la 6.5
  (elegir quién atiende cada servicio). En esta historia el asistente ya lo usa
  para no ofrecer a quien no presta el servicio.
- **Categorías**: por `orden` y nombre; los servicios por nombre. Sin categoría
  —o con la categoría desactivada: desactivarla no es una regla de
  reservabilidad, y el panel sigue agendando esos servicios— van al final en
  «Otros servicios» (`id: null`). Las categorías vacías no salen.
- **Precio**: el del servicio. El `precio_override` por profesional no tiene
  pantalla todavía (§4 del plan) y no se muestra.
- **Fotos: apagadas hasta la 5.2.** Las URLs de imagen llevan hoy el id interno
  del negocio (añadido en la revisión de la 6.1). `imagen_principal: null`,
  `galeria: []` y `foto_url: null` hasta que la 5.2 las pase a claves opacas.
  La interfaz ya pinta el caso sin foto.
- **Nada interno**: ni costes, ni comisiones, ni `activo`, ni `tipo`. Las
  claves de cada objeto se comprueban exactas.
- Reseñas siguen en `null`/`[]`: no existen en el backend.

## Plan

Backend (`backend-sass`, rama `sprint-3/6-3-catalogo`):

1. `Reservabilidad::paresEn(int $localId)`: pares `(servicio_id, profesional_id)`
   reservables en esa sede, con la misma subconsulta `ternas()`.
2. `CatalogoDeSede` (servicio): arma `categorias` y `profesionales` en tres
   consultas, sin N+1.
3. `SedeController` lo usa.

Frontend (`Sass-ChiraFlow`, misma rama):

1. Contrato y ficha `tienda-publica.md`.
2. `ProfesionalPublico.servicios` en tipos y mocks.
3. El asistente ofrece por servicio solo a quien lo presta; en «única», solo a
   quien presta todos.
4. Comprobar en el navegador, también a ancho de móvil (NFR7).

## Pruebas

- Coherencia: `paresEn` = lo que `evaluar()` aprueba, sede por sede, en la
  matriz de la 2.2.
- Catálogo: oculto, inactivo, borrado, no habilitado en la sede, sin nadie que
  lo preste, profesional que no atiende o deshabilitado en la sede → no sale.
- Agrupado y ordenado; «Otros servicios» al final; categoría desactivada.
- `nombre_publico` y `perfil` de la pivote; `servicios` por profesional.
- Claves exactas (nada interno); fotos en `null`.
- Dos negocios: el catálogo de uno no trae nada del otro (NFR1).

## Depende de

- 2.2 (`Reservabilidad`), 2.1 (`local_servicio`), 6.2 (`SedeController`).
- 5.2 para encender las fotos.
