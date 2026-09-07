# Citas

**Ruta:** `/citas`
**Estado:** ✅ **Conectada al backend** (2026-09-06)
**Archivos:**
- `web/src/app/(dashboard)/citas/page.tsx`
- `web/src/features/citas/`

> Las columnas de la tabla las elegí a partir de los campos del formulario: del
> listado de la app anterior nunca vi una captura.

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

1. La jornada del profesional ese día (ver [profesionales.md](profesionales.md)).
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

### El caso dorado

Este ejemplo es ahora un **test en los dos repos**, así que conviene que esté
escrito entero. Lic. Rosa Paredes, jornada **09:00–18:00**, break
**13:00–14:00**, y **dos citas ya tomadas**:

| Cita | Franja |
|---|---|
| 1 | **10:00 – 10:15** |
| 2 | **14:30 – 15:30** |

Con eso, y el modo `duracion_servicio`:

| Servicio | Huecos |
|---|---|
| Hemograma (15 min) | 27 opciones, de 09:00 a 17:45 |
| Limpieza dental (45 min) | 9 opciones: 09:00, **10:15**, 10:30, 11:15, 12:00, **15:30**, 15:45, 16:30, 17:15 |

Las dos en negrita son bordes: **10:15** y **15:30** es justo cuando Rosa se
libera de una cita. La rejilla por sí sola no las habría ofrecido.

> **Las dos citas faltaban en esta ficha** hasta el 2026-09-06. El backend las
> reconstruyó desde los dos listados —son las únicas que producen a la vez los
> 27 y los 9— y se anotan aquí porque sin ellas el ejemplo no lo puede volver a
> comprobar nadie.

### La misma regla, escrita dos veces

`disponibilidad.ts` calcula estos huecos para pintar el selector, y
`App\Services\Disponibilidad` los recalcula en el backend para validar el
`POST`. **Son dos copias de una regla.** Mientras las dos existan tienen que dar
lo mismo, o el selector ofrecerá horas que el backend rechaza con un 422.

**Tocar `disponibilidad.ts` obliga a avisar al backend**, y al revés.

Dos matices que la especificación no cerraba y que cerró el backend:

- **`no_asistio` no libera su hueco**; solo `cancelada`. El profesional estuvo
  esperando igual, y liberarlo reescribiría el pasado.
- **Una excepción disponible no arrastra los breaks del día habitual**: es un
  turno distinto y sus descansos habrían sido otros.

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

Parámetros: `page`, `per_page`, `search` (nombre, **apellido** o teléfono del
cliente), `fecha`, `estado`.

