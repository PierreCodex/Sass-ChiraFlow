# Citas

**Ruta:** `/citas`
**Estado:** ✅ Formulario validado contra la app actual · ⚠️ **columnas de la tabla aún supuestas**
**Archivos:**
- `web/src/app/(dashboard)/citas/page.tsx`
- `web/src/features/citas/`

> Solo he visto el **formulario** de tu app, no el listado. Las columnas de la
> tabla las elegí yo a partir de los campos del formulario.

---

## Formulario

`web/src/features/citas/components/CitaFormDialog.tsx`

### Campos, en el orden de la app actual

| # | Campo | Control | Obligatorio |
|---|---|---|---|
| 1 | Profesional | Select | **Sí** |
| 2 | Servicio | Select con precio en la etiqueta | Sí |
| 3 | Fecha | `input[type=date]` | Sí |
| 4 | Hora inicio | `input[type=time]` | Sí |
| 5 | Cliente | Autocomplete de texto libre | Sí |
| 6 | Teléfono | Texto | No |
| 7 | Email | Email | No |
| 8 | Monto | Número con prefijo `S/` | Sí |
| 9 | Estado | Select | Sí |
| 10 | Notas | Textarea | No |
| 11 | Productos comprados | Filas repetibles | No |

Botones: **Guardar** al crear, **Actualizar** al editar, y **Cancelar**.

### Comportamientos

**El servicio rellena el monto.** Al elegir un servicio, `monto` toma su
precio, pero **queda editable**. En tu captura el servicio cuesta S/ 45.00 y la
cita tiene S/ 65.00 — el monto es un valor propio de la cita, no una copia
inmutable del precio.

**No hay hora fin.** Solo se pide la de inicio; el fin sale de la duración del
servicio. `hora_fin` lo calcula el backend.

**La hora se elige de una lista de huecos, no se escribe.** Ver abajo.

**El cliente es texto libre.** Ver abajo.

**Productos comprados.** Filas de producto + cantidad, con "+ Agregar
producto" y una X para quitar. Salen del catálogo de Inventario.

### El campo Hora inicio

`web/src/features/citas/components/SelectorHuecos.tsx`

En tu app es un `input[type=time]` libre, que permite escribir cualquier hora
—incluida una fuera del horario del profesional. Aquí es una **lista de chips
con los huecos disponibles**.

Los huecos los calcula `features/calendario/disponibilidad.ts` a partir de:

1. La jornada del profesional ese día (ver [empleados.md](empleados.md)).
2. Menos sus breaks.
3. Menos las citas que ya tiene (las canceladas no ocupan).
4. Solo los inicios donde **cabe entera** la duración del servicio.

### De dónde sale el intervalo

El horario del profesional es solo el contenedor (inicio – fin + breaks). La
**duración vive en el servicio**, y la configura el dueño en el formulario de
[Servicios](servicios.md). Los dos se cruzan aquí.

Cada cuánto se ofrece un inicio lo decide el dueño en Configuración
(`features/configuracion`):

| Modo | Qué hace | Cuándo conviene |
|---|---|---|
| `duracion_servicio` *(por defecto)* | Encadena con la duración del servicio: 09:00, 09:45, 10:30… | Agenda compacta, sin huecos que nadie puede reservar |
| `fijo` | Rejilla cada N minutos, sin importar el servicio | Más opciones para el cliente, a costa de fragmentar |

**Además de la rejilla, siempre se ofrecen los bordes**: el instante en que
termina cada cita y cada break. Sin eso, un servicio cuya duración no encaje
con la rejilla deja huecos muertos — una cita de 50 min desde las 09:00
termina a las 09:50 y la rejilla no volvería a ofrecer nada hasta las 10:00.

Ejemplo real (Lic. Rosa Paredes, 09:00–18:00, break 13:00–14:00, con dos citas):

| Servicio | Huecos |
|---|---|
| Hemograma (15 min) | 27 opciones, de 09:00 a 17:45 |
| Limpieza dental (45 min) | 9 opciones: 09:00, **10:15**, 10:30, 11:15, 12:00, **15:30**, 15:45, 16:30, 17:15 |

