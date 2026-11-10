---
title: 'Story 6.5 — Elegir y revisar antes de dar mis datos'
type: 'feature'
created: '2026-11-07'
status: 'review'
route: 'full'
review: 'thorough'
baseline_commit: 'sprint-3/6-4-huecos-publicos'
---

# Story 6.5 — Elegir y revisar antes de dar mis datos

## Intent

Que el cliente elija uno o varios servicios y sepa en todo momento cuánto dura
y cuánto cuesta, antes de escribir su nombre (PRD FR-39, FR-30). Si el negocio
cambia algo mientras elige, se le dice. **No escribe nada en la base**: es
selección y cálculo, solo frontend.

## Qué ya estaba y qué faltaba

| Criterio | Antes | Ahora |
|---|---|---|
| Duración e importe total a la vista | barra inferior | también en el paso de elegir hora («Duración · Total») |
| Vaciar la selección | `vaciar()` sin botón | botón **Vaciar** en la barra |
| Huecos según única o separada | hecho en la 6.4 (`servicios[]` por cita o por línea) | — |
| Servicio que deja de ser reservable | no se detectaba | se quita, se avisa y se explica |
| Selección vacía | la barra desaparece | además, el asistente se cierra si se vacía |

## Decisiones

- **Refresco del catálogo**: `useTienda` pasa de 10 min de caché a 1 min, con
  refresco cada minuto y al volver a la pestaña. Además, un **404** de
  `/horarios` (`no_reservable`) refresca el catálogo en el momento.
- **Sincronizar la selección** (`useCarrito.sincronizar`): lo que ya no está
  en el catálogo sale; lo que cambió de precio o duración se pone al día. Si
  nada cambió, las líneas no se tocan (el asistente se reinicia cuando cambian).
- **El aviso explica sin revelar** (2.2): «Quitamos «Barba» de tu selección:
  ya no se puede reservar en esta sede (el negocio lo retiró o no tiene quién
  lo atienda).» y ««Corte» cambió de precio o de duración; el total ya está al
  día.» Sale encima del catálogo y dentro del asistente si está abierto.
- **Profesional que deja de poder atender**: el asistente le quita la
  elección (no pide horas imposibles); el selector muestra «Esto ya no se
  puede reservar con quien elegiste».
- Las horas de `/horarios` no se reintentan ante un 404: no lo arregla.

## Verificado en el navegador

Con un Laravel falso local detrás del BFF (página → BFF → «Laravel»):

- Corte + Barba (50 min, S/ 45) en cita única con Ana; el negocio retira Barba
  y sube el corte a S/ 30 → dentro del asistente sale el aviso de los dos
  cambios y el total pasa a «30 minutos · S/ 30.00».
- Retirar el único servicio elegido → el asistente se cierra, la barra
  desaparece y el aviso queda en la página (47 s, por el refresco de 1 min).
- «Vaciar» oculta la barra.

## Depende de

- 6.4 (`/horarios` con `servicios[]`, 404 `no_reservable`).
