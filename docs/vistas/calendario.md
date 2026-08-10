# Calendario

**Ruta:** `/calendario`
**Estado:** ✅ Validado contra la app actual (captura del 09/08/2026)
**Archivos:**
- `web/src/app/(dashboard)/calendario/page.tsx`
- `web/src/features/calendario/`

---

## Qué muestra

Agenda del día con **una columna por profesional** y las citas posicionadas
según su hora. Dos vistas: Calendario y Lista.

### Barra superior

| Elemento | Qué hace |
|---|---|
| `‹` / `›` | Día anterior / siguiente |
| Selector de fecha | Salta a cualquier día |
| Todos los profesionales | Filtra a un solo profesional |
| Calendario / Lista | Cambia de vista |
| Nueva cita | Abre el formulario de Citas |

Debajo, la cabecera del día: **"lunes, 10 de agosto de 2026"** y el contador
de citas a la derecha.

### Vista Calendario

Rejilla en franjas de 30 minutos. Cada columna es un profesional, con su
avatar, nombre y **su horario de ese día** en la cabecera.

Los bloques muestran **cliente / servicio / hora**, y se pintan con el **color
del servicio**. Las citas canceladas o con "no asistió" salen atenuadas y
tachadas.

- Clic en un bloque → abre esa cita en el formulario de edición.
- Clic en un hueco libre → abre el formulario de nueva cita.

Al abrir, el calendario hace scroll hasta la primera cita del día en vez de
quedarse en las 07:00.

### Vista Lista

Las citas del día ordenadas por hora: franja horaria, cliente, servicio ·
profesional, monto y estado. Clic en una fila abre la cita.

### Estados de la UI

| Estado | Qué se muestra |
|---|---|
| Cargando | Skeleton de 520px |
| Sin citas (Lista) | "No hay citas para este día." |
| Sin profesionales | "No hay profesionales activos para mostrar." |
| Error | Alert rojo |

---

## Implementación

Usa **`react-big-calendar`**, la misma librería que el calendario de la
plantilla Modernize (`apps/calendar`), con su hoja `Calendar.css` copiada tal
cual y el contenedor `BlankCard` + `CardContent` que usa la plantilla.

La diferencia con el calendario de la plantilla: aquí se usa
`view="day"` con **recursos** (`resources`), que es lo que produce la columna
por profesional. La plantilla usa vista de mes sin recursos.

Los ajustes propios de esta vista están separados en
`features/calendario/components/calendario.css`, para que `Calendar.css` quede
intacto y se pueda actualizar desde el repo de referencia:

- Oculta `.rbc-event-label` (la hora ya va dentro del bloque).
- Oculta `.rbc-allday-cell` (no hay citas de día completo).
- Sube la altura de franja a 58px, para que quepan las 3 líneas.
- Neutraliza `.rbc-today`: en vista de día todas las columnas son el mismo día,
  así que el tinte azul de "hoy" pintaba la rejilla entera.
- Reglas de modo oscuro (ver abajo).

### Modo oscuro

El CSS de react-big-calendar contempla **solo modo claro**. Sin corregirlo, en
oscuro la columna de horas queda blanca, la rejilla clara y el texto de los
bloques ilegible.

No se puede arreglar con `sx`: `AppRouterCacheProvider` usa
`enableCssLayer: true`, así que los estilos de MUI viven en `@layer mui`,
mientras que las hojas importadas van **sin capa**. El CSS sin capa gana
siempre, independientemente de la especificidad.

La solución sigue la convención que ya trae `Calendar.css`: una clase
**`.darkbg`** en el contenedor, que aplica `CalendarioCitas.tsx` según
`theme.palette.mode`. En `calendario.css` están las reglas que faltaban para la
vista de día:

| Qué | Regla |
|---|---|
| Fondos de rejilla, cabecera y columna de horas | `background-color: transparent` |
| Bordes | `#343e54`, el mismo que usa la plantilla |
| Horas y cabeceras | `rgba(255,255,255,.6)` |
| Barra de scroll de la rejilla | `color-scheme: dark` |

Los bloques de cita no necesitan regla: su color se aplica con
`eventPropGetter` como estilo en línea (que gana a todo), y al volverse
transparente el fondo de la rejilla, el tinte del servicio queda oscuro y el
texto claro se lee bien.

Los colores no usan las clases de la plantilla (`event-green`, `event-red`…)
porque el color sale del servicio y es un hex arbitrario elegido por el
usuario: se aplica con `eventPropGetter`, que es el mismo punto de extensión
que usa la plantilla.

### Disponibilidad de cada profesional

`web/src/features/calendario/disponibilidad.ts`

El calendario **respeta el horario semanal de cada empleado** (ver
[empleados.md](empleados.md)). No es un rango fijo igual para todos.

