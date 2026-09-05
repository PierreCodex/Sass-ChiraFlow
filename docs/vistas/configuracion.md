# Configuración

**Ruta:** `/administracion/general/{negocio,agenda,marca,sitio-publico}`
(`/configuracion` redirige a la primera; **`/configuracion/perfil` NO se mudó**)
**Estado:** ✅ **Conectada al backend** (2026-09-05), partida en cuatro secciones
**Archivos:**
- `web/src/features/configuracion/components/secciones/*.tsx` — una por sección
- `web/src/features/configuracion/hooks/useSeccion.ts` — el formulario compartido
- `web/src/features/configuracion/components/MarcoSeccion.tsx`
- `web/src/features/configuracion/components/SeccionCampos.tsx`
- `web/src/features/configuracion/components/BarraGuardado.tsx`
- `web/src/features/configuracion/components/{EnlaceTienda,BotonVerSitio}.tsx`

---

## Qué muestra

**Cuatro secciones de la vista de Administración**, una por URL:

| Sección | URL | Qué lleva |
|---|---|---|
| Datos del negocio | `/administracion/general/negocio` | nombre, zona horaria, descripción, contacto, ubicación |
| Agenda | `/administracion/general/agenda` | horario de respaldo y cómo se generan los huecos |
| Marca | `/administracion/general/marca` | logo, portada y colores |
| Sitio público | `/administracion/general/sitio-publico` | el enlace, si está encendido y los términos |

Eran **cuatro pestañas verticales** dentro de `/configuracion`. Se partieron el
2026-09-05: el shell de Administración ya lleva índice a la izquierda —el mismo
trabajo que hacían las pestañas—, así que anidarlas duplicaba la navegación.

### Cada sección guarda solo lo suyo

El `PUT` es un **parche**: llega lo que llega y se toca solo eso. Guardar
Agenda no borra el email que escribió Negocio.

La distinción que importa al mandar es entre **clave ausente** —«no lo
toques»— y **clave presente con valor vacío**, que sí escribe: por eso
`sitio_publico_activo: false` se guarda y `email: ""` vacía el campo.

Las reglas salen de un único `configuracionSchema` con `.pick()`, no de un
esquema por sección: con cuatro, la validación del intervalo o la del horario
acabarían divergiendo del backend en una sola de ellas.

### Cómo está montado (rediseño del 2026-08-22)

Antes el primer campo editable empezaba en el **píxel 566 de 900**: el 63% de
la primera pantalla ocupado por el banner de migas, la tarjeta del enlace y las
pestañas. Ahora empieza en **294**.

| Pieza | Por qué |
|---|---|
| **Pestañas verticales** en escritorio, horizontales por debajo de `md` | Escalan cuando una sección crece; las horizontales se rompen a partir de seis |
| **Subsecciones** con el rótulo y su explicación a la izquierda (`SeccionCampos`) | Diez campos seguidos no se escanean. Identidad · Contacto · Ubicación, etc. |
| **Barra de guardado pegada abajo**, solo cuando hay cambios (`BarraGuardado`) | Con 19 campos el botón quedaba enterrado al final del scroll, y al cambiar de pestaña nada avisaba de que faltaba guardar |
| **El enlace de la tienda vive en la pestaña "Sitio público"** | Ocupaba 144 px encima de todas las pestañas, incluso editando horarios. En la cabecera queda solo "Ver mi sitio", el gesto más frecuente |

**No es guardado automático a propósito.** Estos campos alimentan la tienda
pública y el cálculo de disponibilidad: un horario mal tecleado y guardado al
instante deja al negocio sin huecos sin que nadie lo haya confirmado.

⚠️ **Trampa:** la barra es `position: sticky` y `Card` de MUI lleva
`overflow: hidden`, que la convierte en su contenedor de scroll — la barra
quedaba colgada **241 px por debajo** de la pantalla. Por eso el `<form>`
envuelve a la tarjeta y no al revés. Y lleva `padding-right` extra en `sm+`
porque el `Fab` del Customizer (`right: 25px; bottom: 15px`) caía justo encima
de "Guardar cambios".

| Sección | Contiene |
|---|---|
| **Negocio** | Nombre, zona horaria, descripción, email, teléfono, WhatsApp, dirección, información adicional, latitud, longitud |
| **Agenda** | Horario de atención + cómo se generan los huecos de reserva |
| **Marca** | Logo, portada, color primario, color secundario |
| **Sitio público** | Página pública activa, marketplace, términos del servicio |

Igual que en Empleados: la pestaña con errores se marca con un punto rojo, y al
enviar el formulario salta a la primera que los tenga.

### La pestaña Agenda es la que ya estaba en uso

