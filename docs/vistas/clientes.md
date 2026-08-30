# Clientes

**Ruta:** `/clientes`
**Estado:** ✅ **Conectada al backend real** (2026-08-27, Sprint 1)
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

### El teléfono es la clave natural

`telefono` sigue siendo **texto libre**: se guarda tal cual se escribe y la
tabla lo muestra igual. Pero el backend guarda además un
`telefono_normalizado` (solo dígitos, sin el `51` del prefijo) que **no sale de
la API** y es UNIQUE, así que **dos fichas no pueden compartir número**.

El motivo es la tienda pública: la reserva busca al cliente por su teléfono, y
sin normalizar, `904169872` y `904 169 872` fabricarían dos fichas de la misma
persona con medio historial cada una. La normalización es deliberadamente
conservadora —no inventa un `+51` que nadie escribió ni recorta números
cortos— porque **casar de más uniría fichas de dos personas distintas**, que es
peor que dejar dos fichas de una.

Consecuencia para el formulario: `POST /clientes` puede responder

```json
{
  "errors": { "telefono": ["Ya existe un cliente con ese teléfono."] }
}
```

El diálogo ya lo pinta bajo el campo Teléfono, como cualquier otro 422.

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

El backend emite además `apellido`, `documento`, `fecha_nacimiento` y `notas`,
que sí existen en la migración: la reserva pública pide apellido y documento.
El formulario del panel sigue pidiendo solo los tres campos de la captura.

### Descartado respecto a la maqueta anterior

De lo que me había inventado, `estado` (activo/inactivo) **no existe**.
`documento` sí, al revés de lo que decía esta ficha antes del Sprint 1.

---

## Diferencias con la app actual

Cosas que añadí y que **no están** en la vista original. Si sobran, se quitan:

| Añadido | Por qué | ¿Se queda? |
|---|---|---|
| Buscador | Filtra por nombre, apellido, teléfono y email | ✅ se queda |
| Paginación | La app actual lista todo de corrido | ✅ se queda |
| Botón + modal "Nuevo cliente" | Pedido explícitamente | ✅ |

---

El buscador casa el teléfono **también por el normalizado**, para que quien
escriba `904169872` encuentre al que se guardó como `904 169 872`.

---

## Resuelto en el Sprint 1 (2026-08-27)

- [x] **El alta también ocurre desde Citas**: la reserva pública hace
      `firstOrCreate` por teléfono, y el panel podrá crear cliente al vuelo al
      agendar. Los dos caminos comparten la misma normalización
- [x] **Borrar es soft delete** (las citas lo referencian), y volver a dar de
      alta el mismo teléfono **restaura la ficha con su historial** en vez de
      crear una nueva

## Pendiente

- [ ] Acciones por fila (editar / ver ficha / eliminar): no se ven en la
      captura, y los endpoints ya existen
- [ ] Modo edición del modal (hoy solo crea)
