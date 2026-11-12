---
title: 'Story 4.4 — Los recordatorios salen a su hora y se reprograman solos'
type: 'feature'
created: '2026-11-11'
status: 'review'
route: 'full'
review: 'thorough'
baseline_commit: 'develop'
---

# Story 4.4 — Los recordatorios salen a su hora y se reprograman solos

AD-9 (agenda central de tareas con hora), AD-16 (UTC para lo programado),
FR-74, matriz C-8/C-9. Solo backend: no cambia el contrato.

## Decisiones

- **`tareas_programadas`** (central), en UTC y **sin datos personales**:
  - qué la identifica: negocio, tipo, entidad, id y `clave` única por negocio;
  - cuándo: `ejecutar_en`;
  - `version`: la hora de la cita al programarse;
  - `estado`: `pendiente → encolada → ejecutando → hecha`, o bien
    `anulada`, `descartada` o `fallida`, con su `motivo`.
- **Cuántos los decide el plan** (`planes.recordatorios`, nunca el nombre):

  | Plan | Recordatorios |
  |---|---|
  | Básico | 24 h, solo correo |
  | Premium y prueba | 24 h y 2 h, correo y WhatsApp |
  | Pro | 24 h y 2 h; el tercero, a la hora que elija el negocio, llega con la **4.6** |

- **Se programan después del commit.** Cuando una cita se crea, cambia o se
  borra (`EventoDominio::CAMBIAN_LA_CITA`), el trabajo `SincronizarRecordatorios`
  (con reintentos) pone la agenda al día:
  - **cita confirmada y futura** → una tarea por recordatorio, a «inicio −
    N horas» en UTC;
  - **cualquier otro caso** (pendiente, cancelada, borrada) → anula las
    pendientes;
  - reprogramar mueve las tareas, y un recordatorio que ya no corresponde se
    anula, así que no quedan huérfanos.
- **Un recordatorio cuya hora ya pasó no se programa**, para no enviar tarde.
- **`tareas:ejecutar`** corre cada minuto (`routes/console.php`; en producción
  lo corre el contenedor `scheduler` con `schedule:work`):
  - pasa las vencidas de `pendiente` a `encolada` de forma atómica y encola
    `EjecutarTarea`;
  - nunca recorre las bases de los negocios.
- **`EjecutarTarea` vuelve a comprobar antes de actuar:**
  - la cita existe, está confirmada y su hora es la de `version`;
  - no ha empezado;
  - la tarea no llega más de **30 min tarde** (si el programador estuvo caído,
    no sale un «mañana» a destiempo).

  Si todo cuadra, anota `cita.recordatorio` y el `Notificador` hace el resto:
  correo siempre, WhatsApp con su consentimiento, cupo y horario.
- **C-8** (12 h o más; «*mañana* tienes tu cita») y **C-9** (menos de 12 h;
  «en *2 horas*»):
  - van por correo (`RecordatorioCitaMail`) y por WhatsApp desde el número de
    clientes, con la sede en el mapa;
  - en **Básico**, el WhatsApp queda `omitido` (`plan_sin_recordatorio_whatsapp`);
  - con el **cupo** agotado queda `omitido` (`cupo_agotado`, desde la 4.8a).
- **El WhatsApp respeta el horario del negocio.** El de 2 h de una cita
  temprana espera a la apertura. Si para entonces la cita ya empezó, no sale
  (`sigueAplicando`).
- Los textos de WhatsApp son los aprobados el 2026-11-11, con dos datos nuevos:
  - `{cuando}` («mañana», «hoy», «el jueves 12 de noviembre»);
  - `{en_cuanto}` («2 horas», «1 hora»).
- **`tareas:programar-recordatorios [negocio]`** programa las citas
  confirmadas que ya existían. Es idempotente.

## Pruebas (backend, `tests/Feature/Avisos/RecordatoriosTest.php`, 14)

- **Programar:** UTC correcto (24 h y 2 h); Básico con uno y solo por correo;
  pendiente → nada, al confirmarse sí; reprogramar mueve; cancelar o borrar
  anula; una hora ya pasada no se programa.
- **Ejecutar:** C-8 por correo y WhatsApp a su hora, y una sola vez; C-9; el de
  2 h de una cita temprana espera la apertura; en Básico solo correo; una tarea
  vieja (cita movida por fuera) se descarta; llegar tarde descarta.
- **Comando:** el de citas existentes es idempotente.

## Para producción

1. Desplegar (las migraciones corren solas).
2. Una vez: `php artisan tareas:programar-recordatorios`, para las citas
   confirmadas que ya existían.
3. Comprobar que el contenedor `scheduler` corre: sin él no sale ningún
   recordatorio.

## Depende de

- 4.1 (`Notificador`), 4.2 (plantilla de correo), 4.8 (WhatsApp).
- **Siguen:**
  - 4.6: el tercer recordatorio de Pro, apagar recordatorios, «darme de baja»
    desde el correo;
  - 6.8: «Gestionar mi cita» en el recordatorio.
