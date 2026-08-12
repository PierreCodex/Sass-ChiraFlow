# Locales

**Ruta:** `/locales`
**Estado:** ✅ Las 4 pestañas validadas contra el código Laravel
(`feat/planes-suscripcion`)
**Archivos:**
- `web/src/app/(dashboard)/locales/page.tsx`
- `web/src/features/locales/`

**Fuente en la app actual:**
- `app/Http/Controllers/Admin/RecursoController.php` (la pantalla completa)
- `app/Http/Controllers/Admin/LocalController.php` (CRUD de locales)
- `app/Http/Controllers/Admin/LocalProfesionalController.php`
- `app/Http/Controllers/Admin/GrupoController.php`
- `database/migrations/2026_08_04_000001_create_locales_tables.php`
- `database/migrations/2026_08_04_000002_create_grupos_tables.php`
- `resources/views/admin/recursos/index.blade.php` (+ los dos partials)

---

## Sobre el nombre

En la app actual esta sección se titula **"Recursos"** y vive en
`/admin/recursos`, pero **el menú lateral dice "Locales"**. Aquí se usa
**Locales** en los dos sitios:

- Es el nombre que el usuario ya ve en el menú.
- "Recursos" es un paraguas técnico que no significa nada para el dueño.
- Las cuatro pestañas son sobre locales de todos modos: quién atiende en cada
  uno, qué servicios se ofrecen, y los grupos.

> Resuelto: "Grupos" **sí** incluye locales (`grupo_local`), así que el nombre
> de la sección se sostiene.

---

## Qué muestra

Cuatro pestañas, las mismas de `admin/recursos/index.blade.php`:

| Pestaña | Qué hace | Estado |
|---|---|---|
| Locales | CRUD de sedes | ✅ |
| Profesionales por local | Quién atiende en cada sede | ✅ |
| Servicios | Catálogo, solo lectura | ✅ |
| Grupos | CRUD de agrupaciones | ✅ |

### Pestaña Locales

Rejilla de tarjetas (no tabla), una por sede, más el botón "Agregar local".

Cada tarjeta lleva:

- Franja superior con el **color del local**, o el banner si tiene.
- Logo superpuesto, si tiene.
- Nombre + chip **"Principal"** cuando corresponde.
- Descripción pública.
- Dirección, teléfono, email y horario, cada uno con su icono.
- Acciones abajo.

### El local principal es distinto

No se puede editar ni eliminar desde aquí: su única acción es **"Editar en
Configuración"**, que lleva a `/configuracion`. Es el local del negocio y sus
datos viven en la configuración general.

El resto tiene **Editar** y **Eliminar**.

### Estados de la UI

| Estado | Qué se muestra |
|---|---|
| Cargando | 3 skeletons de tarjeta |
| Vacío | "Todavía no has registrado locales." |
| Error | Alert rojo |

---

## Endpoints

### `GET /api/locales`

```json
{
  "data": [
    {
      "id": 1,
      "nombre": "Local 1",
      "direccion": "piura",
      "descripcion_publica": "Sede principal de la clínica.",
      "telefono": "976645666",
      "email": "contacto@elrosal.pe",
      "latitud": -5.1936,
      "longitud": -80.6328,
      "color": "#763EBD",
      "horario_desde": "09:00",
      "horario_hasta": "22:30",
      "banner_url": null,
      "logo_url": null,
      "es_principal": true
    }
  ]
}
```

### `POST /api/locales` · `PUT /api/locales/{id}`

⚠️ **`multipart/form-data`** (sube banner y logo). La edición va como **POST
con `_method=PUT`**, igual que en Servicios y Empleados.

| Campo | Tipo | Notas |
|---|---|---|
| `nombre` | string | Obligatorio |
| `direccion` | string | |
| `descripcion_publica` | string | Sale en la página pública |
| `telefono` | string | |
| `email` | string | |
| `latitud` | decimal | −90 a 90 |
| `longitud` | decimal | −180 a 180 |
| `color` | string hex | |
| `horario_desde` / `horario_hasta` | `HH:mm` | |
| `banner` | File | Solo si eligió una nueva |
| `logo` | File | Solo si eligió uno nuevo |
| `_method` | `"PUT"` | Solo al editar |

