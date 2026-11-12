---
title: 'Story 6.7 — Confirmar la reserva desde el correo'
type: 'feature'
created: '2026-11-12'
status: 'review'
route: 'full'
review: 'thorough'
baseline_commit: 'sprint-4/6-6-reservar-dejando-mis-datos'
---

# Story 6.7 — Confirmar la reserva desde el correo

PRD FR-84, propuesta §4.3 (C-11, C-12). Las reservas de la tienda sin pago en
línea se confirman desde el correo del cliente; si no, el hueco se libera solo.
Textos y flujo aprobados por el usuario el 2026-11-12, con las horas en
formato «11:30 am».

## Flujo

1. Reserva en la tienda (6.6) → `pendiente` con `confirmar_hasta`. La pantalla
   final dice «Revisa tu correo para confirmar tu reserva» y la hora límite.
2. **C-11 «Confirma tu reserva»** (solo correo, esencial): botón «Confirmar mi
   reserva», «tu horario está separado hasta las 10:45 am».
3. El enlace abre `{slug}.tivuapp.store/reserva/{codigo}?f={firma}`; la página
   confirma sola al abrirse:
   - dentro del plazo → `confirmada`: al cliente la C-3 (y WhatsApp si aceptó),
     al profesional y al dueño su primer «Nueva cita» (4.5a);
   - ya confirmada → «Tu reserva ya está confirmada» (no cambia nada);
   - vencida → «Tu reserva expiró» con «Reservar de nuevo».
4. Al vencer sin confirmar, una tarea de la agenda central (AD-9) la cancela
   con el mismo candado y manda **C-12** «Tu reserva se liberó». Al equipo,
   nada: nunca se le avisó.

## Plazos (decididos el 2026-09-19)

- `agenda.plazo_confirmacion_min`: 30 por defecto, de 15 a 120, en
  Configuración → Agenda.
- `confirmar_hasta = min(ahora + plazo, inicio − 15 min)`.
- La tienda no ofrece horas que empiecen antes de `ahora + plazo + 15 min`, y
  la reserva lo vuelve a comprobar.

## Decisiones

- **Enlace sin guardar secretos:** la firma es un HMAC de la app sobre negocio,
  cita y código. No hay token en la base que filtrar.
- **Eventos propios:** confirmar desde el correo anota `cita.modificada`
  (estado pendiente → confirmada, actor cliente), así salen los avisos de la
  4.5a sin código nuevo. Vencer anota `cita.vencida` (actor sistema), que solo
  dispara la C-12: ni C-6 al cliente ni «Se liberó tu hueco» al equipo.
- Quedan fuera (pendientes del PRD): reenviar el correo y corregir un correo
  mal escrito.
- **El actor de los avisos** (arreglo encontrado aquí): `Contexto` solo
  excluye al actor si es una cuenta del negocio (`actor_tipo = usuario`). Un
  cliente con el mismo id que la cuenta del dueño lo dejaba sin su aviso.
- Las citas de una reserva «separada» comparten `reserva_codigo` (el de la
  primera): un solo correo, un solo plazo (el más corto) y un solo enlace.

## Pruebas (backend, `tests/Feature/Publico/ConfirmarReservaTest.php`, 7)

- Reservar: `confirmar_hasta`, tarea `vencer_reserva` en UTC, C-11 con el
  enlace firmado y «10:30 am»; nada al equipo.
- Confirmar: C-3 al cliente y «Nueva cita» al dueño; repetir → `ya_confirmada`
  sin evento nuevo.
- Firma ajena o código inexistente: 404 y la cita sigue pendiente.
- Vencer con `tareas:ejecutar`: cancelada, `cita.vencida`, C-12 con «Reservar
  de nuevo» a la sede, nada al equipo, la hora vuelve a ofrecerse; el enlace
  tarde dice `expirada`.
- Enlace vencido antes de la tarea: se vence ahí; la tarea queda descartada.
- Hora sin tiempo para confirmar: 422. Plazo de 60 min del negocio.
- `HorariosPublicosTest`: hoy solo se ofrece desde «ahora + 45 min».
