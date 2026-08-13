# WhatsApp

**Ruta:** `/whatsapp`
**Estado:** ✅ Eventos, variables y plantillas validados contra el código
Laravel (`feat/planes-suscripcion`)
**Archivos:**
- `web/src/app/(dashboard)/whatsapp/page.tsx`
- `web/src/features/whatsapp/`

**Fuente en la app actual:**
- `app/Http/Controllers/Admin/PlantillaWhatsappController.php`
- `app/Models/PlantillaWhatsapp.php` (eventos, variables y prediseñadas)
- `app/Services/WhatsAppMensajeService.php` (renderizado y enlace)
- `database/migrations/2026_08_07_000007_create_plantilla_whatsapps_table.php`
- `resources/views/admin/plantillas-whatsapp/` (index, create, edit, _form)

---

## Qué muestra

### Presentación

Tarjeta de entrada con el propósito del módulo y dos botones: **Ver
prediseñadas** y **Nueva plantilla**. Equivale al "hero" de la app actual,
sin la captura de teléfono ni el enlace "Ver un video" (que apunta a `#`).

### Tabla de plantillas

| Columna | Contenido |
|---|---|
| Evento | Etiqueta legible del evento |
| Nombre | Cómo se reconoce en la agenda |
| Vista previa | Dos líneas del contenido, con las variables **sin** reemplazar |
| Estado | Chip verde "Activa" / gris "Inactiva" |
| Acciones | Editar · Eliminar |

Buscador por nombre y contenido (el Blade no tiene).

### Galería de prediseñadas

Las 8 plantillas de `PlantillasPredisenadas()`, cada una con su contenido **ya
renderizado con los datos de ejemplo** — así se ve el mensaje final, no
`{{cliente}}`. Las que ya tienen plantilla en ese evento llevan el chip "Ya la
tienes".

Al elegir una, se abre el formulario con nombre, evento y contenido
precargados.

### Editor

Dos columnas: edición a la izquierda, vista previa y prueba a la derecha.

| Campo | Control | Notas |
|---|---|---|
| Nombre del mensaje | Texto | Máx. 100 |
| Evento | Select de 9 | Avisa si ya está ocupado (ver abajo) |
| Variables | 16 chips en 3 grupos | Se insertan **en la posición del cursor** |
| Personaliza el mensaje | Textarea de 7 filas | Contador `n / 2000` |
| Plantilla activa | Switch | **Solo al editar**, igual que el Blade |

---

## Un evento, una plantilla

Esto es lo más importante del módulo y no es evidente en la interfaz actual.

`plantilla_whatsapps` tiene **índice único `(negocio_id, evento)`**, y
`store()` usa:

```php
PlantillaWhatsapp::updateOrCreate(
    ['negocio_id' => $negocio->id, 'evento' => $datos['evento']],
    $datos
);
```

O sea: crear una plantilla para un evento que ya tiene una **la sobrescribe
sin preguntar**. En la app actual el usuario escribe un mensaje nuevo, lo
guarda, y el anterior desaparece sin ningún aviso.

Aquí el formulario detecta el choque y avisa antes de guardar:

> ⚠️ Ya existe una plantilla para este evento (**Confirmación de reserva**).
> Solo puede haber una por evento: al guardar, esta la reemplaza.

El mock replica el `updateOrCreate` (`whatsapp.api.ts`), para no dar la falsa
impresión de que se pueden acumular.

`update()` hace algo distinto y también conviene saberlo: si cambias el evento
de una plantilla a uno ya ocupado, **no** borra la otra — la **desactiva**
(`activo = false`). Dos comportamientos distintos para el mismo conflicto.

---

## Las variables

16 variables en 3 grupos, de `PlantillaWhatsapp::variables()`:

| Grupo | Claves |
|---|---|
| Datos de la reserva | `cliente`, `apellido`, `profesional`, `servicio`, `monto`, `duracion`, `fecha`, `hora` |
| Datos del local | `negocio`, `direccion`, `telefono`, `email` |
| Datos de la compañía | `url_agenda`, `instagram`, `facebook`, `web` |

Se escriben `{{clave}}` y se reemplazan con `str_replace` en
`WhatsAppMensajeService::renderizarConDatos`.

**Se insertan en la posición del cursor**, no al final: puedes escribir "Hola
, tu cita…", poner el cursor tras "Hola " y pulsar *Nombre cliente*. El Blade
hace lo mismo con `insertarVariable()`; se replicó el comportamiento porque es
lo que hace usable el editor.

> `instagram`, `facebook` y `web` salen **hardcodeadas** en
> `datosDesdeCita()`: `@mitienda`, `facebook.com/mitienda`. Solo `web` intenta
> leer `$negocio->web`. Si esas variables se ofrecen al usuario, deberían venir
> de la configuración del negocio o no ofrecerse.

### Datos de muestra

La vista previa usa los mismos valores fijos que
`WhatsAppMensajeService::datosMuestra()`: Juan, Pérez, María, Consulta,
11/03/2023, 9:00, "Tu compañía", 50.00, 60 min…

En Laravel también son constantes, no datos reales del negocio. Con el backend
conectado convendría que al menos `negocio`, `direccion` y `telefono` salieran
de la configuración: ver el nombre real en la vista previa ayuda más que "Tu
compañía".

---

## Endpoints

### `GET /api/plantillas-whatsapp`

Paginado (20 en Laravel, ordenado por `evento`), con `search`.

```json
{
  "data": [
    {
      "id": 1,
      "nombre": "Confirmación de reserva",
      "evento": "confirmacion",
      "contenido": "¡Hola {{cliente}}! Tu reserva en {{negocio}} para {{servicio}} el {{fecha}} a las {{hora}} fue confirmada.",
      "activo": true
    }
  ],
  "meta": { "current_page": 1, "per_page": 10, "total": 4, "last_page": 1 }
}
```

