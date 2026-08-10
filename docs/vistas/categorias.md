# Categorías

**Ruta:** `/categorias`
**Estado:** ⚠️ Campos supuestos — pendiente de validar contra la vista real
**Archivos:**
- `web/src/app/(dashboard)/categorias/page.tsx`
- `web/src/features/categorias/`

---

## Qué muestra

Tabla paginada de las categorías que agrupan los servicios. Botón "Nueva categoría".

### Columnas

| Columna | Contenido |
|---|---|
| Categoría | Punto de color (12px) + nombre en negrita |
| Descripción | Texto secundario |
| Servicios | `servicios_count`, centrado |
| Estado | Chip verde "Activa" / gris "Inactiva" |

### Estados de la UI

| Estado | Qué se muestra |
|---|---|
| Cargando | 5 skeletons de fila |
| Vacío | "Todavía no has creado categorías." |
| Error | Alert rojo |

Esta tabla **no tiene buscador** — se asume que son pocas.

---

## Endpoints

### `GET /api/categorias`

Parámetros: `page`, `per_page`, `search`

```json
{
  "data": [
    {
      "id": 2,
      "nombre": "Odontología",
      "descripcion": "Limpieza, ortodoncia y tratamientos dentales",
      "color": "#49BEFF",
      "servicios_count": 4,
      "activa": true
    }
  ],
  "meta": { "current_page": 1, "per_page": 10, "total": 5, "last_page": 1 }
}
```

### `POST /api/categorias`

```json
{
  "nombre": "Odontología",
  "descripcion": "Limpieza, ortodoncia y tratamientos dentales",
  "color": "#49BEFF",
  "activa": true
}
```

---

## Campos

| Campo | Tipo | Confirmado | Notas |
|---|---|---|---|
| `nombre` | string | ✅ | |
| `descripcion` | string | ⚠️ | **Inventado** |
| `color` | string hex | ⚠️ | **Inventado.** Lo usa el chip en la tabla de Servicios |
| `servicios_count` | int | ⚠️ | **Inventado.** Requiere `withCount('servicios')` |
| `activa` | bool | ⚠️ | **Inventado** |

---

## Para validar contra tu vista real

- [ ] ¿La categoría tiene color? (si no, hay que quitar el punto y el chip de Servicios)
- [ ] ¿Tiene descripción?
- [ ] ¿Hay categorías anidadas (subcategorías)?
- [ ] ¿Se puede desactivar una categoría?

## Pendiente

- [ ] Formulario de creación/edición con selector de color
