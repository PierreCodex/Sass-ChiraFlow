# Clientes

**Ruta:** `/clientes`
**Estado:** ✅ Campos validados contra la app actual (captura del 09/08/2026)
**Archivos:**
- `web/src/app/(dashboard)/clientes/page.tsx`
- `web/src/features/clientes/`

---

## Qué muestra

Tabla de clientes con las 5 columnas de la app actual.

### Columnas

| Columna | Contenido | Alineación |
|---|---|---|
| Nombre | `nombre` en negrita | izquierda |
| Teléfono | `telefono`, o `—` si está vacío | izquierda |
| Email | `email`, o `—` si está vacío | izquierda |
| Citas | `total_citas` en negrita | centro |
| Última cita | `ultima_cita` como `DD/MM/YYYY`, o `—` | izquierda |

Los nombres vienen tal cual los escribió el usuario — hay minúsculas,
mayúsculas y nombres de prueba. La tabla **no los normaliza**.

### Estados de la UI

| Estado | Qué se muestra |
|---|---|
| Cargando | 5 skeletons de fila |
| Vacío | "No se encontraron clientes." |
| Error | Alert rojo con el mensaje de `toApiError()` |

---

## Endpoints

### `GET /api/clientes`

Parámetros: `page`, `per_page`, `search`

```json
{
  "data": [
    {
      "id": 1,
      "nombre": "ANGELICA GABINO HUERTA",
      "telefono": "904 169 872",
      "email": "agabino@ucvvirtual.edu.pe",
      "total_citas": 3,
      "ultima_cita": "2026-08-09"
    },
    {
      "id": 7,
      "nombre": "Test",
      "telefono": "999",
      "email": null,
      "total_citas": 1,
      "ultima_cita": "2026-08-09"
    }
  ],
  "meta": { "current_page": 1, "per_page": 10, "total": 20, "last_page": 2 }
}
```

### `POST /api/clientes` · `PUT /api/clientes/{id}`

```json
{
  "nombre": "ANGELICA GABINO HUERTA",
  "telefono": "904 169 872",
  "email": "agabino@ucvvirtual.edu.pe"
}
```

`total_citas` y `ultima_cita` son calculados: no se envían.

Los campos opcionales viajan como `null`, no como `""` — el schema convierte
los inputs vacíos antes de enviar.

**Respuesta esperada (201):** el cliente creado, envuelto en `data`.

```json
{
  "data": {
    "id": 21,
    "nombre": "ANGELICA GABINO HUERTA",
    "telefono": "904 169 872",
    "email": "agabino@ucvvirtual.edu.pe",
    "total_citas": 0,
    "ultima_cita": null
  }
}
```

---

## Modal "Nuevo cliente"

`web/src/features/clientes/components/ClienteFormDialog.tsx`

Dialog de MUI (`maxWidth="sm"`, pantalla completa en móvil) con
`react-hook-form` + `yup`. Usa `CustomFormLabel` y `CustomTextField` de la
plantilla.

### Campos

| Campo | Obligatorio | Validación |
|---|---|---|
| Nombre | Sí | No puede estar vacío |
| Teléfono | No | Texto libre, sin formato impuesto |
| Email | No | Si se escribe algo, debe ser un correo válido |

### Comportamiento

| Situación | Qué pasa |
|---|---|
| Abrir | El formulario arranca vacío, foco en Nombre |
| Enviar inválido | Mensaje bajo el campo, no se envía nada |
| Enviando | Ambos botones deshabilitados, "Guardando…", no se puede cerrar |
| Éxito | El modal se cierra y la tabla se refresca sola |
| Error 422 | Cada error de Laravel se pinta en su campo |
| Error de red | Alert rojo arriba del formulario |

El refresco de la tabla lo hace `useCrearCliente`, que invalida la query key
`["clientes"]` al terminar. No hace falta recargar nada a mano.

### Errores de validación del backend

Cuando conectes Laravel, un 422 con esta forma se mapea automáticamente al
campo correspondiente:

```json
{
  "message": "Los datos proporcionados no son válidos.",
  "errors": {
    "email": ["Ya existe un cliente con ese correo."]
  }
}
```

Las claves de `errors` deben coincidir con los nombres de los campos:
`nombre`, `telefono`, `email`.

---

## Campos

| Campo | Tipo | Confirmado | Notas |
|---|---|---|---|
| `id` | int | ✅ | |
| `nombre` | string | ✅ | Texto libre, sin formato impuesto |
| `telefono` | string \| null | ✅ | **Texto libre**, no normalizado. En la app conviven `9768657567`, `+51 981 912 809`, `904 169 872` y hasta `999` |
| `email` | string \| null | ✅ | Nullable — hay clientes registrados sin correo |
| `total_citas` | int | ✅ | `withCount('citas')` |
| `ultima_cita` | date `Y-m-d` \| null | ✅ | Fecha de la cita más reciente. En el JSON va ISO; el formato `DD/MM/YYYY` lo aplica el frontend |

### Descartado respecto a la maqueta anterior

Estos campos me los había inventado y **no existen**: `documento` (DNI),
`estado` (activo/inactivo) y `created_at`.

---

## Diferencias con la app actual

Cosas que añadí y que **no están** en la vista original. Si sobran, se quitan:

| Añadido | Por qué | ¿Se queda? |
|---|---|---|
| Buscador | Filtra por nombre, teléfono y email | ⬜ por confirmar |
| Paginación | La app actual lista todo de corrido | ⬜ por confirmar |
| Botón + modal "Nuevo cliente" | Pedido explícitamente | ✅ |

---

## Pendiente

- [ ] Acciones por fila (editar / ver ficha / eliminar): no se ven en la captura
- [ ] Modo edición del modal (hoy solo crea)
- [ ] ¿El alta también ocurre desde el flujo de Citas?
