# Configuración

**Ruta:** `/configuracion`
**Estado:** ✅ Validado contra el código Laravel
**Archivos:**
- `web/src/app/(dashboard)/configuracion/page.tsx`
- `web/src/features/configuracion/`

---

## Qué muestra

Un solo formulario con **cuatro pestañas**. Son 19 campos: en una sola columna
sería inmanejable.

| Pestaña | Contiene |
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
    "color_primario": "#7c3aed",
    "color_secundario": "#0ea5e9",
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
color_primario     → configuracion.marca.color_primario  (por defecto #7c3aed)
color_secundario   → configuracion.marca.color_secundario (por defecto #0ea5e9)
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
