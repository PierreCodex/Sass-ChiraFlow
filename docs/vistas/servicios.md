# Servicios

**Ruta:** `/servicios`
**Estado:** ✅ Campos validados contra la app actual (captura del 09/08/2026)
**Archivos:**
- `web/src/app/(dashboard)/servicios/page.tsx`
- `web/src/features/servicios/`

---

## Qué muestra

Tabla del catálogo de servicios con las 7 columnas de la app actual, botón
"Nuevo servicio" y acciones de editar/eliminar por fila.

### Columnas

| Columna | Contenido |
|---|---|
| Nombre | Punto de color del servicio + nombre en negrita |
| Categoría | `categoria.nombre`, o `-` si no tiene |
| Tipo | Etiqueta del tipo (hoy siempre "Normal") |
| Duración | `{duracion_min} min` |
| Precio | `formatMoneda(precio)` → `S/ 20.00` |
| Estado | Chip verde "Activo" / gris "Inactivo" |
| Acciones | Botón editar (lápiz) y eliminar (papelera) |

**El color pertenece al servicio, no a la categoría.** En la app actual hay
servicios sin categoría que igual muestran su punto de color.

### Estados de la UI

| Estado | Qué se muestra |
|---|---|
| Cargando | 5 skeletons de fila |
| Vacío | "No se encontraron servicios." |
| Error | Alert rojo |

---

## Endpoints

### `GET /api/servicios`

Parámetros: `page`, `per_page`, `search` (filtra por nombre)

```json
{
  "data": [
    {
      "id": 1,
      "nombre": "AAA",
      "color": "#5D87FF",
      "categoria": null,
      "tipo": "normal",
      "duracion_min": 30,
      "precio": 20,
      "activo": true
    },
    {
      "id": 6,
      "nombre": "Limpieza dental",
      "color": "#49BEFF",
      "categoria": { "id": 2, "nombre": "Odontología" },
      "tipo": "normal",
      "duracion_min": 45,
      "precio": 90,
      "activo": true
    }
  ],
  "meta": { "current_page": 1, "per_page": 10, "total": 12, "last_page": 2 }
}
```

### `POST /api/servicios` · `PUT /api/servicios/{id}`

⚠️ **No es JSON: va como `multipart/form-data`**, porque el formulario sube
imágenes.

Y como PHP no parsea multipart en peticiones PUT, la edición se envía como
**POST con `_method=PUT`**. Eso ya lo hace el frontend
(`web/src/lib/api/recurso.ts`, opción `enviarComoFormData`).

Campos del FormData:

| Campo | Tipo | Notas |
|---|---|---|
| `nombre` | string | |
| `descripcion` | string | Cadena vacía si no tiene |
| `color` | string hex | |
| `categoria_id` | int \| "" | Vacío = sin categoría |
| `tipo` | string | |
| `precio` | decimal | |
| `duracion_min` | int | |
| `imagen_principal` | File | Solo si el usuario eligió una nueva |
| `galeria[]` | File | Imágenes nuevas, 0 a 4 |
| `galeria_conservar[]` | string | URLs de la galería que **no** se borraron |
| `empleado_ids[]` | int | Profesionales marcados |
| `_method` | `"PUT"` | Solo al editar |

**Sobre `galeria_conservar`:** al editar, el usuario puede quitar fotos ya
guardadas. El frontend envía las que quedan; el backend debería borrar las que
no aparezcan en esa lista. Si prefieres otro mecanismo (ids en vez de URLs, o
un endpoint aparte para borrar imágenes), dímelo y lo cambio.

La respuesta devuelve **`categoria`** y **`empleados`** como objetos, e
`imagen_principal` / `galeria` como URLs.

### `DELETE /api/servicios/{id}`

Responde 204. El frontend refresca la tabla solo.

---

## Campos

| Campo | Tipo | Confirmado | Notas |
|---|---|---|---|
| `id` | int | ✅ | |
| `nombre` | string | ✅ | Texto libre |
| `descripcion` | string \| null | ✅ | En el formulario, no en la tabla |
| `color` | string hex | ✅ | El punto de la primera columna |
| `categoria` | objeto \| null | ✅ | Nullable — se muestra `-` |
| `tipo` | enum | ⚠️ | **Solo tengo evidencia de "Normal"** — ver abajo |
| `duracion_min` | int | ✅ | En minutos |
| `precio` | decimal | ✅ | En soles (PEN) |
| `activo` | bool | ⚠️ | Está en la tabla pero **no en el formulario** — ver abajo |
| `imagen_principal` | string URL \| null | ✅ | |
| `galeria` | string URL[] | ✅ | Máximo 4 |
| `empleados` | objeto[] | ✅ | Profesionales que ofrecen el servicio |

### `activo` — dónde se cambia

