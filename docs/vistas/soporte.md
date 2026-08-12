# Soporte

**Ruta:** `/soporte`
**Estado:** ✅ Campos validados contra el código Laravel (`feat/planes-suscripcion`)
**Archivos:**
- `web/src/app/(dashboard)/soporte/page.tsx`
- `web/src/features/soporte/`

**Fuente en la app actual:**
- `app/Http/Controllers/Admin/SoporteController.php`
- `database/migrations/2026_07_24_000009_create_saas_tables.php` (tabla base)
- `database/migrations/2026_07_25_000002_add_prioridad_to_soporte_tickets.php`
- `database/migrations/2026_08_10_015832_mejorar_soporte_seguridad.php`
- `resources/views/admin/soporte/index.blade.php`

> **Alcance:** esta es la vista del **negocio**, que solo abre tickets y lee la
> respuesta. El panel donde el equipo de soporte contesta es otra aplicación
> (`SuperAdmin/SoporteController`, `Soporte/NegocioController`, layout
> `layouts/soporte.blade.php`) y **no entra en este proyecto**.

---

## Qué muestra

### Cajas de conteo

Arriba, cuatro cajas de color clicables que filtran la tabla: **Todos**,
**Abierto**, **En proceso**, **Cerrado**, con el número de tickets de cada
uno.

Es el `TicketFilter` de la plantilla
(`app/components/apps/tickets/TicketFilter.tsx`): mismo `BoxStyled` con
`scale(1.03)` al pasar el ratón, mismo `h3` + `h6`. La caja seleccionada lleva
un borde.

**La caja "Todos" va en gris**, no en color de marca: no es un estado, y
además `primary.light` es lo único que la paleta oscura de Modernize no
invierte (sigue siendo `#ECF2FF`), así que en modo oscuro quedaría un bloque
casi blanco.

### Tabla

| Columna | Contenido |
|---|---|
| Asunto | Asunto en negrita + fecha y autor debajo |
| Prioridad | Chip: Baja (gris) · Media (naranja) · Alta (rojo) |
| Estado | Chip: Abierto (azul) · En proceso (naranja) · Cerrado (verde) |
| Respuesta | Las dos primeras líneas, o *"Sin respuesta"* en cursiva |
| — | Botón de ojo: "Ver conversación" |

Buscador que filtra por asunto y mensaje.

### Detalle del ticket

El `mensaje` es un `text` de hasta 5000 caracteres y la `respuesta` también:
en una celda de tabla no caben. El botón del ojo abre un diálogo `sm` que los
muestra como una conversación de dos turnos:

- **Turno del negocio** — fondo `grey.100`, icono de persona, autor y fecha.
- **Turno de soporte** — fondo `info.light`, icono de auriculares, nombre del
  agente y fecha de la última actualización.

Si no hay respuesta todavía, en su lugar va un Alert:

> ℹ️ Todavía no hay respuesta. Te avisaremos en cuanto el equipo revise tu
> ticket.

En la cabecera: asunto, chips de estado y prioridad, y `Ticket #5`.

---

## Endpoints

### `GET /api/soporte/tickets`

Parámetros: `page`, `per_page`, `search`, **`estado`**.

> En Laravel el índice hace `->latest()->get()` **sin paginar**. Aquí va
> paginado como el resto de tablas de la app; hay que cambiarlo a
> `->paginate()` al conectar.

```json
{
  "data": [
    {
      "id": 5,
      "asunto": "No me llegan los recordatorios de WhatsApp",
      "mensaje": "Desde el lunes las clientas dicen que no reciben el recordatorio del día anterior.",
      "respuesta": null,
      "estado": "abierto",
      "prioridad": "alta",
      "autor": "Ana Torres",
      "respondido_por": null,
      "creado_en": "2026-08-12T09:12:00",
      "actualizado_en": "2026-08-12T09:12:00"
    }
  ],
  "meta": { "current_page": 1, "per_page": 10, "total": 5, "last_page": 1 }
}
```

`autor` sale de `user_id` (relación `autor()` del modelo) y
`respondido_por` de `soporte_user_id` (relación `soporte()`).

### `POST /api/soporte/tickets`

```json
{
  "asunto": "El buscador de clientes no encuentra por DNI",
  "prioridad": "alta",
  "mensaje": "Escribo el número de documento y no sale nada, pero por nombre sí aparece."
}
```

| Campo | Reglas |
|---|---|
| `asunto` | requerido, string, máx. 150 |
| `mensaje` | requerido, string, máx. 5000 |
| `prioridad` | requerido, `baja` \| `media` \| `alta` |

El backend rellena `negocio_id`, `user_id` y `estado: "abierto"`. El negocio
**no puede** editar ni borrar tickets: el controlador solo tiene `index` y
`store`.

