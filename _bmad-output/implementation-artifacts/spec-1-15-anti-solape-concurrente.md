---
title: 'Story 1.15 — El anti-solape aguanta dos reservas a la vez'
type: 'feature'
created: '2026-11-03'
status: 'in-review'
route: 'full'
review: 'thorough'
baseline_commit: 'develop'
---

## Intent

Que dos personas no puedan quedarse el mismo hueco del mismo profesional en el
mismo instante (regla no negociable 1, F-06). Una cita y un 422 de conflicto,
nunca dos citas ni un error de servidor.

## Lo que se encontró

La prueba de concurrencia nueva, con dos procesos PHP reales contra MySQL,
destapó **dos** fallos distintos en `CitaService::exigirHuecoLibre`:

1. **Deadlock (500).** El candado era un `SELECT … FOR UPDATE` sobre el rango de
   citas del día. Con el día vacío, las dos transacciones toman a la vez el
   candado del hueco (los gap locks de InnoDB no se excluyen entre sí) y al
   insertar cada una espera a la otra: `1213 Deadlock found`. La API respondía
   500 en vez de «esa hora ya no está disponible».
2. **Doble reserva.** Solo con serializar no basta: con `REPEATABLE READ`, las
   lecturas normales de la transacción ven la foto de su primera lectura,
   anterior a que la otra reserva confirmase. `Disponibilidad::huecos()` leía
   esa foto y daba el hueco por libre: dos citas en la misma franja.

## Implementation (Backend-Sass)

- `exigirHuecoLibre`, en tres pasos:
  1. `SELECT … FOR UPDATE` sobre **la fila del profesional** (por `DB::table`,
     sin scopes). Es exclusivo: la segunda reserva del mismo profesional espera
     a que la primera confirme; profesionales distintos no se estorban.
  2. Comprobación del choque con **una lectura con candado**, que ve lo último
     confirmado: citas del profesional no canceladas que se solapan con
     `[inicio, inicio + duración)`, excluyendo la propia al editar.
  3. `Disponibilidad::huecos()` para el horario (jornada, descansos).
- La hora pedida no se ofrece como libre en el mensaje del 422.
- Se quitó el candado por rango del día.

## Verification

- `tests/Concurrencia/AntiSolapeConcurrenteTest.php` + `reservar.php`: dos
  procesos piden la misma franja y salen a la vez; 8 franjas por ejecución.
  Exige exactamente un `ok` y un `422`, y una sola cita en la base.
  - Sin el arreglo: deadlock en la primera franja.
  - Solo con el paso 1: `ok | ok`, dos citas.
  - Con el arreglo: verde en 3 ejecuciones seguidas (24 carreras).
- Suite nueva `Concurrencia` en `phpunit.xml`, **sin RefreshDatabase** (su
  transacción no la ven otros procesos): confirma sus datos y los borra.
  Documentada en el propio archivo para que no se borre por lenta.