**Rango visible.** Sale de las jornadas de los profesionales de ese día: la
hora de inicio más temprana y la de fin más tardía, con media hora de aire.
Si alguna cita cae fuera de ese rango, el rango se amplía para incluirla —
si no, una cita agendada fuera de horario quedaría cortada o invisible.

**Franjas atenuadas.** Vía `slotPropGetter`, que recibe `(fecha, resourceId)`
y permite decidir columna por columna. Se atenúa cuando el profesional:

- está fuera de su horario del día,
- está en un break,
- no trabaja ese día de la semana,
- tiene una excepción con `disponible: false`.

**Cabecera de columna.** Muestra el horario (`09:00 – 18:00`) o, si no atiende,
el motivo en rojo: la nota de la excepción (*"Permiso por emergencia
familiar"*) o "No atiende hoy". El avatar se atenúa también.

**Prioridad.** Una excepción con `disponible: false` gana sobre el horario
semanal: deja el día entero sin atención aunque el horario diga que trabaja.

**Sin horario conocido** — la columna "Sin asignar", o un profesional que no
está en la lista de activos — no se atenúa nada: no hay información que
mostrar y teñir todo sería engañoso.

**No se puede agendar fuera de horario.** El clic en una franja atenuada no
hace nada y el cursor es `not-allowed`. Los horarios ya están definidos en la
ficha del empleado, así que ese hueco simplemente no existe — ni desde la
vista pública ni desde el panel.

**Sí se muestran las citas que caigan ahí.** Si por datos heredados o por un
cambio de horario posterior una cita queda en zona atenuada, se ve igual
encima. Ocultarla sería peor: nadie se enteraría del conflicto.

### Leyenda

Debajo de la rejilla, `LeyendaCalendario.tsx` explica los tres fondos:
disponible, fuera de horario o descanso (rayado), y cita agendada.

### Clic en un hueco libre

Abre el formulario de nueva cita **con la fecha, la hora y el profesional de
esa celda ya rellenados** (prop `preseleccion` de `CitaFormDialog`).

### Profesionales sin columna

Si una cita está asignada a alguien que no aparece en la lista de
profesionales activos (por ejemplo, uno dado de baja), se le crea igualmente su
columna. Sin esto, react-big-calendar **descarta el evento en silencio** y la
cita desaparece de la agenda sin avisar.

Lo mismo con las citas sin profesional: van a una columna "Sin asignar".

---

## Endpoints

### `GET /api/citas?fecha=2026-08-10`

Todas las citas de un día, **sin paginar**.

```json
{
  "data": [
    {
      "id": 108,
      "fecha": "2026-08-10",
      "hora_inicio": "12:00",
      "hora_fin": "13:00",
      "estado": "pendiente",
      "monto": 65,
      "cliente_nombre": "sandro david",
      "servicio": {
        "id": 2,
        "nombre": "ATENCION DEL MEDICO",
        "duracion_min": 60,
        "precio": 45,
        "color": "#763EBD"
      },
      "empleado": { "id": 3, "nombre": "Dr. Julio Mendoza" }
    }
  ]
}
```

Misma forma que el índice de [citas.md](citas.md). El campo **`servicio.color`**
es imprescindible aquí: es lo que pinta cada bloque.

### `GET /api/empleados`

Para las columnas. Se filtran los de `rol: "profesional"` y `activo: true`.

---

## Diferencias con la app actual

| Elemento | En tu app | Aquí |
|---|---|---|
| Rango horario | Arranca en 09:00 | Sale del horario de los profesionales del día |
| Disponibilidad | No se aprecia en la captura | Franjas atenuadas fuera de jornada y en breaks |
| Bloques | Cliente / servicio / hora | Igual |
| Cabecera de columna | Avatar + nombre | Avatar + nombre + horario del día |
| Filtro | Select de profesionales | Igual |
| Vista Lista | Botón presente (no vi el contenido) | Lista por hora con monto y estado |

---

## Pendiente

- [ ] **Ver la vista "Lista" real** — la maqueté a mi criterio
- [ ] ¿Debe **impedirse** agendar en una franja no disponible, o solo avisar?
      Hoy solo se señala visualmente
- [ ] ¿Los locales tienen su propio horario de atención que también limite la
      rejilla? (ver [locales.md](locales.md))
- [ ] ¿Se puede arrastrar una cita para reprogramarla? Requiere el addon
      `react-big-calendar/lib/addons/dragAndDrop`
- [ ] ¿Hay vista de semana o de mes, o solo día?
- [ ] Al hacer clic en un hueco, ¿debería precargar la hora y el profesional de
      esa celda? Hoy abre el formulario vacío
