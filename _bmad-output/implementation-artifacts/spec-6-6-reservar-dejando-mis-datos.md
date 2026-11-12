---
title: 'Story 6.6 — Reservar dejando mis datos'
type: 'feature'
created: '2026-11-12'
status: 'review'
route: 'full'
review: 'thorough'
baseline_commit: 'develop'
---

# Story 6.6 — Reservar dejando mis datos

PRD FR-39, FR-29, regla no negociable 1. El cliente termina la reserva en la
tienda con su nombre, celular y correo, sin crear cuenta.

## Qué había y qué faltaba

| | Antes | Ahora |
|---|---|---|
| Asistente de la tienda | pedía los datos y llamaba a `reservar` | igual, más las dos casillas |
| `POST /publico/{slug}/sucursal/{sede}/reservar` | **no existía** (solo el mock) | creado |
| Consentimientos | WhatsApp solo desde el panel (4.8c) | privacidad obligatoria + WhatsApp opcional |

## Decisiones

- **Un solo motor.** `CitaService::reservarDesdeTienda`, dentro de la misma
  `transaccionDeAgenda` (READ COMMITTED) y con el mismo `exigirHuecoLibre`
  que el panel. Si una de las citas no cabe, no se guarda ninguna ni la ficha.
- **Modos.** `unica`: una cita seguida, con quien preste TODOS los
  servicios; duración y precio suman (con la cantidad). `separada`: una cita
  por servicio, cada una a su hora.
- **«Cualquier profesional».** Atiende el libre con menos citas ese día. Los
  candados de los candidatos se toman a la vez y en orden de id, para que dos
  reservas simultáneas se pongan en fila en vez de bloquearse.
- **Estado.** `pendiente`, `canal = tienda`, sin autor, código de 8. Evento
  `cita.creada` con `actor_tipo = cliente`. No sale el C-4 (solo el del
  panel) ni nada al equipo (4.5, solo citas confirmadas). El correo «Confirma
  tu reserva» (C-11) es la 6.7; mientras tanto el negocio la confirma en el
  panel.
- **La ficha del cliente.** Se busca por teléfono (normalizado a 9 dígitos,
  como el resto del sistema) o se crea. De una existente **no se cambia el
  nombre** (cualquiera puede escribir el teléfono de otro); se completa el
  correo y el documento si faltaban. `clientes.privacidad_aceptada_at`
  (migración nueva) guarda la última aceptación. WhatsApp: marcar la casilla
  da el consentimiento con origen `tienda`; desmarcarla no quita uno anterior.
- **Lo que no se puede reservar** (servicio oculto, nadie lo presta en la
  sede, profesional que no lo hace) → 404 `no_reservable`, sin detalles
  (2.2). La tienda refresca el catálogo.
- **Hora tomada o pasada** → 422 en `hora_inicio` con un mensaje que no
  revela la agenda; la tienda refresca las horas y vuelve al paso de elegir.
- **Validación.** Celular peruano de 9 dígitos que empieza por 9 (se acepta
  `+51`), correo RFC, máximo 10 servicios contando la cantidad, fechas de hoy a
  90 días. Tope de 10 reservas por minuto por IP; el anti-robots es la 6.10.
- **Pago obligatorio.** Todavía no existe la configuración de pago por
  negocio (Épica 7): todo negocio va por el camino sin pago previo. Cuando la
  7 añada la opción, la tienda de un negocio con pago obligatorio deberá
  mostrarse no disponible (criterio de la 6.6, sin degradar a pago en local).
- **Aviso de privacidad.** Texto corto junto a la casilla, con el nombre del
  negocio. La página de privacidad completa es la 9.2.

## Pruebas (backend, `tests/Feature/Publico/ReservarTest.php`, 7)

- Pendiente, `tienda`, sin autor, código, ficha con teléfono normalizado,
  privacidad con fecha, sin WhatsApp; evento del cliente; ningún aviso.
- Cliente que vuelve: misma ficha, nombre intacto, correo completado,
  WhatsApp con origen `tienda`.
- Hora ya tomada: 422 `hora_inicio`, sin cita ni ficha nueva.
- «Cualquiera»: el de menos citas; si solo uno está libre, ese.
- Única (suma 70 min y S/ 55) y separada (dos citas).
- Servicio oculto o profesional que no lo presta: 404 `no_reservable`.
- Sin privacidad, celular raro u hora pasada: 422.

## Depende de

- 2.2, 6.4, 6.5, 4.8c. **Sigue:** 6.7 (C-11 y el vencimiento), 6.8, 6.10.
