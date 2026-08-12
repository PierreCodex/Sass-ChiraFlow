# Empleados

**Ruta:** `/empleados`
**Estado:** ✅ Campos validados contra la app actual (capturas del 09/08/2026)
**Archivos:**
- `web/src/app/(dashboard)/empleados/page.tsx`
- `web/src/features/empleados/`

---

## Qué muestra

Dos bloques: la tarjeta del cupo del plan (con el botón de alta), y debajo la
tabla del personal.

### Tarjeta de cupo

> **Profesionales activos en tu plan**
> **3 de 5** ▓▓▓▓▓░░░ `[+ Nuevo empleado]`

Solo los empleados con **rol profesional y activos** consumen cupo. En la
captura hay 4 filas pero el contador dice 3, porque el dueño no cuenta.

Al llegar al tope aparece un chip "Límite alcanzado" y un enlace a `/mi-plan`.

### Columnas de la tabla

| Columna | Contenido |
|---|---|
| Profesional | Avatar (foto o inicial) + nombre |
| Usuario | Usuario de acceso |
| Rol | Etiqueta del rol |
| Cargo | Texto libre, o `-` |
| Estado | Chip verde "Activo" / gris "Inactivo" |
| Acciones | Editar (lápiz) y eliminar (papelera) |

### Estados de la UI

| Estado | Qué se muestra |
|---|---|
| Cargando | 5 skeletons de fila; la tarjeta muestra skeleton y barra indeterminada |
| Vacío | "No se encontraron empleados." |
| Error | Alert rojo |

---

## Endpoints

### `GET /api/empleados`

Parámetros: `page`, `per_page`, `search` (filtra por nombre, usuario y cargo)

```json
{
  "data": [
    {
      "id": 2,
      "nombre": "Dra. Carmen Ríos",
      "foto_url": "https://.../fotos/carmen.jpg",
      "usuario": "criosr",
      "rol": "profesional",
      "cargo": "doctor cirujano",
      "email": "carmen.rios@elrosal.pe",
      "telefono": "987 441 220",
      "tipo_pago": "comision",
      "comision_porcentaje": 30,
      "activo": true
    }
  ],
  "meta": { "current_page": 1, "per_page": 10, "total": 6, "last_page": 1 }
}
```

Nunca devuelvas la contraseña, ni siquiera hasheada.

### `GET /api/empleados/resumen`

Alimenta la tarjeta del cupo.

```json
{
  "data": {
    "profesionales_activos": 3,
    "limite_profesionales": 5
  }
}
```

> Si prefieres ahorrarte esta request, se puede devolver dentro de
> `GET /api/empleados` con `->additional(['resumen' => [...]])`. Avísame y
> cambio el frontend.

### `POST /api/empleados` · `PUT /api/empleados/{id}`

⚠️ **`multipart/form-data`** (sube la foto). La edición va como **POST con
`_method=PUT`**, igual que en Servicios.

| Campo | Tipo | Notas |
|---|---|---|
| `nombre` | string | Obligatorio |
| `foto` | File | Solo si eligió una nueva |
| `usuario` | string | Obligatorio, único |
| `password` | string | Obligatoria al crear; **vacía al editar = no cambiar** |
| `rol` | enum | `dueno` · `administrador` · `profesional` |
| `cargo` | string | Texto libre |
| `activo` | 1 / 0 | |
| `tipo_pago` | enum | `comision` · `sueldo` · `sueldo_comision` |
| `comision_porcentaje` | decimal | 0 a 100 |
| `monto_sueldo` | decimal | Vacío si el tipo no incluye sueldo |
| `periodo_pago` | enum | Vacío si el tipo no incluye sueldo |
| `horario[0][dia]` … | ver abajo | Los 7 días, indexados |
| `excepciones[0][fecha]` … | ver abajo | |
| `_method` | `"PUT"` | Solo al editar |

**Arrays y objetos anidados en FormData.** Como sube foto, todo va en
multipart, y los arrays se envían **indexados**, no con `[]`:

```
horario[0][dia]=1
horario[0][activo]=1
horario[0][desde]=09:00
horario[0][hasta]=18:00
horario[0][breaks][0][desde]=13:00
horario[0][breaks][0][hasta]=14:00
horario[1][dia]=2
...
excepciones[0][fecha]=2026-08-10
excepciones[0][disponible]=0
excepciones[0][nota]=Permiso por emergencia familiar
```

Laravel lo parsea directo a arrays anidados. Lo genera `aFormData()` en
`web/src/lib/api/form-data.ts`.

**Validación de cupo:** el backend debe rechazar el alta de un profesional si
el plan está lleno. Un 422 con `{"errors": {"rol": ["Alcanzaste el límite de
profesionales de tu plan."]}}` se pinta solo en el campo Rol.