`es_principal` no se envía: lo decide el backend.

### `DELETE /api/locales/{id}`

Debe **rechazar el borrado del local principal**. El frontend ya no ofrece el
botón, pero conviene protegerlo también en el servidor.

---

## Campos

| Campo | Tipo | Confirmado | Notas |
|---|---|---|---|
| `nombre` | string | ✅ | |
| `direccion` | string \| null | ✅ | Texto libre |
| `descripcion_publica` | string \| null | ✅ | |
| `telefono` | string \| null | ✅ | |
| `email` | string \| null | ✅ | |
| `latitud` / `longitud` | decimal \| null | ✅ | Para el mapa público |
| `color` | string hex | ✅ | |
| `horario_desde` / `horario_hasta` | `HH:mm` \| null | ✅ | **Un solo rango, no por día** |
| `banner_url` | string \| null | ✅ | |
| `logo_url` | string \| null | ✅ | |
| `es_principal` | bool | ✅ | Deducido del chip y de la acción distinta |

### El horario del local es un rango simple

A diferencia del empleado —que tiene horario por día con breaks y excepciones—
el local solo tiene **desde** y **hasta**. Eso responde una duda que quedaba
abierta en [calendario.md](calendario.md): el local no aporta una restricción
por día de la semana.

> En los datos reales hay un local con `21:00 – 16:07`, o sea la hora de fin
> antes que la de inicio. El formulario no lo valida (tu app tampoco). Si eso
> es un error de captura y no un horario nocturno, conviene validarlo.

### Descartado respecto a la maqueta anterior

Me había inventado `empleados_count` y `activo`. Lo primero corresponde a la
pestaña "Profesionales por local"; lo segundo no existe.

---

## Formulario

`web/src/features/locales/components/LocalFormDialog.tsx`

Campos en el orden de la app actual: Nombre del local · Dirección ·
Descripción pública · Teléfono · Email · Latitud · Longitud · Color ·
Horario desde · Horario hasta · Banner/Portada · Logo.

Botones: **Cancelar** y **Crear local** (o "Guardar cambios" al editar).

Solo el nombre es obligatorio. Las coordenadas se validan por rango.

---

## Pestaña "Profesionales por local"

`web/src/features/locales/components/ProfesionalesPorLocal.tsx`

Selector de local en chips (solo si hay más de uno) y, debajo, la tabla de
**todos los profesionales del negocio** con su configuración en ese local.

| Columna | Contenido |
|---|---|
| Profesional | Avatar con iniciales + nombre real |
| Nombre público | `nombre_publico` o `—` |
| Horario | `09:00 – 18:00`, o `—` si no tiene |
| Habilitado | Interruptor que guarda al momento |
| — | Botón de editar |

### La tabla pivote

Esto vive en `local_profesional`, con clave única `(local_id, user_id)`:

| Campo | Tipo | Notas |
|---|---|---|
| `habilitado` | bool | Default `true` **en la BD** — ojo, ver abajo |
| `nombre_publico` | string(150) \| null | Máx. 150 |
| `horario` | json \| null | `{ "apertura": "09:00", "cierre": "18:00" }` |
| `perfil` | text \| null | Máx. 2000 por validación |

**El listado devuelve una fila por cada profesional del negocio, tenga o no
fila en la pivote.** Es lo que hace `RecursoController::index`: recorre todos
los profesionales y busca su pivote; si no existe, `habilitado` sale `false`.

> Incoherencia del backend: la migración pone `->default(true)` en
> `habilitado`, pero un profesional sin fila se muestra como **no** habilitado.
> El default nunca se aplica porque la fila se crea desde el formulario, que
> siempre manda el valor. No rompe nada, pero el default engaña.

### Endpoints

#### `GET /api/locales/{local}/profesionales`

```json
{
  "data": [
    {
      "id": 2,
      "nombre": "Dra. Carmen Ríos",
      "foto_url": null,
      "habilitado": true,
      "nombre_publico": "Dra. Carmen",
      "perfil": "Médica general con 12 años de experiencia…",
      "horario_apertura": "09:00",
      "horario_cierre": "18:00"
    }
  ]
}
```