La tabla muestra la columna Estado, pero el formulario de "Nuevo servicio"
**no tiene ningún control para el estado**. Quité el switch que había puesto.

Asumo que al crear entra como `activo: true` y que se desactiva desde otro
sitio. Pendiente: ¿el formulario de edición sí lo tiene? ¿O se desactiva desde
la tabla?

### `tipo` — resuelto

Valores reales de `servicios.tipo` (columna `string(30)`, por defecto
`normal`):

| Valor | Etiqueta |
|---|---|
| `normal` | Normal |
| `sesiones` | Por sesiones |
| `clases` | Clases |
| `paquete` | Paquete |

**`sesiones` y `paquete` usan además `max_sesiones`** (`unsignedSmallInteger`,
nullable). Ese campo todavía **no está en el formulario**: falta añadirlo,
visible solo cuando el tipo lo requiera.

### Descartado respecto a la maqueta anterior

`descripcion` me lo había inventado y no aparece en la tabla. Puede que exista
en el formulario — pendiente de confirmar.

---

## Formulario (crear y editar)

`web/src/features/servicios/components/ServicioFormDialog.tsx`

El mismo componente sirve para ambos: si recibe la prop `servicio` entra en
modo edición y precarga los valores.

### Campos, en el orden de la app actual

| # | Campo | Control | Obligatorio | Validación |
|---|---|---|---|---|
| 1 | Nombre | Texto | Sí | No vacío |
| 2 | Categoría | Select | No | Incluye "Sin categoría" |
| 3 | Tipo de servicio | Select | Sí | Por defecto "Normal" |
| 4 | Descripción | Textarea (2 filas) | No | — |
| 5 | Precio | Número con prefijo `S/` | Sí | ≥ 0 |
| 6 | Duración (min) | Número | Sí | Entero > 0 |
| 7 | Imagen principal | Selector de 1 imagen | No | — |
| 8 | Color | `input[type=color]` | Sí | Por defecto morado |
| 9 | Galería de trabajos | Selector de hasta 4 imágenes | No | Máx. 4 |
| 10 | Profesionales | Checkboxes de empleados | No | — |

Botones: **Guardar** y **Cancelar**, en ese orden.

Las imágenes usan `CampoImagenes`
(`web/src/components/shared/CampoImagenes.tsx`), un componente compartido con
vista previa y botón de quitar. En modo mock las previsualizaciones se generan
con `URL.createObjectURL`, así que se ven pero no se suben a ningún sitio.

La galería lleva el texto de ayuda de tu app: *"Estas fotos se mostrarán en la
página pública como evidencia del servicio."*

> **Nota de producto:** ese texto implica que existe una **página pública** de
> reservas donde se muestran los servicios con sus fotos. No está en el menú
> del panel — es otra vista, probablemente fuera de este dashboard. Habrá que
> definir si entra en este proyecto.

### Diálogo con scroll

El formulario es largo, así que el `<form>` se comporta como columna flex del
Paper: el título y los botones quedan fijos y solo scrollea el contenido.
Sin eso, el diálogo entero scrollea y el título se pierde.

---

## Eliminar

Usa `ConfirmDialog` (`web/src/components/shared/ConfirmDialog.tsx`), un
componente compartido para todas las acciones destructivas de la app.

> **Eliminar servicio**
> ¿Seguro que quieres eliminar **AAA**? Esta acción no se puede deshacer.
> `[Cancelar]` `[Eliminar]`

Durante la petición ambos botones se deshabilitan y el modal no se puede
cerrar. Si el backend falla, el error aparece dentro del propio diálogo.

**Pregunta para el backend:** ¿qué pasa al eliminar un servicio que ya tiene
citas asociadas? Lo esperable es un 409 o 422 con un mensaje explicando el
motivo — el diálogo ya está preparado para mostrarlo.

---

## Diferencias con la app actual

| Elemento | En tu app | Aquí |
|---|---|---|
| Buscador | Input + botón "Buscar" | Filtra mientras escribes, sin botón |
| Acciones | Enlaces de texto "Editar" / "Eliminar" | Botones de icono con tooltip |
| Eliminar | (sin confirmación visible) | Pide confirmación |
| Formulario | Página completa (`/servicios/nuevo`) | Modal sobre la tabla |
| Color | `input[type=color]` nativo | Igual |

Si prefieres que el formulario sea una página aparte en vez de un modal, el
componente se reutiliza tal cual: solo cambia dónde se monta.

---

## Pendiente

- [ ] **Lista completa de valores de `tipo`**
- [ ] ¿Dónde se cambia `activo`? No está en el formulario de alta
- [ ] ¿Existe la página pública que menciona la ayuda de la galería?
- [ ] ¿Cómo quieres manejar el borrado de imágenes al editar?
- [ ] ¿El servicio se asigna también a locales concretos?
- [ ] ¿Qué responde el backend al eliminar un servicio con citas?