```json
{
  "data": [
    {
      "id": 108,
      "codigo": "C-108-4F2A",
      "fecha": "2026-08-10",
      "hora_inicio": "20:00",
      "hora_fin": "21:00",
      "estado": "pendiente",
      "monto": 45,
      "monto_total": 110,
      "notas": "quiero lo urgente",
      "cliente_id": 5,
      "cliente_nombre": "sandro david",
      "cliente_telefono": "902 743 580",
      "cliente_email": "englobor@gmail.com",
      "servicios": [
        {
          "id": 2,
          "nombre": "ATENCION DEL MEDICO",
          "duracion_min": 60,
          "precio": 45,
          "cantidad": 1,
          "color": "#4f46e5"
        }
      ],
      "servicio": { "…": "la primera línea de servicios, como puente" },
      "empleado": { "id": 3, "nombre": "Dr. Julio Mendoza" },
      "local_id": 1,
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
  "local_id": 1,
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

`hora_fin` **no se acepta**: la calcula el backend como
`hora_inicio + servicio.duracion_min`. Aceptarla dejaría reservar 20 minutos de
un servicio de 60.

Se manda **un** `servicio_id` y el backend inserta una línea. El array
`servicios[]` es de lectura: lo llenará la tienda pública en el Sprint 5.

**`local_id` es opcional**: con una sola sede lo pone el backend (la principal).
El formulario solo enseña el selector cuando hay más de una.

#### El 422 de `hora_inicio` dice dos cosas distintas

| Mensaje | Qué hacer |
|---|---|
| «esa hora ya no está disponible, libres: …» | elegir otra de la lista |
| «ese profesional no tiene horas libres ese día» | **cambiar de día o de profesional** |

El segundo no se arregla eligiendo otra hora, así que no se pintan igual.

### `DELETE /api/citas/{id}`

**Borra de verdad**: `citas` no lleva soft delete y las líneas caen en cascada.
**Cancelar es un estado** y es lo que conserva el historial. Por eso el diálogo
de borrado lo dice, y ofrece cancelar como alternativa: son dos acciones
distintas con el mismo aspecto de «quitar esto de en medio».

Si la cita estaba completada, su stock vuelve antes de borrarla.

---

## Campos

| Campo | Tipo | Confirmado | Notas |
|---|---|---|---|
| `fecha` | date `Y-m-d` | ✅ | |
| `hora_inicio` | `HH:mm` | ✅ | |
| `hora_fin` | `HH:mm` | ✅ | Calculado, solo lectura |
| `codigo` | string | ✅ | Público: es el que viaja por WhatsApp |
| `estado` | enum | ✅ | Los **seis** de abajo |
| `monto` | decimal | ✅ | Solo los **servicios**. Editable: reescribe el precio congelado de la línea |
| `monto_total` | decimal | ✅ | Servicios + productos. **Es el que se muestra** |
| `notas` | string \| null | ✅ | Máx. 500 |
| `cliente_id` | int \| null | ✅ | Ver "El campo Cliente" |
| `cliente_nombre` | string | ✅ | Texto libre, máx. 150 |
| `cliente_telefono` | string \| null | ✅ | Máx. 30 |
| `cliente_email` | string \| null | ✅ | Máx. 150 |
| `servicios` | array | ✅ | **La fuente de verdad.** Precio y duración congelados de la pivote |
| `servicio` | objeto \| null | ✅ | La primera línea, **como puente** |
| `empleado` | objeto | ✅ | **Obligatorio**: `citas.profesional_id` no es nullable |
| `local_id` | int \| null | ✅ | La sede |
| `productos` | array | ✅ | Puede venir vacío |

### Estados de la cita

`web/src/features/citas/constants.ts` — única fuente de verdad, también la usa
el dashboard.

Son **seis**, los del ENUM real de la tabla `citas`:

| Valor | Etiqueta | Color |
|---|---|---|
| `pendiente` | Pendiente | warning |
| `confirmada` | Confirmada | info |
| `en_curso` | En curso | primary |
| `completada` | Completada | success |
| `cancelada` | Cancelada | default |
| `no_asistio` | No asistió | error |

**Eran cuatro hasta el 2026-09-06.** El backend emite los seis y no los recorta;
recortarlos habría sido mentir sobre el estado real de una cita, y el bloque de
inasistencias de [Reportes](reportes.md) es imposible sin `no_asistio`.

> Ironía anotada: en una revisión anterior di `no_asistio` por inventado mío y
> lo quité. Existía en la tabla desde el principio.

**El rojo es para `no_asistio`, no para `cancelada`.** Cancelar es un desenlace
ordenado —alguien avisó— y se pinta en gris; la inasistencia es la que cuesta
dinero y la que Reportes mide. Con las dos en rojo, el color dejaba de decir
cuál de las dos hay que perseguir.

`en_curso` se lleva el color del tema porque es el único estado que describe
**ahora mismo**: en una lista del día es lo primero que se busca.

### Descartado respecto a la maqueta anterior

- `precio` → ahora se llama **`monto`**, y es editable.
- **`local`**: resuelto. `local_id` viaja en la entidad y se acepta en el
  payload; con una sola sede lo pone el backend, y el selector solo aparece
  cuando hay más de una.
- `cliente` como objeto anidado → ahora son campos planos, más `cliente_id`.

---

## Tabla (columnas elegidas por mí)

| Columna | Contenido |
|---|---|
| Fecha y hora | Fecha + `hora_inicio – hora_fin` |
| Cliente | Nombre + teléfono |
| Servicio | Nombre + "+N productos" si tiene |
| Atiende | Empleado, o "Sin asignar" |
| Monto | `S/ 0.00` — **`monto_total`**, que es lo que se cobra |
| Estado | Chip de color |
| Acciones | Editar y eliminar |

Filtro por estado arriba a la derecha, como **query param** `?estado=`.

---

## Resueltos con el backend (2026-09-06)

- **El cliente escrito a mano**: con teléfono se **reutiliza su ficha** (y se
  restaura si estaba borrada); **sin teléfono se crea una nueva aunque el
  nombre se repita**. Fusionar por nombre juntaría a dos «María» distintas, y
  separar dos historiales mezclados es mucho peor que tener dos fichas.
- **Los productos descuentan stock al COMPLETAR**, no al agendar: reservar dos
  ceras para el jueves no las quita del estante hoy. Deshacer el completado las
  devuelve, anotando una entrada de devolución en vez de borrar la venta.
- **Esa venta no tiene el tope de stock** que sí tiene el movimiento manual, a
  propósito: la venta ya ocurrió, y negarse a registrarla dejaría la cita sin
  poder cerrarse por un dato de inventario que ya estaba mal.
- **El monto no incluye los productos**: para eso está `monto_total`.
- **Sí se valida la disponibilidad** en el backend, con la misma regla del
  selector, y el 422 llega en `hora_inicio`.
- **La cita se asigna a un local**: `local_id`.
- **El intervalo tiene pantalla** desde el Sprint 2:
  `/administracion/general/agenda`.

## Pendiente

- [ ] **Ver el listado real de Citas** para confirmar columnas y filtros
- [ ] ¿Hace falta un **margen entre citas** (buffer) para limpiar o preparar?
- [ ] ¿La duración puede variar por profesional? Hoy es del servicio y punto
- [ ] Con "Sin asignar" no hay horario que consultar y no se ofrecen huecos.
      ¿Debería ser obligatorio elegir profesional?
- [ ] **Varios servicios por cita** en el panel. El array ya llega; el
      formulario sigue mandando uno. Lo pide la tienda pública del Sprint 5.
- [ ] **`codigo` no se muestra en ninguna vista**, y es el identificador con el
      que un cliente sin cuenta pregunta por su cita.

### Verificado contra el backend

El Blade de editar cita manda `productos[i][id]` y `productos[i][cantidad]`,
así que la clave de cada línea es **`id`**, no `producto_id`.

Existen la tabla `cita_servicio` (varios servicios por cita) y las columnas
`cliente_apellido` / `cliente_documento`, pero **el panel no las usa**: su
formulario envía un solo `servicio_id` y no pide apellido ni documento. Son
para la página pública de reservas.

La columna `citas.fuente` (`web` · `panel` · `publica`) registra de dónde vino
cada reserva. Todavía no se muestra en ninguna vista.

**`cita_servicio` dejó de ser «para la página pública»**: es la única fuente de
verdad de los servicios de una cita, también para el panel. No existe
`citas.servicio_id`.

---

## Quién ve qué

`solo_propios` **ya filtra** (Sprint 4). Quien lo tiene en su rol ve solo sus
citas, y la de otro responde **404**, no 403: para esa persona esa cita no
existe. Y quien tiene `solo_propios` **sin ficha de profesional no ve ninguna**
— quien no atiende no tiene citas propias.

El alcance por sedes se aplica además del anterior: son dos ejes distintos.
**Dónde** manda vive en la cuenta; **sobre quién**, en el rol.
