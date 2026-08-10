# Documentación de vistas

Una ficha por pantalla en [`vistas/`](vistas/). Cada ficha declara qué muestra la
vista, qué endpoints consume y el **JSON exacto** que espera recibir de Laravel.

Sirve para dos cosas: como especificación para construir el backend, y como
checklist para validar cada maqueta contra la app actual.

## Índice

| Vista | Ruta | Estado |
|---|---|---|
| [Dashboard](vistas/dashboard.md) | `/` | ✅ Fiel a la app actual |
| [Suscripción](vistas/suscripcion.md) | (banner global) | ✅ Fiel a la app actual |
| [Clientes](vistas/clientes.md) | `/clientes` | ✅ Validado contra la app actual |
| [Citas](vistas/citas.md) | `/citas` | ✅ Formulario validado · ⚠️ tabla supuesta |
| [Servicios](vistas/servicios.md) | `/servicios` | ✅ Validado contra la app actual |
| [Categorías](vistas/categorias.md) | `/categorias` | ⚠️ Campos supuestos |
| [Empleados](vistas/empleados.md) | `/empleados` | ✅ Validado contra la app actual |
| [Locales](vistas/locales.md) | `/locales` | ⚠️ Campos supuestos |
| [Calendario](vistas/calendario.md) | `/calendario` | ✅ Validado contra la app actual |
| Caja | `/caja` | ⬜ Sin maquetar |
| Inventario | `/inventario` | ⬜ Sin maquetar (existe `Producto` para Citas) |
| Reportes | `/reportes` | ⬜ Sin maquetar |
| Mi Plan | `/mi-plan` | ⬜ Sin maquetar |
| WhatsApp | `/whatsapp` | ⬜ Sin maquetar |
| Configuración | `/configuracion` | ⬜ Sin maquetar (ya existe el ajuste de intervalo de agenda) |
| Soporte | `/soporte` | ⬜ Sin maquetar |

**Estados:** ✅ construido a partir de la app real · ⚠️ construido con campos
que inventé, pendientes de validar · ⬜ solo la ruta, sin pantalla.

Para añadir una vista nueva, copia [`vistas/_plantilla.md`](vistas/_plantilla.md).

---

## Convenciones de la API

Todas las respuestas siguen los formatos estándar de Laravel. El frontend ya
está escrito contra ellos (`src/lib/api/types.ts`).

### Recurso individual

```json
{ "data": { "id": 1, "nombre": "..." } }
```

### Colección paginada — `->paginate()`

```json
{
  "data": [{ "id": 1 }, { "id": 2 }],
  "links": { "first": null, "last": null, "prev": null, "next": null },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 4,
    "path": "",
    "per_page": 10,
    "to": 10,
    "total": 37
  }
}
```

El frontend solo usa `data` y `meta.total` / `meta.current_page` / `meta.per_page`.

### Moneda y formato

Los importes van en **soles (PEN)** y el frontend los formatea con
`formatMoneda()` → `S/ 20.00`. Configurable en `web/.env.local`:

```env
NEXT_PUBLIC_LOCALE=es-PE
NEXT_PUBLIC_CURRENCY=PEN
```

Las fechas viajan ISO (`2026-08-09`) y se muestran como `DD/MM/YYYY`.

### Parámetros de listado

Todos los índices aceptan los mismos:

| Param | Tipo | Notas |
|---|---|---|
| `page` | int | Base **1** |
| `per_page` | int | 10, 25 o 50 |
| `search` | string | Opcional, texto libre |
| `sort` | string | Opcional |

### Errores de validación (422)

```json
{
  "message": "Los datos proporcionados no son válidos.",
  "errors": { "email": ["El email ya está registrado."] }
}
```

`toApiError()` en `src/lib/api/client.ts` los normaliza para react-hook-form.

### Errores 401

El interceptor de axios redirige a `/login` automáticamente. El backend no
necesita devolver nada especial.

---

## Cómo están construidas las vistas

```
app/(dashboard)/<ruta>/page.tsx   solo composición
        ↓
features/<modulo>/components/     la pantalla
        ↓
features/<modulo>/hooks/          React Query
        ↓
features/<modulo>/services/       el fetch (o el mock)
        ↓
lib/api/client.ts                 axios
```

### El switch de datos ficticios

Hoy la capa de servicios devuelve los datos de `features/<modulo>/mocks.ts`.
Cuando el backend esté listo:

```env
# web/.env.local
NEXT_PUBLIC_USE_MOCKS=false
```

Ese es el único cambio. Los hooks y los componentes ya están escritos contra la
API real — ver `src/lib/api/recurso.ts`, donde cada método tiene la rama mock y
la llamada axios una al lado de la otra.