Estos dos ajustes **ya alimentaban el cálculo de disponibilidad** antes de que
existiera esta pantalla; vivían en un mock sin interfaz:

**Horario de atención** (`horario_apertura` / `horario_cierre`) — es el
respaldo para los profesionales sin horario propio. Ver
[calendario.md](calendario.md).

**Huecos de reserva** — cada cuánto se ofrece un turno:

| Modo | Comportamiento |
|---|---|
| Según la duración del servicio | Los inicios se encadenan: 09:00, 09:45, 10:30… |
| Cada N minutos | Rejilla fija, sin importar el servicio |

Verificado con Lic. Rosa Paredes y un servicio de 45 min:

| Modo | Huecos ofrecidos |
|---|---|
| Duración | 09:00 · 10:15 · **10:30 · 11:15** · 12:00 · 15:30 · **15:45 · 16:30 · 17:15** |
| Fijo 30 min | 09:00 · 10:15 · **10:30 · 11:00 · 11:30** · 12:00 · 15:30 · **16:00 · 16:30 · 17:00** |

> ⚠️ **`modo_intervalo` e `intervalo_min` no existen todavía en el backend.**
> Son un ajuste propio del panel. El controlador de Laravel no los valida ni
> los guarda: hay que añadirlos a `negocios.configuracion`.

---

## Endpoints

### `GET /api/configuracion`

Devuelve el negocio del usuario autenticado.

```json
{
  "data": {
    "nombre": "CLINICA EL ROSAL",
    "descripcion": "Atención médica, odontología y laboratorio…",
    "email": "contacto@elrosal.pe",
    "telefono": "01 445 8890",
    "whatsapp": "981 912 809",
    "direccion": "Av. Arequipa 1250, Lince",
    "informacion_adicional": "Estacionamiento disponible para pacientes.",
    "latitud": -5.1936,
    "longitud": -80.6328,
    "zona_horaria": "America/Lima",
    "horario_apertura": "09:00",
    "horario_cierre": "20:00",
    "color_primario": "#4f46e5",
    "color_secundario": "#06b6d4",
    "logo_url": null,
    "cover_url": null,
    "sitio_publico_activo": true,
    "mostrar_en_marketplace": false,
    "terminos_servicio": null,
    "agenda": { "modo_intervalo": "duracion_servicio", "intervalo_min": 15 }
  }
}
```

### `PUT /api/configuracion`

⚠️ **`multipart/form-data`** si se envía logo o portada, con **POST y
`_method=PUT`**.

Reglas exactas de `ConfiguracionController::update`:

| Campo | Reglas |
|---|---|
| `nombre` | required, max 150 |
| `descripcion` | nullable, max 2000 |
| `email` | nullable, email, max 150 |
| `telefono` / `whatsapp` | nullable, max 30 |
| `direccion` | nullable, max 255 |
| `informacion_adicional` | nullable, max 255 |
| `horario_apertura` / `horario_cierre` | nullable, `date_format:H:i` |
| `color_primario` / `color_secundario` | nullable, max 20 |
| `latitud` | nullable, numeric, entre -90 y 90 |
| `longitud` | nullable, numeric, entre -180 y 180 |
| `zona_horaria` | nullable, max 80 |
| `sitio_publico_activo` | nullable, boolean |
| `mostrar_en_marketplace` | nullable, boolean |
| `terminos_servicio` | nullable, max 10000 |
| `logo` | nullable, image (+svg), max 2048 KB |
| `cover` | nullable, image, max 4096 KB |

**Los campos viajan planos.** El backend reparte algunos al JSON
`negocios.configuracion`:

```
horario_apertura   → configuracion.horario.apertura      (por defecto 09:00)
horario_cierre     → configuracion.horario.cierre        (por defecto 20:00)
color_primario     → columna de `tenants` (por defecto #4f46e5)
color_secundario   → columna de `tenants` (por defecto #06b6d4)
```

El resto son columnas directas de `negocios`.

---

## Hallazgo: onboarding

Al guardar, el controlador marca pasos de un **proceso de onboarding**:

```php
$negocio->marcarPasoOnboarding('perfil_negocio', true);
$negocio->marcarPasoOnboarding('horario_local', true);
```

Existe un sistema de pasos guiados para el negocio recién creado que **no está
maquetado ni aparece en el menú**. Habrá que ver si entra en este proyecto.

---

## Pendiente

- [ ] **Añadir `modo_intervalo` e `intervalo_min` al backend**
- [ ] ¿Qué es el **marketplace**? Aparece como toggle pero no sé dónde se ve
- [ ] Las coordenadas se escriben a mano; con un mapa sería más usable
- [ ] Ver la pantalla de **onboarding** y decidir si se maqueta
- [ ] La zona horaria es texto libre: convendría un select con las de IANA