---

## Campos

| Campo | Tipo | Confirmado | Notas |
|---|---|---|---|
| `id` | int | ✅ | |
| `asunto` | string(150) | ✅ | |
| `mensaje` | text | ✅ | Máx. 5000 por validación |
| `respuesta` | text \| null | ✅ | La escribe el equipo de soporte |
| `estado` | enum | ✅ | `abierto` \| `en_proceso` \| `cerrado`, default `abierto` |
| `prioridad` | string(20) | ✅ | Default `media`; el controlador valida `baja\|media\|alta` |
| `user_id` | int | ✅ | Aquí `autor` |
| `soporte_user_id` | int \| null | ✅ | Aquí `respondido_por`; añadido en la migración de agosto |
| `created_at` | datetime | ✅ | Aquí `creado_en` |
| `updated_at` | datetime | ✅ | Aquí `actualizado_en` — es la fecha de la respuesta |

### `prioridad` no es un enum de verdad

La migración la declara `string(20)` con default `'media'`, no `enum`. Los
tres valores solo se garantizan por la validación del controlador. Funciona,
pero si alguien inserta desde otro sitio puede meter cualquier cosa.

### `updated_at` como fecha de la respuesta

No hay columna `respondido_en`. Uso `updated_at` para fechar el turno de
soporte, que es correcto mientras la única razón para actualizar el ticket sea
contestarlo. Si en el panel de soporte se editan otros campos, esa fecha
mentirá.

---

## Formulario de ticket

`web/src/features/soporte/components/TicketFormDialog.tsx` · diálogo `sm`

| # | Campo | Control | Ancho |
|---|---|---|---|
| 1 | Asunto | Texto | 8/12 |
| 2 | Prioridad | Select (Baja / Media / Alta) | 4/12 |
| 3 | Mensaje | Textarea de 5 filas | 12/12 |

Igual que el formulario de la app actual, con dos añadidos:

- **Contador de caracteres** bajo el mensaje (`101 / 5000`), porque el límite
  de 5000 existe en la validación pero no se avisaba en ninguna parte.
- **Placeholders** que guían qué escribir: *"Qué esperabas que pasara, qué
  pasó y desde cuándo."*

Botones: **Enviar ticket** y **Cancelar**.

---

## Diferencias con la app actual

| Elemento | En tu app | Aquí |
|---|---|---|
| Formulario | Tarjeta fija encima de la tabla, siempre visible | Modal desde "Nuevo ticket" |
| Estado y prioridad | Valor crudo de la columna (`en_proceso`) | Chips con etiqueta y color |
| Respuesta | Texto completo dentro de la celda | Dos líneas + detalle en modal |
| Mensaje enviado | **No se muestra en ningún sitio** | Se lee en el detalle |
| Autor y fechas | No se muestran (aunque se cargan con `with('autor')`) | Bajo el asunto y en el detalle |
| Filtro por estado | No hay | Cajas de conteo clicables |
| Buscador | No hay | Filtra por asunto y mensaje |
| Paginación | No hay (`->get()`) | Sí |

El detalle importante es el tercero de la lista: en la app actual, **una vez
enviado el ticket no puedes releer lo que escribiste**. La tabla muestra
asunto, prioridad, estado y respuesta, pero nunca `mensaje`. Con conversaciones
de varios días eso deja al usuario sin contexto.

---

## Cambio de infraestructura que trajo este módulo

`crearRecurso` no sabía filtrar más allá de la búsqueda de texto. Para las
cajas de conteo se añadió:

- `ListParams` acepta ahora filtros arbitrarios (`estado`, `prioridad`…) que
  viajan como query params.
- `ConfigRecurso.filtrosMock(item, params)` los resuelve en modo mock, antes
  de buscar y paginar.

Está en `web/src/lib/api/recurso.ts` y sirve para cualquier módulo: el filtro
por estado de Citas, por ejemplo, saldría igual.

---

## Pendiente

- [ ] Paginar el índice en Laravel (`->get()` → `->paginate()`)
- [ ] Aceptar los parámetros `search` y `estado` en el controlador
- [ ] Exponer `autor` y `respondido_por` en el API Resource
- [ ] ¿Se avisa al negocio cuando soporte responde? Existe la tabla
      `notificaciones` (migración de agosto) pero no está conectada aquí
- [ ] ¿El negocio puede responder de vuelta? Hoy es un solo turno: mensaje y
      respuesta. Si se quiere conversación real hace falta una tabla de
      mensajes, no dos columnas
- [ ] ¿Adjuntar capturas al ticket? Es lo primero que pide el usuario al
      reportar un fallo visual
- [ ] ¿Mostrar en algún sitio los datos de contacto directo (WhatsApp, correo)?
