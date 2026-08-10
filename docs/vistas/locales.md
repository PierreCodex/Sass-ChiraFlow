# Locales

**Ruta:** `/locales`
**Estado:** ⚠️ Campos supuestos — pendiente de validar contra la vista real
**Archivos:**
- `web/src/app/(dashboard)/locales/page.tsx`
- `web/src/features/locales/`

---

## Qué muestra

Tabla paginada de las sedes del negocio. Botón "Nuevo local".

### Columnas

| Columna | Contenido |
|---|---|
| Local | Nombre en negrita |
| Dirección | Texto secundario |
| Teléfono | Texto secundario |
| Horario | Texto libre (`"Lun a Sáb · 08:00 - 20:00"`) |
| Empleados | `empleados_count`, centrado |
| Estado | Chip verde "Activo" / gris "Inactivo" |

### Estados de la UI

| Estado | Qué se muestra |
|---|---|
| Cargando | 5 skeletons de fila |
| Vacío | "Todavía no has registrado locales." |
| Error | Alert rojo |

Sin buscador — se asume que son pocos.

---

## Endpoints

### `GET /api/locales`

Parámetros: `page`, `per_page`, `search`

```json
{
  "data": [
    {
      "id": 1,
      "nombre": "Sede Central",
      "direccion": "Av. Arequipa 1250, Lince",
      "telefono": "01 445 8890",
      "horario": "Lun a Sáb · 08:00 - 20:00",
      "empleados_count": 6,
      "activo": true
    }
  ],
  "meta": { "current_page": 1, "per_page": 10, "total": 4, "last_page": 1 }
}
```

### `POST /api/locales`

```json
{
  "nombre": "Sede Central",
  "direccion": "Av. Arequipa 1250, Lince",
  "telefono": "01 445 8890",
  "activo": true
}
```

---

## Campos

| Campo | Tipo | Confirmado | Notas |
|---|---|---|---|
| `nombre` | string | ✅ | |
| `direccion` | string | ⚠️ | |
| `telefono` | string | ⚠️ | |
| `horario` | string | ⚠️ | **Inventado.** Mismo problema que en Empleados: seguramente es una estructura por día, no texto |
| `empleados_count` | int | ⚠️ | **Inventado.** Requiere `withCount('empleados')` |
| `activo` | bool | ⚠️ | **Inventado** |

---

## Para validar contra tu vista real

- [ ] ¿El local tiene horario de atención propio? ¿Cómo se guarda?
- [ ] ¿Cada local tiene su propia caja e inventario?
- [ ] ¿El plan limita la cantidad de locales? (relevante para "Mi Plan")
- [ ] ¿Hay datos fiscales del local (RUC, razón social) para las boletas?

## Pendiente

- [ ] Formulario de creación/edición
- [ ] Horario de atención estructurado
