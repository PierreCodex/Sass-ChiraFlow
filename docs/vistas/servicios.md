# Servicios

**Ruta:** `/servicios`
**Estado:** ✅ **Conectada al backend real** (2026-08-27, Sprint 1)
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
| Estado | Switch que enciende y apaga el servicio, con su etiqueta al lado |
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
| `galeria_conservar[]` | int | **Ids** de la galería que **no** se borraron |
| `activo` | 0 \| 1 | Opcional. Lo manda el switch de la tabla, no el formulario |
| `empleado_ids[]` | int | Profesionales marcados |
| `_method` | `"PUT"` | Solo al editar |

**Sobre `galeria_conservar` (cambiado el 2026-08-27):** viaja con **ids**, no
con URLs. Casar por URL obligaba al backend a revertir URL → ruta, y eso se
rompe **en silencio** si cambia `APP_URL` o el disco — y lo que se pierde son
las fotos del negocio. Por eso `galeria` pasó de `string[]` a `{ id, url }[]`.

**Omitir el campo no borra nada**: que el formulario no lo mande no puede
significar «bórralo todo». Con eso, el switch de la tabla puede guardar sin
tocar las fotos.

> **Trampa del multipart:** un array vacío **no viaja** en `FormData`, así que
> «quité todas las fotos» llegaría como campo ausente, o sea «no borres nada».
> El formulario manda `galeria_conservar[0]=0` en ese caso: el 0 no es el id de
> ninguna fila (el auto_increment empieza en 1), así que significa «no
> conserves ninguna». Hay un traspaso abierto para un marcador explícito.

La respuesta devuelve **`categoria`** y **`empleados`** como objetos,
`imagen_principal` como URL y `galeria` como `{ id, url }[]`.

### `DELETE /api/servicios/{id}`

Responde **204 siempre, también con citas asociadas**: es **soft delete**. El
servicio desaparece del catálogo y de la tienda, y el historial queda intacto
porque la fila sigue ahí y `cita_servicio` congela `precio` y `duracion_min` al
reservar.

Efecto colateral que conviene saber: `servicios.nombre` es UNIQUE y el índice
no distingue los borrados, así que **crear un servicio con el nombre de uno
eliminado restaura aquella fila** en vez de fallar.

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
| `activo` | bool | ✅ | Se cambia con el switch de la tabla |
| `max_sesiones` | int \| null | ✅ | Solo `sesiones` y `paquete` |
| `imagen_principal` | string URL \| null | ✅ | |
| `galeria` | `{id, url}[]` | ✅ | Máximo 4. Objetos desde el 2026-08-27 |
| `empleados` | objeto[] | ✅ | Profesionales que ofrecen el servicio |

### `activo` — resuelto: el switch de la tabla

El formulario sigue sin traerlo; se enciende y se apaga **desde la fila**, que
es donde se ve el catálogo entero de un vistazo. Al crear entra `true` por el
default de la columna.

`PUT /servicios/{id}` valida el servicio completo, así que un payload con solo
`activo` daría 422: el switch reenvía los campos escalares de la fila y **omite
lo demás**. Sin `empleado_ids` no se desasigna a nadie, sin `galeria_conservar`
no se borra ninguna foto y sin archivo la imagen principal se queda donde
está. Si el guardado falla se pinta un Alert encima de la tabla — sin él la
fila volvería sola a su estado anterior sin explicación.

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
nullable). El formulario lo muestra **solo con esos dos tipos** y entonces es
obligatorio. Al cambiar el tipo a uno que no lo usa, el valor se limpia en vez
de quedarse de fantasma — eso lo hace también el backend.

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
> ¿Seguro que quieres eliminar **AAA**? Dejará de aparecer en tu catálogo y en
> la tienda. Las citas que ya lo usaron conservan su historial.
> `[Cancelar]` `[Eliminar]`

Durante la petición ambos botones se deshabilitan y el modal no se puede
cerrar. Si el backend falla, el error aparece dentro del propio diálogo.

El texto ya no dice «no se puede deshacer»: es soft delete, y el diálogo
esperaba un 409 que no llega. El dueño que deja de ofrecer un servicio tiene
derecho a quitarlo de su catálogo; bloquearlo lo dejaría con una lista que no
puede limpiar.

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

## Resuelto en el Sprint 1 (2026-08-27)

- [x] **Valores de `tipo`**: los cuatro de arriba, con `max_sesiones` ya en el
      formulario
- [x] **Dónde se cambia `activo`**: el switch de la tabla
- [x] **La página pública existe**: es la tienda del Sprint 5
      (`/reservar/{slug}`); `visible_publico` ya viaja en el Resource
- [x] **Borrado de imágenes al editar**: `galeria_conservar` por ids
- [x] **Eliminar un servicio con citas**: 204, soft delete

## Pendiente

- [ ] **¿El servicio se asigna también a locales concretos?** No en la v1: no
      hay pivote servicio↔local, así que un servicio es del negocio entero. Se
      revisa en el Sprint 3, con Locales
- [ ] **Vaciar la galería en multipart** necesita hoy el truco del id 0.
      Traspaso abierto al backend
- [ ] `visible_publico` lo emite el backend pero el formulario todavía no lo
      controla