`id` es el del **profesional** (`users.id`), no el de la fila pivote.

Aplané `horario` a `horario_apertura` / `horario_cierre` porque un objeto de
dos claves no aporta nada al formulario. **El cliente lo vuelve a anidar al
enviar** (`horario[apertura]`, `horario[cierre]`), que es lo que valida
Laravel.

#### `PUT /api/locales/{local}/profesionales/{profesional}`

```json
{
  "habilitado": true,
  "nombre_publico": "Dra. Carmen",
  "perfil": "Médica general…",
  "horario": { "apertura": "09:00", "cierre": "18:00" }
}
```

| Campo | Reglas |
|---|---|
| `habilitado` | opcional, booleano |
| `nombre_publico` | opcional, string, máx. 150 |
| `perfil` | opcional, string, máx. 2000 |
| `horario.apertura` | opcional, formato `H:i` |
| `horario.cierre` | opcional, formato `H:i` |

Es un `syncWithoutDetaching`, así que **el mismo endpoint sirve para asignar
por primera vez y para editar**. No hay endpoint de "desasignar": para quitar
a alguien de un local se apaga `habilitado`.

### El horario del local NO controla la disponibilidad

Esto es importante y no es evidente: `local_profesional.horario` **no lo lee
el motor de reservas**. `ReservaController::generarHorarios` recibe solo
`(negocio, profesional, fecha)` y usa el horario del profesional, no el del
local. Ver [calendario.md](calendario.md).

O sea: este campo es informativo para la página pública. El modal lo dice
explícitamente en un aviso, para que nadie lo configure creyendo que abre o
cierra huecos de reserva.

Si la intención era que sí restrinja, hay que tocar `generarHorarios`. Es una
decisión de producto pendiente.

### El interruptor guarda al momento

Como en la app actual, cambiar "Habilitado" dispara el guardado sin pasar por
el modal. La diferencia es que allí eso se hace con un `<form>` incrustado en
la celda que reenvía los cuatro campos en inputs ocultos; aquí la mutación
manda el resto de la fila tal cual, sin duplicar el estado en el DOM.

---

## Pestaña "Servicios"

`web/src/features/locales/components/ServiciosDelNegocio.tsx`

Tabla de solo lectura: punto de color, nombre, duración y precio, más un botón
**Gestionar servicios** que lleva a `/servicios`. Idéntico en contenido a la
app actual.

> **Esta pestaña no hace nada que no haga el módulo Servicios.** No filtra por
> local ni permite editar: es un espejo del catálogo dentro de una pantalla
> que va de locales.
>
> Lo lógico sería que fuese **"qué servicios se ofrecen en cada local"**, igual
> que la pestaña de profesionales. Pero **no existe tabla `local_servicio`**,
> así que hoy eso no se puede representar. Decisión pendiente: convertirla en
> eso (con su migración) o quitarla.

---

## Pestaña "Grupos"

`web/src/features/locales/components/GruposTable.tsx` ·
`GrupoFormDialog.tsx`

Un grupo agrupa **locales + profesionales + servicios** mediante tres tablas
pivote (`grupo_local`, `grupo_profesional`, `grupo_servicio`).

| Columna | Contenido |
|---|---|
| Nombre | |
| Locales | Chips |
| Profesionales | Nombres separados por coma |
| Servicios | Cuántos |
| Acciones | Editar · Eliminar |

El Blade solo muestra la columna de locales; añadí las otras dos porque sin
ellas **no se sabe qué contiene el grupo** sin abrir el modal.

### ⚠️ Nadie usa los grupos

Busqué `Grupo` en todo el código: aparece solo en su propio controlador, su
modelo, las relaciones de `Negocio` y `Local`, y esta pantalla. **Ninguna otra
parte del sistema los consulta**: ni las citas, ni el calendario, ni la página
pública de reservas.

Es decir, hoy son un CRUD que no alimenta nada. Está maquetado y funciona,
pero antes de conectarlo conviene decidir para qué sirven. Posibilidades:

