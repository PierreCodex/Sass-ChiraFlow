---
title: 'Story 2.3 — Un servicio sin quién lo preste se ve venir'
type: 'feature'
created: '2026-11-03'
status: 'done'
route: 'full'
review: 'thorough'
baseline_commit: 'sprint-2/2-2-regla-unica-reservable'
frontend_baseline_commit: '068f0734d6ef4436452e9fd850889d3865f8f8a4'
review_source: 'bmad-code-review'
lenses_ran: ['blind-hunter', 'edge-case-hunter', 'verification-gap', 'intent-alignment']
context:
  - CLAUDE.md
  - AGENTS.md
  - web/AGENTS.md
  - docs/vistas/servicios.md
  - docs/vistas/locales.md
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

## Implementación de pantalla — 2026-11-04

El backend ya está mergeado (Backend-Sass #19). Trabajar únicamente en este
frontend, en `sprint-2/2-3-aviso-en-pantalla`, creada desde `origin/develop`.
Preservar el cambio previo ajeno en `web/next.config.mjs`, sin incluirlo en la PR.

- Añadir los campos del contrato a `web/src/features/servicios/types.ts` y
  `web/src/features/locales/servicios-por-sede.ts`.
- Actualizar mocks con un servicio no reservable y otro reservable que carezca
  de profesional en alguna sede. Deben recalcularse tras guardar para comprobar
  la desaparición del aviso con `NEXT_PUBLIC_USE_MOCKS=true`.
- `ServiciosTable.tsx`: marca discreta con Tooltip cuando no es reservable o
  faltan profesionales en alguna sede.
- `ServicioFormDialog.tsx`: Alert que explique si no se puede reservar y en qué
  sedes falta quién lo preste. No duplicar el aviso para servicios inactivos.
- `ServiciosPorLocal.tsx`: aviso en filas con `sin_quien_lo_preste: true`.
- Textos en español, sin tecnicismos, con indicación de asignar un profesional
  que preste el servicio o habilitarlo en la sede. La API solo aporta datos.
- Invalidar las consultas relacionadas tras guardar servicios, profesionales
  o habilitaciones en sedes para que desaparezcan los avisos sin recargar.
- Mantener Modernize y TIVU_THEME, sin colores hexadecimales nuevos. Antes de
  diseñar, leer los ejemplos de Alert, Chip y Tooltip en
  `D:/PERSONAL_JEAN/mi-modernize-app/mi-modernize-app/packages/typescript/main/src/app/components/ui-components/`.
  Usar los mismos componentes MUI y sus colores de tema.
- Actualizar las fichas de servicios y locales quitando el pendiente del aviso.
- Verificar `npm run typecheck` y comprobar con agent-browser en mocks en el
  puerto 3001 los tres avisos, con capturas; comprobar guardar y casos inactivos.
- El coordinador realiza bmad-code-review, cambia solo la línea de 2.3 a
  `review` en sprint-status.yaml y abre la PR a develop con enlace a esta ficha.
  No mergear.

## Review Triage Log — pantalla

Revisión completa con las cuatro perspectivas de `bmad-code-review`.
No hay decisiones de producto pendientes; se conservan Modernize y el contrato.

| # | Origen | Hallazgo | Veredicto y evidencia | Resolución |
|---|---|---|---|---|
| 1 | blind-hunter | La lista mock de profesionales filtra inactivos/no atienden | medium: `LocalProfesional` exige una fila por profesional; el filtro añadido los oculta | patch: conservar filas; filtrar únicamente al calcular reservabilidad |
| 2 | blind-hunter | Aviso del diálogo ligado a la copia seleccionada | medium: el refetch del catálogo no actualiza la copia guardada en el estado de la página | patch: consultar el detalle para el aviso sin reiniciar los campos |
| 3 | blind-hunter | Orientación incompleta si el profesional está de baja/no atiende | low: asignar o habilitarlo por sede no basta en esos casos contemplados por el contrato | patch: mencionar activo y que atienda |
| 4 | blind-hunter | Sede inactiva no disponible como fixture de pantalla | low, rechazado: el modelo actual de Local no expone activo; ya se comprobó la función con una sede sintética inactiva. Añadir controles o cambiar el contrato excedería el aviso pedido |
| 5 | blind-hunter | El listado recalcula todo el catálogo antes de paginar | low: `alLeerMock` se aplicaba a cada servicio aunque no entrara en la página | patch: transformar solo `data` después de paginar |
| 6 | blind-hunter | Guardado termina antes del refresco | medium: el diálogo podía reabrirse con una copia anterior | patch: cachear la respuesta del PUT, disparar invalidaciones sin esperarlas y avisar/cerrar enseguida; el diálogo lee el detalle actualizado |
| 7 | edge-case-hunter | Desaparición de profesionales inactivos/no atienden | medium: mismo filtro que #1 | patch compartido con #1 |
| 8 | edge-case-hunter | Servicio eliminado durante la latencia mock | low: la búsqueda podía devolver undefined y dejar una habilitación huérfana | patch: validar antes de escribir, con error en español |
| 9 | verification-gap | Sin regresión ejecutable de aviso parcial/inactivo | medium: typecheck no detecta una condición que oculte avisos | patch: recorrido `npm run test:reservabilidad` con aserciones DOM |
| 10 | verification-gap | Sin regresión ejecutable del refresco tras guardar | medium: los tipos no prueban que catálogo y sede lean el nuevo estado | patch compartido con #9, calentando la consulta de sede antes de guardar |
| 11 | intent-alignment | La exclusión de inactivos también se aplica a la tabla | false como defecto: la decisión de esta ficha indica no duplicar el aviso del servicio inactivo; la fila conserva su estado «Inactivo» |
| 12 | intent-alignment | Se ignora la respuesta del PUT | medium: coincide con #6 | patch compartido con #6 |
| 13 | intent-alignment | Cambios en fábricas y mocks además de pantallas | false como defecto: permiten recálculo e invalidaciones compartidas necesarias para el guardado pedido |
| 14 | intent-alignment | El diff revisado no acreditaba navegador/typecheck | low: verificación aún en curso al generar el diff | completado: `npm run typecheck` y `npm run test:reservabilidad` en verde; capturas en `evidencia-2-3/` |
| 15 | intent-alignment | Estado review y PR aún pendientes en el diff | low: pasos finales solicitados por el usuario, posteriores a la revisión | completado: estado `review`; PR abierta a develop, sin merge |
