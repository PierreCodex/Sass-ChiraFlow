# Categorías

**Ruta:** `/categorias`
**Estado:** ✅ **Conectada al backend real** (2026-08-27, Sprint 1)
**Archivos:**
- `web/src/app/(dashboard)/categorias/page.tsx`
- `web/src/features/categorias/`

> Tabla real: **`categoria_servicios`**. En Laravel el módulo se llama
> `categorias-servicios`; aquí se mantiene "Categorías", que es como aparece
> en el menú.

---

## Qué muestra

Tabla paginada con buscador y botón "Nueva categoría", con el mismo montaje
que Clientes: el `BuscadorTabla` alineado a la derecha encima de la tabla.

### Columnas

| Columna | Contenido |
|---|---|
| Categoría | Miniatura de la imagen + nombre |
| Descripción | `descripcion`, o `—` |
| Color | Círculo + hexadecimal, o `—` si no tiene |
| Servicios | `servicios_count`, centrado |
| Acciones | Editar y eliminar |

**`orden` no tiene columna.** La tabla ya llega ordenada por él, así que el
número no añade nada que la propia lista no esté enseñando; se sigue editando
en el formulario, que es donde sirve para algo.

### Imagen y color ya no compiten

El Blade pintaba una cosa **o** la otra: si había imagen, mandaba la imagen; si
no, el círculo de color. Con `color` en su propia columna eso dejó de tener
sentido —el mismo dato en dos sitios hace dudar de si son dos cosas
distintas—, así que:

- **Categoría**: miniatura 40×40 de la imagen, o nada si no la tiene.
- **Color**: el círculo con su hexadecimal al lado. Dos azules parecidos se
  distinguen por el código, no por el ojo. Sin color, `—`.

### Estados de la UI

| Estado | Qué se muestra |
|---|---|
| Cargando | 5 skeletons de fila |
| Vacío | "Todavía no has creado categorías.", o "No se encontraron categorías." si hay búsqueda |
| Error | Alert rojo |

El buscador manda `search` y el backend filtra por **nombre y descripción**
(a diferencia de Servicios, que solo busca por nombre).

---

## Endpoints

### `GET /api/categorias-servicios`

Parámetros: `page`, `per_page`, `search` (nombre y descripción)

```json
{
  "data": [
    {
      "id": 1,
      "nombre": "Consultas",
      "descripcion": "Atención médica general y especializada",
      "color": "#5D87FF",
      "orden": 1,
      "imagen_url": null,
      "servicios_count": 5
    }
  ],
  "meta": { "current_page": 1, "per_page": 10, "total": 5, "last_page": 1 }
}
```

`servicios_count` requiere `withCount('servicios')`.

### `POST` · `PUT /api/categorias-servicios/{id}`

⚠️ **`multipart/form-data`** (sube imagen). La edición va como **POST con
`_method=PUT`**.

| Campo | Reglas del controlador |
|---|---|
| `nombre` | required, string, **max 100**, único por negocio |
| `descripcion` | nullable, string, **max 255** |
| `color` | nullable, string, max 20 |
| `orden` | nullable, integer, **min 0** (por defecto 0) |
| `imagen` | nullable, image (jpeg/png/jpg/gif/webp), **max 2048 KB** |

El frontend replica estas reglas en
`features/categorias/schemas/categoria.schema.ts`, así que el 422 debería ser
raro — pero si llega, se pinta en el campo.

### `DELETE /api/categorias-servicios/{id}`

Responde **204 sin cuerpo**. Es borrado real —nada del historial apunta a una
categoría—, pero **los servicios sobreviven**: la FK es `nullOnDelete` y se
quedan sin categoría.

Por eso el aviso del diálogo lo pinta el frontend con el `servicios_count` que
ya trae del listado, y el texto es **«N servicios quedarán sin categoría»**, no
«se eliminarán N servicios».

---

## Campos

| Campo | Tipo | Confirmado | Notas |
|---|---|---|---|
| `nombre` | string(100) | ✅ | Único por negocio |
| `descripcion` | string(255) \| null | ✅ | En el listado y en el formulario |
| `color` | string(20) \| null | ✅ | **Nullable** |
| `orden` | int | ✅ | Por defecto 0. Menor número, más arriba |
| `imagen_url` | string \| null | ✅ | Reemplaza al color en el listado |
| `servicios_count` | int | ✅ | Calculado |

### Corregido respecto a la maqueta anterior

Me había inventado **`activa`** (activa/inactiva): **no existe**. La categoría
no se puede desactivar.

Y me faltaban **`orden`** e **`imagen`**, que sí están en el formulario real.

---

## Formulario

`web/src/features/categorias/components/CategoriaFormDialog.tsx`

| Campo | Control | Obligatorio |
|---|---|---|
| Nombre | Texto | Sí |
| Orden | Número | No (0 por defecto) — no se muestra en la tabla |
| Descripción | Textarea (2 filas) | No |
| Color | `input[type=color]` + botón de quitar | No |
| Imagen | Selector de 1 imagen | No |

Botones: **Crear categoría** / **Guardar cambios**, y **Cancelar**.

### El botón de quitar el color

`input[type=color]` no sabe mandar «vacío»: siempre devuelve un color. Sin una
X al lado, una categoría que alguna vez tuvo color no podría volver a quedarse
sin él. El botón manda `color: null`, que el backend acepta, y mientras no hay
color el swatch se ve apagado con la nota «Sin color: el listado no mostrará
círculo».

Por lo mismo, al editar el color se carga **tal cual viene** (`null` incluido):
rellenarlo con un azul por defecto le pondría color a una categoría que no lo
tiene en cuanto se guardara.

---

## Resuelto en el Sprint 1 (2026-08-27)

- [x] **Servicios de una categoría eliminada**: quedan sin categoría, y el
      diálogo ya lo dice con ese texto
- [x] **El `orden`** se edita solo con el número; arrastrar filas queda fuera
      de la v1
- [x] **Quitar el color** ya se puede, con la X del formulario

La columna `activo` **sí existe** en la migración, al revés de lo que decía
esta ficha. Se queda —quitarla obligaría a re-migrar cada tenant por nada—,
pero ni el Resource la emite ni el Form Request la acepta: la categoría sigue
sin poderse desactivar, que es lo que manda la ficha.

`imagen` entra como archivo e `imagen_url` sale como URL. La columna guarda la
**ruta** (`categorias/uuid.webp`), no la URL: el día que las imágenes se muevan
a S3 cambia una línea de configuración en vez de cada fila de cada tenant.

## Pendiente

- [ ] **No se puede quitar la imagen** una vez puesta. En multipart, no mandar
      `imagen` significa «déjala como está» —y así tiene que ser, o cada
      edición borraría la foto—, así que hace falta un campo aparte
      (`imagen_eliminar`) para decirlo. Traspaso abierto al backend
