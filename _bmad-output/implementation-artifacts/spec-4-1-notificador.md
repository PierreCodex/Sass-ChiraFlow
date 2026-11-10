---
title: 'Story 4.1 — Un solo camino para avisar, con registro de lo enviado'
type: 'feature'
created: '2026-11-07'
status: 'done'
route: 'full'
review: 'thorough'
baseline_commit: 'develop'
---

# Story 4.1 — Un solo camino para avisar, con registro de lo enviado

## Intent

Que cada aviso quede registrado y no se envíe dos veces, para poder comprobar
si un cliente recibió su confirmación en vez de suponerlo (AD-8, PRD FR-73,
NFR8). Es la base de la épica 4 y lo que desbloquea la reserva pública
(6.6/6.7).

## Qué entra en la 4.1 y qué no

| Pieza | Historia |
|---|---|
| `notificacion_envios` (negocio y central), `Notificador` único, clave de idempotencia, envío **después** del commit, reintentos con espera creciente, `fallido` sin romper la acción, aislamiento | **4.1** |
| Plantilla común con logo y color del negocio, versión de texto | 4.2 |
| Webhook de Resend (`entregado`, rebote, queja) e índice central proveedor → negocio | 4.3 |
| Recordatorios programados (`envios_programados`) | 4.4 |
| Destinatarios por rol y sede | 4.5 |
| Activar o desactivar avisos por negocio | 4.6 |

## Decisiones

- **El enganche es el evento, no el service.** `EventoDominio::booted()`
  registra un `afterCommit` en la conexión del evento: cuando la transacción
  que lo anotó se confirma, el `Notificador` lo procesa. Si se deshace, el
  callback se descarta. Así ningún service llama a `Mail` (AD-8) y todo
  evento futuro pasa por aquí sin tocar su service.
- **`config/avisos.php`** dice qué avisos dispara cada tipo de evento. Cada
  aviso implementa `App\Avisos\Aviso`: plantilla, destinatarios, si sigue
  aplicando y el correo.
- **Clave de idempotencia**: plantilla + entidad + destinatario + versión de
  la entidad (o el id del evento si no tiene versión). Única en la tabla. El
  segundo intento queda como fila `duplicado`, sin clave y con
  `duplicado_de_id`, y no se envía.
- **Estados**: los de la propuesta §4.2 (`pendiente`, `encolado`, `aceptado`,
  `entregado`, `rebotado`, `queja`, `fallido`, `omitido`, `cancelado`) más
  `duplicado`. `motivo` explica los omitidos: `sin_correo`,
  `avisos_a_clientes_apagados`, `ya_no_aplica`.
- **Trabajo `EnviarNotificacion`**: relee la fila y pregunta al aviso si sigue
  aplicando (la cita pudo cancelarse). 4 intentos con espera de 1, 5 y 15
  min. Un 4xx del proveedor (salvo 429) no se reintenta. Agotado, `fallido`.
  El correo **no** implementa `ShouldQueue`: ya va en cola.
- **Un fallo nunca rompe la acción**: el `Notificador` atrapa cualquier error
  al despachar (con la cola síncrona el trabajo corre ahí mismo) y lo deja en
  la fila.
- **Primer aviso real: C-4**, cita agendada desde el panel → cliente. Texto
  provisional; la plantilla es la 4.2.
- **Avisos a clientes apagados en producción** (`TIVU_AVISOS_CLIENTES=false`
  por defecto) hasta la 4.2: se registran como `omitido`
  (`avisos_a_clientes_apagados`), así se ve qué habría salido sin escribir a
  clientes reales con un texto provisional.
- **Panel de plataforma**: `Notificador::enviosDe($negocio)` pagina los envíos
  de un negocio en su base. La pantalla es de la épica 8.
- **Central**: `eventos_dominio` y `notificacion_envios` también en la base
  central (suscripción, cuenta). Ningún evento central se anota todavía; los
  correos de cuenta (K-1, K-2) se migran a este camino más adelante.

## Pruebas (`tests/Feature/Avisos/NotificadorTest.php`)

- Agendar desde el panel: evento, fila `aceptado` y correo al cliente.
- Operación deshecha: ni evento, ni fila, ni correo.
- El mismo evento dos veces: un envío y un `duplicado`.
- Sin correo / avisos apagados: `omitido` con su motivo, sin correo.
- Cita cancelada antes de enviar: `omitido` por `ya_no_aplica`.
- Espera creciente (60/300/900) y 4 intentos; fallo temporal → `fallido` con
  el error y la cita intacta; 4xx → `fallido` al primer intento.
- Dos negocios: los envíos de uno no se ven desde el otro (NFR1).

## Depende de

- 1.13 (`eventos_dominio` en cada negocio).
