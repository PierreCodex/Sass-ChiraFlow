---
title: 'Story 6.8 — Gestionar mi cita desde un enlace seguro (+ la política de la 6.9)'
type: 'feature'
created: '2026-11-12'
status: 'review'
route: 'full'
review: 'thorough'
baseline_commit: 'develop'
---

# Story 6.8 — Gestionar mi cita desde un enlace seguro

PRD FR-69 (A-4, UJ-8) y FR-70. El cliente, sin cuenta, ve, mueve o cancela
**su** cita desde el enlace de sus correos y WhatsApp. Flujo y textos de
WhatsApp aprobados por el usuario el 2026-11-12.

La **política de cambios** (6.9) se adelantó aquí a pedido del usuario: es
configurable desde el principio, con **15 minutos** por defecto.

## Qué hace

- **Página** `{slug}.tivuapp.store/mi-cita/{secreto}`: solo esa cita (fecha,
  hora, sede, servicio, profesional, importe, código y estado). Abrirla no
  cambia nada.
  - **Cambiar fecha u hora:** mismo servicio, profesional y precio; las horas
    libres del profesional (su propio hueco cuenta como libre), confirmadas con
    un botón. Mismo candado y mismo motor que una reserva (`exigirHuecoLibre`,
    `exigirParaPublico`).
  - **Cancelar:** con «¿Cancelar tu cita?».
  - **Fuera de plazo:** solo se ve, con el WhatsApp y el teléfono del negocio.
  - **Cancelada / pasada:** el estado y «Reservar de nuevo».
- **Enlace:** 40 caracteres al azar, en la base solo su sha256
  (`accesos_cita`, migración nueva, AD-14). Sin ids. Caduca 7 días después de
  la cita (con la hora que tenga ahora) y se puede revocar. Caducado o revocado:
  410 con el contacto del negocio y sin datos de la cita.
- **Política** `agenda.cambios_hasta_min`: 15 min, 30 min, 1 h, 2 h, 6 h, 12 h,
  1 día o 2 días antes (Configuración → Agenda). Al panel no le limita.
- **Avisos:**
  - Mover → `cita.modificada` con actor cliente: C-5 al cliente y «Te
    movieron una cita» al profesional (4.5a).
  - Cancelar → C-6 al cliente, «Se liberó tu hueco» al profesional y **C-6D
    «Lucía canceló su cita»** al dueño (correo; nuevo). Solo si estaba
    confirmada.
- **Correos al cliente** (C-3, C-4, C-5, C-8): botón «Gestionar mi cita» y
  «Puedes cambiarla o cancelarla tú mismo hasta 15 minutos antes de la cita».
- **WhatsApp** (aprobados): C-3, C-4 y C-8 terminan en «¡Nos vemos pronto! Si
  te surge algo, cámbiala o cancélala aquí 👉 {enlace}»; C-5 en «¿Esta hora no
  te queda? Elige otra aquí 👉 {enlace}». **CAMBIAR** responde con el enlace y
  el número del negocio; si la cita ya no se puede gestionar, con el contacto
  como antes (`W-CAMBIAR-SIN-ENLACE`).
- «Devolución pendiente» si había pago: no aplica todavía (no hay pagos, Épica 7).

## Pruebas (backend, `tests/Feature/Publico/MiCitaTest.php`, 6)

- Ver: solo esa cita, nada cambia, en la base solo la huella, 40 caracteres.
- 404 desconocido; 410 revocado y caducado (7 días), con el contacto.
- Reprogramar: horas incluyen la suya; 200, evento del cliente, C-5 con el
  botón «Gestionar mi cita» a `/mi-cita/`.
- Hora tomada: 422 `hora_inicio`, la cita no cambia.
- Cancelar: C-6 al cliente, «canceló su cita» al dueño; luego ya no se mueve.
- Fuera de plazo (15 min por defecto; 1 día configurado): solo ver.
- `WhatsappClientesTest`: C-4 con el enlace, CAMBIAR con el enlace y el número.

## Depende de

- 4.5a, 4.8c, 6.6, 6.7. **Sigue:** 6.10 (límites de la puerta pública).
