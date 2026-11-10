---
title: 'Story 6.4 — Los huecos que ve el cliente son los de verdad'
type: 'feature'
created: '2026-11-07'
status: 'done'
route: 'full'
review: 'thorough'
baseline_commit: 'develop'
---

# Story 6.4 — Los huecos que ve el cliente son los de verdad

## Intent

Que la tienda solo ofrezca horas en las que de verdad atienden (PRD FR-38,
FR-27, AD-19): las mismas que el panel, calculadas por el mismo motor, para la
sede, los servicios y —si lo elige— el profesional. Sin profesional elegido,
las horas de cualquiera que pueda atenderle.

## Decisiones

- **El servidor calcula la duración, no el navegador.** El contrato decía
  `?profesional_id&fecha&duracion_min`. Con la duración del cliente cualquiera
  podría pedir huecos de 1 minuto y ver la agenda entera, y además el servidor
  no sabría QUÉ servicio se reserva, así que no podría aplicar la regla única
  (Épica 2). Pasa a ser:

  ```
  GET /publico/{slug}/sucursal/{sede}/horarios
      ?fecha=YYYY-MM-DD&servicios[]=3&servicios[]=3&servicios[]=5[&profesional_id=2]
  → { "data": ["09:00", "10:15", …] }
  ```

  `servicios[]` lleva un id por unidad: la cantidad es la repetición (dos
  cortes = el id dos veces). Varios servicios distintos = **una cita seguida**
  (modo `unica`): la duración es la suma y el profesional tiene que prestarlos
  todos. El modo `separada` pide una lista por línea, con su único servicio.
  La respuesta no cambia de forma.
- **La regla única decide quién puede.** Candidatos = los profesionales que,
  en esa sede, forman par reservable (`Reservabilidad::paresEn`) con **cada**
  servicio pedido, y los servicios además `visible_publico` (el mismo filtro
  que el catálogo de la 6.3). Lo que no está en el catálogo de esa sede, un
  profesional que no puede, una sede cerrada: **404**, sin decir qué falla
  (2.2: desde la tienda no se revela).
- **Mismo motor que el panel**: `Disponibilidad::huecos()` con la duración
  total, la precedencia de cinco niveles, los breaks, las citas tomadas y el
  paso de `configuracion.agenda`. No se reimplementa nada.
- **«Cualquier profesional»** (sin `profesional_id`): la unión ordenada de las
  horas de todos los candidatos. Asignar uno concreto es de la reserva (6.6):
  el payload admite `profesional_id: null`.
- **El pasado no se ofrece.** Hoy se recorta a partir de la hora actual en la
  zona del negocio (`zona_horaria`, o `America/Lima` si no la tiene). Fechas
  pasadas: 422. Hasta **90 días** vista; más allá, 422 (nadie reserva a un año
  y es la forma barata de no regalar la agenda entera a un robot; la 6.10
  pondrá los límites finos).
- **Hora que se ocupa mientras el cliente elige.** El selector vuelve a pedir
  los huecos cada 30 s y al volver a la pestaña. Si la hora elegida ya no está,
  se quita la selección y se dice: «La hora 10:15 ya no está libre. Elige otra.»
  El rechazo al **reservar** (422 en `hora_inicio`) llega con la 6.6, que crea
  el `POST`; el asistente ya pinta ese caso igual.
- **Fecha mínima del navegador en hora local**, no UTC: con `toISOString()` a
  partir de las 19:00 de Lima ya era «mañana».

## Plan

Backend (`backend-sass`, rama `sprint-3/6-4-huecos-publicos`):

1. `HorariosPublicos` (servicio): valida catálogo y candidatos, suma la
   duración, une los huecos y recorta el pasado.
2. `HorariosController` + `HorariosPublicosRequest` (422 en español) + ruta
   en `routes/publico.php`, en el grupo `throttle:tienda`.

Frontend (`Sass-ChiraFlow`, misma rama):

1. Contrato (`api-contract.md` §4 y §5) y ficha `tienda-publica.md`.
2. `publicoApi.horarios` con `servicios` y `profesional_id` opcional; el mock
   hace la misma unión.
3. `SelectorHueco`: opción «Cualquier profesional», refresco cada 30 s y aviso
   de hora perdida. `ReservaPayload.profesional_id` admite `null`.
4. Comprobar en el navegador, también a ancho de móvil.

## Pruebas

- **Caso dorado** (`vistas/citas.md`, Lic. Rosa Paredes): la tienda devuelve
  exactamente las 9 horas de 45 min y las 27 de 15 min, y son las mismas que
  `Disponibilidad::huecosReservables` (lo que valida el `POST` del panel).
- Varios servicios: la duración es la suma; repetir el id cuenta como cantidad.
- Cualquier profesional: unión de dos agendas distintas, sin duplicados.
- Profesional que no presta uno de los servicios, servicio oculto o no
  habilitado en la sede, sede cerrada, servicio de otra sede: 404.
- Hoy recorta las horas pasadas en la zona del negocio; fecha pasada y fecha a
  más de 90 días: 422 en español.
- Dos negocios: con el slug de uno no se consultan servicios del otro (NFR1).

## Depende de

- 2.2 (`Reservabilidad`), 6.3 (`CatalogoDeSede`, `visible_publico`), 6.2
  (`SlugDeSede`).