Las dos en negrita son bordes: **10:15** y **15:30** es justo cuando Rosa se
libera de una cita. La rejilla por sí sola no las habría ofrecido.

| Situación | Qué se muestra |
|---|---|
| Sin profesional elegido | "Elige un profesional para ver sus horarios disponibles." |
| No trabaja ese día | La nota de la excepción, o "X no atiende este día." |
| Agenda llena | "X tiene la agenda llena este día." |
| Con huecos | Chips de hora + "Cada cita ocupa N min." |

Al **editar**, la hora que ya tenía la cita sigue siendo elegible aunque su
propio hueco figure como ocupado.

> **Por qué así.** Validar después de escribir obliga a mostrar un error; con
> la lista, el estado inválido no es alcanzable. Es el mismo criterio de la
> vista pública de reservas: el cliente solo ve lo que está libre.

**Para el backend:** aunque el formulario lo impida, la validación debe
repetirse en Laravel. Un 422 con la clave `hora_inicio` se pinta bajo el
selector.

### El campo Cliente

En tu app es un input de texto suelto, con teléfono y email al lado. Eso
permite agendar a alguien que no está registrado.

Aquí usé un **Autocomplete de texto libre**: sugiere clientes ya registrados
y, al elegir uno, **rellena solo el teléfono y el email**; pero puedes escribir
un nombre que no existe y guardarlo igual. No pierde la capacidad original y
evita duplicar clientes por escribir el nombre distinto.

Por eso el payload lleva `cliente_id`:

- **Con `cliente_id`** → se eligió de la lista.
- **Con `cliente_id: null`** → se escribió a mano. Aquí el backend decide: crear
  un cliente nuevo, buscarlo por teléfono, o dejar la cita sin vincular.

**Esta es la decisión más importante que necesito de ti** (ver Pendiente).

---

## Endpoints

### `GET /api/citas`

Parámetros: `page`, `per_page`, `search` (nombre y teléfono del cliente)

```json
{
  "data": [
    {
      "id": 108,
      "fecha": "2026-08-10",
      "hora_inicio": "20:00",
      "hora_fin": "21:00",
      "estado": "pendiente",
      "monto": 65,
      "notas": "quiero lo urgente",
      "cliente_id": 5,
      "cliente_nombre": "sandro david",
      "cliente_telefono": "902 743 580",
      "cliente_email": "englobor@gmail.com",
      "servicio": {
        "id": 2,
        "nombre": "ATENCION DEL MEDICO",
        "duracion_min": 60,
        "precio": 45
      },
      "empleado": { "id": 3, "nombre": "Dr. Julio Mendoza" },
      "productos": [
        {
          "producto_id": 6,
          "nombre": "Crema hidratante facial",
          "cantidad": 1,
          "precio_unitario": 65
        }
      ]
    }
  ],
  "meta": { "current_page": 1, "per_page": 10, "total": 17, "last_page": 2 }
}
```

### `POST /api/citas` · `PUT /api/citas/{id}`

JSON normal (no sube archivos).

```json
{
  "empleado_id": 3,
  "servicio_id": 2,
  "fecha": "2026-08-10",
  "hora_inicio": "20:00",
  "cliente_id": 5,
  "cliente_nombre": "sandro david",
  "cliente_telefono": "902 743 580",
  "cliente_email": "englobor@gmail.com",
  "monto": 65,
  "estado": "pendiente",
  "notas": "quiero lo urgente",
  "productos": [{ "id": 6, "cantidad": 1 }]
}
```

`hora_fin` no se envía: lo calcula el backend como
`hora_inicio + servicio.duracion_min`.

### `DELETE /api/citas/{id}`

---

## Campos