### `DELETE /api/empleados/{id}`

---

## Campos

| Campo | Tipo | Confirmado | Notas |
|---|---|---|---|
| `nombre` | string | ✅ | |
| `foto_url` | string \| null | ✅ | Si falta, se muestran las iniciales |
| `usuario` | string | ✅ | Credencial de acceso |
| `rol` | enum | ⚠️ | Ver abajo |
| `cargo` | string \| null | ✅ | Texto libre: "DOCTOR", "doctor cirujano", "Dueño" |
| `email` | string \| null | ✅ | En el formulario, no en la tabla |
| `telefono` | string \| null | ✅ | En el formulario, no en la tabla |
| `activo` | bool | ✅ | Checkbox en el formulario de edición |
| `tipo_pago` | enum | ⚠️ | `comision` · `sueldo` · `sueldo_comision` — ver abajo |
| `comision_porcentaje` | decimal | ✅ | |
| `monto_sueldo` | decimal \| null | ✅ | Solo si el tipo incluye sueldo |
| `periodo_pago` | enum \| null | ⚠️ | `semanal` · `quincenal` · `mensual` |
| `horario` | array | ✅ | 7 elementos, uno por día |
| `excepciones` | array | ✅ | Puede venir vacío |

### `horario[]`

```json
{
  "dia": 1,
  "activo": true,
  "desde": "09:00",
  "hasta": "18:00",
  "breaks": [{ "desde": "13:00", "hasta": "14:00" }]
}
```

`dia` va de 1 (lunes) a 7 (domingo), formato ISO-8601. Se envían **siempre los
7 días**, con `activo: false` los que no se trabajan.

### `excepciones[]`

```json
{
  "fecha": "2026-08-13",
  "disponible": false,
  "desde": null,
  "hasta": null,
  "nota": "Permiso por emergencia familiar"
}
```

Con `disponible: true`, **`desde` y `hasta` reemplazan el horario de ese día**:

```json
{
  "fecha": "2026-08-14",
  "disponible": true,
  "desde": "09:00",
  "hasta": "13:00",
  "nota": "Medio turno"
}
```

Una excepción no solo quita disponibilidad: también puede añadirla con otro
horario. El formulario muestra los campos de hora solo cuando es `Disponible`.

---

## ⚠️ Formato real del horario en Laravel

El frontend trabaja con un **array de 7 días**, que es lo cómodo para
renderizar. Laravel lo guarda distinto, en la columna JSON `users.horario`:

```json
{
  "dias": {
    "lunes":  { "activo": true, "inicio": "09:00", "fin": "18:00",
                "breaks": [{ "inicio": "13:00", "fin": "14:00" }] },
    "martes": { "activo": true, "inicio": "09:00", "fin": "18:00", "breaks": [] }
  },
  "excepciones": [
    { "fecha": "2026-08-14", "activo": true,
      "inicio": "09:00", "fin": "13:00", "nota": "Medio turno" }
  ]
}
```

Tres diferencias con el formato del frontend:

| Concepto | Frontend | Laravel |
|---|---|---|
| Días | Array, `dia: 1..7` | Objeto, claves `lunes`…`domingo` sin tilde |
| Horas | `desde` / `hasta` | `inicio` / `fin` |
| Excepción disponible | `disponible` | `activo` |
| Excepciones | Campo aparte | **Dentro** del mismo JSON `horario` |

**Al conectar hace falta un adaptador** en
`features/empleados/services/empleados.api.ts` que traduzca en ambos sentidos.
No conviene cambiar el formato del frontend: el array indexado es lo que hace
simple el `useFieldArray` del formulario.

### `tipo_pago` y `periodo_pago` — confirmados a medias

De tus capturas saqué **"Por comisión"** y **"Sueldo + comisión"**. Añadí
**"Sueldo fijo"** por lógica, pero no lo he visto. Igual con el período: solo vi
**"Quincenal"**, y añadí semanal y mensual.

Si alguno sobra o falta, se cambia en
`web/src/features/empleados/constants.ts` y el formulario se adapta solo.

### `rol` — valores

De la tabla saqué `profesional` y `dueno`; del select del formulario,
`Administrador`. Los modelé como `dueno` · `administrador` · `profesional`
(`web/src/features/empleados/constants.ts`).

**Pendiente:** ¿hay más? ¿"recepcionista", "asistente"? Y sobre todo: ¿qué
permisos tiene cada uno? Eso define qué módulos ve cada usuario en el menú.

En la tabla muestro la etiqueta capitalizada ("Dueño", "Profesional") en vez
del valor crudo ("dueno", "profesional") que muestra tu app.