- Filtrar la página pública ("ver solo Odontología").
- Agrupar el calendario por especialidad.
- Permisos por grupo.

Si no hay un uso claro, es la primera candidata a quitar.

### Endpoints

#### `GET /api/grupos`

```json
{
  "data": [
    {
      "id": 1,
      "nombre": "Odontología",
      "locales": [{ "id": 1, "nombre": "Local 1" }],
      "profesionales": [{ "id": 3, "nombre": "Dr. Julio Mendoza" }],
      "servicios": [{ "id": 6, "nombre": "Limpieza dental" }]
    }
  ],
  "meta": { "current_page": 1, "per_page": 10, "total": 3, "last_page": 1 }
}
```

> En Laravel es un `->get()` dentro de `RecursoController`, sin paginar y sin
> endpoint propio. Aquí es un recurso normal, paginado.

#### `POST /api/grupos` · `PUT /api/grupos/{id}` · `DELETE /api/grupos/{id}`

```json
{
  "nombre": "Pediatría",
  "locales": [3],
  "profesionales": [6],
  "servicios": [4]
}
```

| Campo | Reglas |
|---|---|
| `nombre` | requerido, string, máx. 150 |
| `locales[]` | opcional, ids que existan **y sean del negocio** |
| `profesionales[]` | ídem sobre `users` |
| `servicios[]` | ídem sobre `servicios` |

Las tres listas van con `sync()`: lo que no se manda, se desasigna. Enviar un
array vacío deja el grupo sin nada de esa categoría.

La validación de pertenencia al negocio ya está bien resuelta en tu backend
(`exists:locales,id,negocio_id,{id}`), así que no hace falta tocarla.

### Formulario

Diálogo `sm`. Nombre + tres selectores de **chips**: se marcan haciendo clic,
azul relleno = seleccionado. Cada lista tiene su propio scroll cuando se pasa
de dos filas, igual que el `max-h-28` del Blade.

Elegí chips en vez de checkboxes porque con 12 servicios la lista de casillas
ocupa media pantalla y obliga a apuntar a cuadros de 16 px.

---

## Diferencias con la app actual

| Elemento | En tu app | Aquí |
|---|---|---|
| Nombre de la sección | "Recursos" | "Locales" |
| Acciones de la tarjeta | Enlaces de texto | Botones con icono |
| Eliminar | (sin confirmación visible) | Pide confirmación |
| Pestañas | Capitalización normal | Igual (se desactivó el `capitalize` de la plantilla, que producía "Profesionales Por Local") |
| Selector de local (pestaña 2) | Botones que muestran/ocultan divs ya renderados | Chips que piden los datos de ese local |
| Grupos: profesionales y servicios | No se ven en la tabla | Columnas propias |
| Grupos: selección | Listas de checkboxes | Chips seleccionables |
| Horario por local | Sin explicación | Aviso de que no afecta a las reservas |

### Todo se renderiza de golpe en el Blade

La app actual pinta las cuatro pestañas, un panel por cada local y **un modal
por cada par (local, profesional)** en el mismo HTML, y los oculta con
`hidden`. Con 3 locales y 5 profesionales son 15 modales en el DOM.

Aquí cada pestaña monta lo suyo y hay **un solo modal** que recibe la fila
seleccionada.

---

## Pendiente

- [ ] ¿Para qué sirven los grupos? Hoy no los consulta nadie
- [ ] ¿La pestaña Servicios debería ser "servicios por local"? Haría falta una
      tabla `local_servicio`
- [ ] ¿`local_profesional.horario` debería restringir la disponibilidad real?
      Hoy `generarHorarios` lo ignora
- [ ] Endpoint propio para `GET /grupos` y para los profesionales de un local
      (hoy todo sale del `index` de Recursos)
- [ ] ¿Se valida que `horario_hasta` sea posterior a `horario_desde`?
- [ ] ¿Las coordenadas se eligen en un mapa, o se escriben a mano?
- [ ] ¿El plan limita la cantidad de locales? (como el cupo de profesionales) —
      el Blade tiene un modal "Has llegado a tu límite de tu plan actual" que
      todavía no está maquetado aquí