| Campo | Tipo | Confirmado | Notas |
|---|---|---|---|
| `fecha` | date `Y-m-d` | ✅ | |
| `hora_inicio` | `HH:mm` | ✅ | |
| `hora_fin` | `HH:mm` | ✅ | Calculado, solo lectura |
| `estado` | enum | ✅ | Visto "Pendiente"; el resto siguen supuestos |
| `monto` | decimal | ✅ | Editable, independiente del precio del servicio |
| `notas` | string \| null | ✅ | |
| `cliente_id` | int \| null | ⚠️ | Ver "El campo Cliente" |
| `cliente_nombre` | string | ✅ | Texto libre |
| `cliente_telefono` | string \| null | ✅ | |
| `cliente_email` | string \| null | ✅ | |
| `servicio` | objeto | ✅ | Con `duracion_min` y `precio` |
| `empleado` | objeto | ✅ | **Obligatorio**: `citas.user_id` no es nullable |
| `productos` | array | ✅ | Puede venir vacío |

### Estados de la cita

`web/src/features/citas/constants.ts` — única fuente de verdad, también la usa
el dashboard.

Verificado contra el enum real de la tabla `citas`:

| Valor | Etiqueta | Color |
|---|---|---|
| `pendiente` | Pendiente | warning |
| `confirmada` | Confirmada | info |
| `completada` | Completada | success |
| `cancelada` | Cancelada | error |

Antes tenía `atendida` (es **`completada`**) y me había inventado
**`no_asistio`**, que no existe.

### Descartado respecto a la maqueta anterior

- `precio` → ahora se llama **`monto`**, y es editable.
- **`local`**: el formulario no tiene selector de sede. O es un solo local, o
  se deduce del profesional. Pendiente.
- `cliente` como objeto anidado → ahora son campos planos, más `cliente_id`.

---

## Tabla (columnas elegidas por mí)

| Columna | Contenido |
|---|---|
| Fecha y hora | Fecha + `hora_inicio – hora_fin` |
| Cliente | Nombre + teléfono |
| Servicio | Nombre + "+N productos" si tiene |
| Atiende | Empleado, o "Sin asignar" |
| Monto | `S/ 0.00` |
| Estado | Chip de color |
| Acciones | Editar y eliminar |

Filtro por estado arriba a la derecha. **Hoy filtra en cliente**; con el
backend pasa a ser un query param.

---

## Pendiente

- [ ] **Ver el listado real de Citas** para confirmar columnas y filtros
- [ ] **Lista completa de estados** del select
- [ ] Maquetar el ajuste de intervalo en **Configuración** (hoy el valor existe
      pero no tiene pantalla: se lee de `features/configuracion/mocks.ts`)
- [ ] ¿Hace falta un **margen entre citas** (buffer) para limpiar o preparar?
- [ ] ¿La duración puede variar por profesional? Hoy es del servicio y punto
- [ ] Con "Sin asignar" no hay horario que consultar y no se ofrecen huecos.
      ¿Debería ser obligatorio elegir profesional?
- [ ] **¿Qué hace el backend cuando el cliente se escribe a mano?**
      ¿Crea uno nuevo? ¿Lo busca por teléfono? ¿Deja la cita sin vincular?
      De esto depende que `total_citas` de Clientes cuadre.
- [ ] ¿La cita se asigna a un local? (existe `citas.local_id` en el backend)

### Verificado contra el backend

El Blade de editar cita manda `productos[i][id]` y `productos[i][cantidad]`,
así que la clave de cada línea es **`id`**, no `producto_id`.

Existen la tabla `cita_servicio` (varios servicios por cita) y las columnas
`cliente_apellido` / `cliente_documento`, pero **el panel no las usa**: su
formulario envía un solo `servicio_id` y no pide apellido ni documento. Son
para la página pública de reservas.

La columna `citas.fuente` (`web` · `panel` · `publica`) registra de dónde vino
cada reserva. Todavía no se muestra en ninguna vista.
- [ ] ¿Se valida que el profesional esté disponible según su horario? (ver
      [empleados.md](empleados.md))
- [ ] ¿Los productos descuentan stock al guardar la cita, o al cobrarla en Caja?
- [ ] ¿El monto incluye los productos, o van aparte?
