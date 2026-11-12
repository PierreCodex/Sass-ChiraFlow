---
title: 'Story 4.5a — Cada aviso de la cita llega a quien le toca'
type: 'feature'
created: '2026-11-11'
status: 'review'
route: 'full'
review: 'thorough'
baseline_commit: 'develop'
---

# Story 4.5a — Cada aviso de la cita llega a quien le toca

Primera parte de la Story 4.5 (FR-74, propuesta §4.3, flujos de
`tivu-flujos-de-avisos.pdf`). El diseño lo aprobó el equipo el 2026-11-11
sobre el mockup del lienzo «tivu · Avisos de la cita (4.5a)».

| Parte | Qué |
|---|---|
| **4.5a** (esta) | Los avisos de una cita del panel: confirmar, cambiar de hora, cancelar, cambiar de profesional; al cliente y al equipo |
| 4.5b | Plantillas y destinatarios de lo que aún no tiene disparador (tienda C-1/C-11/C-12, pagos P-*, suscripción S-*, cuenta K-3/K-4, equipo E-2/E-3, agenda del día C-10), cuando sus historias los conecten |

## Quién recibe qué

| Cuando la cita… | Cliente | Profesional | Dueño |
|---|---|---|---|
| Se agenda confirmada | C-4 (ya existía) | C-2P «Nueva cita para ti» | C-2 «Nueva cita» |
| Se confirma después | **C-3** «Está confirmada» | C-2P | C-2 |
| Cambia de hora | **C-5** | C-5P «Te movieron una cita» | — (4.6) |
| Se cancela | **C-6** | C-6P «Se liberó tu hueco» | — (4.6) |
| Cambia de profesional | **C-7** (solo correo) | Anterior: C-7P «Ya no atiendes a…» · nuevo: C-2P | — |

## Decisiones

- **Un evento, varios avisos.** `cita.modificada` lleva sus `cambios` (estado,
  fecha, hora, empleado…) y cada aviso decide si el cambio es suyo
  (`Avisos\Citas\Contexto`).
  - Confirmar y cancelar mandan sobre lo demás: si en la misma edición la cita
    se confirma y se mueve, sale la C-3 con la hora nueva y no la C-5.
  - Si se mueve y cambia de profesional, el nuevo recibe «Nueva cita para ti»
    y no «Te movieron».
- **Cliente:** correo siempre. WhatsApp solo si aceptó y la cita está
  confirmada:
  - C-5 de una pendiente sale solo por correo;
  - C-6 de una cita que nunca se confirmó, también solo por correo.
- **Equipo, solo de citas confirmadas.** Mientras está pendiente, silencio.
- **Lo que hace uno mismo no le llega.** El actor del evento (`actor_id`, su
  cuenta en el negocio) se compara con la cuenta del profesional y con la del
  dueño.
- **Profesional:** su cuenta del panel (`profesionales.usuario_id`), con su
  WhatsApp activado (4.8b). Sin cuenta, no recibe nada y no falla.
- **Dueño:** la cuenta con el rol `admin_general`. Recibe las citas nuevas;
  los cambios y cancelaciones, cuando los active con la 4.6.
- **Nada de citas pasadas.** Una cita registrada después de su hora no avisa a
  nadie (arregla lo visto en la prueba del 11/11: «Te agendaron una cita» de
  una cita de esa misma mañana). Al enviar se vuelve a comprobar que no ha
  empezado.
- **Correos:**
  - al cliente, con la marca del negocio (plantilla de la 4.2); C-3 dice
    cuánto pagará en el local y nunca que está pagada;
  - al equipo, hablan como **tivu**, con el botón «Ver en el panel» y
    «Agendada por…».
- **WhatsApp al equipo**, desde el número del equipo, con los textos
  aprobados: C-2P, C-2, C-5P, C-6P, C-7P en `config/whatsapp.php`.
- `CitaService::actualizar` anota `profesional_anterior_id` cuando cambia de
  profesional, para el aviso al anterior.

## Pruebas (backend, `tests/Feature/Avisos/AvisosDeCitaTest.php`, 9)

- Agendar confirmada: C-4, C-2P a Carlos (texto exacto) y C-2 al dueño.
- Si agenda el dueño, a él no le llega.
- Pendiente → nada al equipo; al confirmarse, C-3 (con «Pagas en el local»),
  C-2P y C-2.
- Mover: C-5 con la hora tachada y C-5P.
- Cancelar: C-6 y C-6P. Si nunca se confirmó: solo el correo al cliente.
- Cambio de profesional: C-7 por correo, C-7P al anterior y C-2P al nuevo.
- Cita pasada: nada. Profesional sin cuenta: nada y sin error.

## Depende de

- 4.1, 4.2, 4.4, 4.8.
- **Siguen:**
  - 4.6: el dueño elige recibir cambios y cancelaciones, «Mis avisos», nota
    del negocio;
  - 4.5b;
  - 6.8: «Gestionar mi cita» en los correos.
