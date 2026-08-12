# Categorías

**Ruta:** `/categorias`
**Estado:** ✅ Validado contra el código Laravel
**Archivos:**
- `web/src/app/(dashboard)/categorias/page.tsx`
- `web/src/features/categorias/`

> Tabla real: **`categoria_servicios`**. En Laravel el módulo se llama
> `categorias-servicios`; aquí se mantiene "Categorías", que es como aparece
> en el menú.

---

## Qué muestra

Tabla paginada con botón "Nueva categoría".

### Columnas

| Columna | Contenido |
|---|---|
| Categoría | Marca visual + nombre + descripción debajo |
| Servicios | `servicios_count`, centrado |
| Orden | `orden`, centrado |
| Acciones | Editar y eliminar |

### La marca visual

Réplica del `@if` del Blade, en este orden:

1. Si tiene **imagen** → miniatura 40×40 redondeada.
2. Si no, pero tiene **color** → círculo de 24 px.
3. Si no tiene ninguno → **no se muestra nada**, solo el nombre.

O sea que la imagen **reemplaza** al color, no conviven.

### Estados de la UI

| Estado | Qué se muestra |
|---|---|
| Cargando | 5 skeletons de fila |
| Vacío | "Todavía no has creado categorías." |
| Error | Alert rojo |

Sin buscador: se asume que son pocas.

---

## Endpoints

### `GET /api/categorias-servicios`

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

El diálogo de confirmación **avisa cuántos servicios tiene asociados** antes de
borrar. Pendiente definir qué hace el backend: en la tabla `servicios` la clave
es `nullOnDelete`, así que los servicios quedarían **sin categoría** en vez de
borrarse.

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
| Orden | Número | No (0 por defecto) |
| Descripción | Textarea (2 filas) | No |
| Color | `input[type=color]` | No |
| Imagen | Selector de 1 imagen | No |

Botones: **Crear categoría** / **Guardar cambios**, y **Cancelar**.

---

## Pendiente

- [ ] ¿Qué pasa con los servicios de una categoría eliminada? La FK es
      `nullOnDelete`, así que quedarían sin categoría — conviene avisarlo en el
      diálogo con el texto exacto
- [ ] ¿El `orden` se edita arrastrando filas, o solo con el número?
- [ ] El color es nullable, pero el formulario siempre manda uno (el
      `input[type=color]` no admite vacío). Para dejarlo sin color haría falta
      un botón de "quitar color"