### `POST /api/plantillas-whatsapp` · `PUT /api/plantillas-whatsapp/{id}`

```json
{
  "nombre": "Recordatorio del día anterior",
  "evento": "recordatorio",
  "contenido": "Hola {{cliente}}, te recordamos tu cita…",
  "activo": true
}
```

| Campo | Reglas |
|---|---|
| `nombre` | requerido, string, máx. 100 |
| `evento` | requerido, una de las 9 claves |
| `contenido` | requerido, string, máx. 2000 |
| `activo` | booleano — **solo en `update`** |

En `store` el backend fuerza `activo = true`, así que el switch no aparece al
crear. Es fiel al Blade, que también lo oculta con `@if(isset($plantilla))`.

### `DELETE /api/plantillas-whatsapp/{id}`

Al borrar, ese evento vuelve al texto por defecto de
`WhatsAppMensajeService::mensajePorDefecto()` — que solo existe para
`confirmacion`, `recordatorio`, `cancelacion` y `finalizado`. Para los otros
cinco eventos devuelve `null` y **no se envía nada**.

El diálogo de confirmación lo menciona.

### Prueba de envío — resuelta en el cliente

En Laravel es `POST /plantillas-whatsapp/enviar-prueba`, que responde con
`redirect()->away('https://api.whatsapp.com/send?phone=…&text=…')`.

Redirigir la SPA entera para acabar en WhatsApp no tiene sentido, así que el
enlace se arma en el cliente con la misma fórmula que
`WhatsAppMensajeService::enlace()` (quitar todo lo que no sea dígito,
`encodeURIComponent` del mensaje) y se abre en otra pestaña.

**Ese endpoint no hace falta en la API.**

---

## Campos

| Campo | Tipo | Confirmado | Notas |
|---|---|---|---|
| `id` | int | ✅ | |
| `nombre` | string(100) | ✅ | |
| `evento` | string(40) | ✅ | 9 valores; **no es enum**, es string |
| `contenido` | text | ✅ | Máx. 2000 por validación |
| `activo` | bool | ✅ | Default `true` |

Único: `(negocio_id, evento)`.

### Los 9 eventos

`confirmacion` · `recordatorio` · `cancelacion` · `finalizado` ·
`bienvenida` · `pago_linea` · `redes_sociales` · `cumpleanos` ·
`personalizado`

**Solo los 4 primeros se envían solos.** `WhatsAppMensajeService::paraEvento()`
es el único punto de entrada y lo llaman los flujos de cita. Los otros cinco
(`bienvenida`, `pago_linea`, `redes_sociales`, `cumpleanos`, `personalizado`)
se pueden crear pero **nada los dispara**: quedarían para envío manual desde
la reserva.

Conviene decidirlo: o se enganchan a algo (cumpleaños ↔ el campo de fecha de
nacimiento del cliente, bienvenida ↔ alta de cliente), o se marcan en la UI
como "envío manual" para no prometer un automatismo que no existe.

### `personalizado` no tiene prediseñada

Las prediseñadas son 8 y los eventos 9: falta `personalizado`, que es
justamente el que se usa para escribir desde cero. Es coherente.

---

## Diferencias con la app actual

| Elemento | En tu app | Aquí |
|---|---|---|
| Crear/editar | Páginas aparte (`/create`, `/edit`) | Modal |
| Choque de evento | Sobrescribe en silencio | Avisa antes de guardar |
| Prediseñadas | Modal con enlaces a `?predisenada=key` | Galería con el mensaje renderizado |
| Prediseñadas ya usadas | No se distinguen | Chip "Ya la tienes" |
| Vista previa | Texto sobre `images/23324aa.png` | Burbuja en CSS |
| Prueba de envío | Redirección del servidor | Enlace abierto en pestaña nueva |
| Contador de caracteres | No hay (el límite es 2000) | `n / 2000` |
| Buscador | No hay | Por nombre y contenido |
| Eliminar | `confirm()` del navegador | Diálogo con la consecuencia explicada |

La vista previa en CSS en vez de imagen tiene tres ventajas concretas: no
depende de un asset, se adapta al ancho del diálogo y funciona en modo
oscuro.

---

## Relación con el plan

El cupo de mensajes vive en el plan: `max_whatsapp_mes` (0 / 100 / 500) más
los paquetes extra de 50 que se contraten en [Mi Plan](mi-plan.md).

**Esta pantalla no muestra el consumo.** No hay contador de mensajes enviados
en el mes ni tabla de envíos en la base: `max_whatsapp_mes` se define pero
nada lo descuenta ni lo comprueba. Un negocio en plan Básico (0 mensajes)
puede crear plantillas sin ningún aviso de que no se enviarán.

Es el hueco más visible del módulo.

---

## Pendiente

- [ ] **Contador de consumo**: cuántos mensajes van este mes contra el cupo
      del plan. Hoy no hay ni tabla de envíos
- [ ] Bloquear o avisar cuando el plan tiene `max_whatsapp_mes = 0`
- [ ] ¿Qué dispara `bienvenida`, `pago_linea`, `redes_sociales` y
      `cumpleanos`? Hoy nada
- [ ] `instagram`, `facebook` y `web` están hardcodeadas en el servicio
- [ ] Los datos de muestra deberían usar el nombre real del negocio
- [ ] Unificar el conflicto de evento: `store` sobrescribe, `update`
      desactiva la otra
- [ ] ¿Envío manual desde la ficha de la cita? El texto del hero lo promete
      ("Podrás enviar los mensajes predefinidos desde la reserva")
- [ ] ¿Se integra con la API de WhatsApp Business, o siempre es `wa.me`
      abierto a mano? Hoy es lo segundo