### Descartado respecto a la maqueta anterior

Me había inventado `local` (el empleado no se asigna a una sede en este
formulario) y `citas_mes`. El `horario` sí existe, pero no como el texto plano
que había puesto: es una estructura por día con breaks. **De aquí sale la
disponibilidad que necesita el Calendario.**

---

## Formulario (crear y editar)

`web/src/features/empleados/components/EmpleadoFormDialog.tsx`

El formulario tiene ~10 campos base, 7 días de horario con breaks anidados y N
excepciones. En un scroll único es inmanejable, así que está dividido en
**tres pestañas** dentro del mismo modal.

### Pestaña 1 · Datos

| Campo | Control | Obligatorio |
|---|---|---|
| Nombre | Texto | Sí |
| Foto del profesional | Selector de 1 imagen | No |
| Usuario | Texto | Sí |
| Contraseña | Password | Sí al crear |
| Email | Email | No |
| Teléfono | Texto | No |
| Rol | Select | Sí |
| Cargo | Texto | No |
| Activo | Checkbox | — |

### Pestaña 2 · Pago

| Campo | Control | Se muestra cuando |
|---|---|---|
| Tipo de pago | Select | Siempre |
| % comisión | Número `%` | Tipo incluye comisión |
| Monto sueldo | Número `S/` | Tipo incluye sueldo |
| Período | Select | Tipo incluye sueldo |

Los campos de sueldo aparecen y desaparecen según el tipo elegido, y solo se
envían si aplican. Con "Por comisión", `monto_sueldo` y `periodo_pago` van
`null`.

### Pestaña 3 · Horario

**Horario semanal** — una tarjeta por día (lunes a domingo):

- Checkbox para activar el día. Si está apagado, las horas y los breaks quedan
  deshabilitados y atenuados.
- Hora de inicio y fin (`input[type=time]`, con el reloj nativo del navegador).
- **Breaks / descansos**: lista con "+ Agregar break" y una X para quitar cada
  uno. Es un field array anidado dentro de cada día.

**Excepciones** — permisos, emergencias o medio turno en una fecha concreta:
Fecha · ¿Disponible? · Nota · Quitar, más "+ Agregar excepción".

### Errores repartidos entre pestañas

El riesgo obvio de las pestañas es que una validación quede escondida. Dos
medidas:

1. Cada pestaña con errores muestra un **punto rojo** junto al título.
2. Al enviar, el formulario **salta automáticamente** a la primera pestaña con
   errores.

Verificado: con el nombre vacío y estando en la pestaña Horario, al pulsar
Actualizar salta a Datos y marca el punto.

Botones: **Guardar** al crear, **Actualizar** al editar, y **Cancelar**.

### Contraseña

- **Al crear:** obligatoria, mínimo 6 caracteres.
- **Al editar:** el campo aparece vacío con el placeholder *"Dejar vacío para
  no cambiarla"*. Si se deja vacío, se envía `null` y el backend no debe tocar
  la contraseña.

El mínimo de 6 caracteres solo se comprueba si hay algo escrito; si no, un
campo vacío mostraría "Mínimo 6 caracteres" en lugar de "es obligatoria".

---

## Diferencias con la app actual

| Elemento | En tu app | Aquí |
|---|---|---|
| Buscador | Input + botón "Buscar" | Filtra mientras escribes |
| Acciones | Enlaces de texto | Botones de icono con tooltip |
| Rol en la tabla | Valor crudo (`dueno`) | Etiqueta (`Dueño`) |
| Cupo del plan | Texto "3 de 5" | Añadí barra de progreso y aviso al llegar al tope |
| Formulario | Página `/empleados/create` con scroll largo | Modal con 3 pestañas |
| Eliminar | (sin confirmación visible) | Pide confirmación |
| Horas | `09:00 a. m.` (12 h) | `09:00` (24 h, input nativo) |

Sobre las horas: el `input[type=time]` nativo muestra 12 o 24 horas según la
configuración del sistema operativo del usuario. El valor que viaja es siempre
`HH:mm` en 24 h.

---

## Pendiente

- [ ] **Lista completa de roles y qué permisos tiene cada uno**
- [ ] Confirmar tipos de pago: ¿existe "Sueldo fijo"?
- [ ] Confirmar períodos: ¿solo quincenal, o también semanal y mensual?
- [ ] ¿Se valida que los breaks caigan dentro de la jornada del día?
- [ ] ¿Se pueden solapar dos breaks del mismo día?
- [ ] ¿El empleado se asigna a un local? No aparece en este formulario
- [ ] ¿Qué pasa al eliminar un empleado con citas asignadas?
