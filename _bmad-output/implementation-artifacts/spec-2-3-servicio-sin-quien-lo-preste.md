---
title: 'Story 2.3 — Un servicio sin quién lo preste se ve venir'
type: 'feature'
created: '2026-11-03'
status: 'in-progress'
route: 'full'
review: 'thorough'
baseline_commit: 'sprint-2/2-2-regla-unica-reservable'
---

## Intent

Que el panel avise cuando un servicio está habilitado en una sede pero nadie
puede prestarlo allí (PRD FR-21), para que el dueño no lo descubra porque un
cliente no encuentra hueco.

## Criterios (epics.md)

1. Servicio habilitado en una sede sin ningún profesional que lo preste allí →
   al abrir el servicio o la sede, aviso claro de que no es reservable y por qué.
2. Ese servicio no aparece en el catálogo de la tienda para esa sede (épica 6:
   ya lo garantiza `Reservabilidad::restringirServicios` de la 2.2).
3. Al asignar un profesional que lo preste y guardar, el aviso desaparece y el
   servicio es reservable sin ningún paso extra.

## Reparto

- **Claude — el dato en la API** (esta ficha, Backend-Sass):
  - `Servicio.reservabilidad = { reservable, sedes_sin_quien_lo_preste: [{id, nombre}] }`
    en `index`, `show`, `POST` y `PUT` de `/servicios`.
  - `LocalServicio.sin_quien_lo_preste: bool` en `GET /locales/{id}/servicios`.
  - Contrato: `docs/api-contract.md` → «Servicio» y «LocalServicio».
- **Codex — el aviso en pantalla** (Sass-ChiraFlow):
  - Tipos y mocks de `Servicio` y `LocalServicio` con los campos nuevos.
  - Aviso en el formulario/tabla de servicios (`ServicioFormDialog`,
    `ServiciosTable`) y en «Servicios de cada sede» (`ServiciosPorLocal`).
  - Textos y colores los pone el frontend (convención de la API).

## Decisiones

- **Se calcula con la regla de la 2.2**, no con una copia: las sedes sin
  quién lo preste son las habilitadas y activas donde
  `Reservabilidad` no encuentra ninguna terna. Así el aviso dice exactamente
  lo que el guardado rechazaría.
- **En lote**: la lista de servicios resuelve el dato de toda la página con
  dos consultas, no una por fila.
- **Datos, no frases**: la API devuelve qué sedes; el «por qué» lo redacta el
  panel («nadie que lo preste atiende en Sur»).
- Servicio **inactivo**: `reservable: false` y lista vacía. Su aviso ya existe
  (el switch de activo); repetirlo en cada sede sería ruido.
- Sede **inactiva**: no sale en la lista ni marca `sin_quien_lo_preste`; no se
  reserva nada en ella por otro motivo.
- Negocio **sin sedes**: lista vacía; `reservable` dice si alguien lo presta.

## Pruebas (Pest)

- Servicio habilitado en una sede sin profesional que lo preste allí → sale en
  `sedes_sin_quien_lo_preste` y la fila de la sede marca `sin_quien_lo_preste`.
- Asignar un profesional (por `PUT /servicios` con `empleado_ids`) → el aviso
  desaparece en la respuesta y en la siguiente lectura.
- Profesional que lo presta pero deshabilitado en la sede, de baja o que no
  atiende → sigue habiendo aviso.
- Servicio apagado en la sede → no sale (no se ofrece ahí, no hay nada que avisar).
- Servicio inactivo y sede inactiva → sin aviso.
- Sin sedes: `reservable` según si alguien lo presta.
- Coherencia: `sedes_sin_quien_lo_preste` es exactamente el complemento de lo
  que `Reservabilidad::evaluar` aprueba, sede por sede.

## Depende de

- **2.1** (`local_servicio`) y **2.2** (`Reservabilidad`). La rama sale de la
  de la 2.2 mientras su PR esté abierta.
