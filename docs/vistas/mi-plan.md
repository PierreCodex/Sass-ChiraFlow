# Mi Plan

**Ruta:** `/mi-plan`
**Estado:** ✅ Planes, precios, límites y features validados contra las
migraciones de datos (`feat/planes-suscripcion`)
**Archivos:**
- `web/src/app/(dashboard)/mi-plan/page.tsx`
- `web/src/features/suscripcion/`

**Fuente en la app actual:**
- `app/Http/Controllers/Admin/PlanController.php`
- `app/Models/Plan.php` · `Negocio::elegiblePromo()`
- `database/migrations/2026_08_09_212457_add_promociones_a_planes.php`
  (es la última que fija precios y features — las anteriores quedaron
  pisadas)
- `resources/views/admin/plan/index.blade.php`

---

## ⚠️ El botón dice "Pagar" pero no cobra nada

Esto es lo primero que hay que saber del módulo. En la app actual el botón
fijo de abajo dice **"Pagar S/ 149.00"**, pero `PlanController::solicitar`
**no procesa ningún pago**: crea un `SoporteTicket` con el desglose y
redirige con el mensaje *"Solicitud enviada. Nuestro equipo se pondrá en
contacto para activar tu plan."*

No hay pasarela de pago en el código. El flujo real es manual: el negocio
pide, soporte activa.

Aquí el botón dice **"Solicitar este plan"** y debajo lleva la aclaración
*"No se cobra nada ahora. Nuestro equipo te contacta para activarlo."*
Prometer un cobro que no ocurre erosiona la confianza justo en la pantalla
donde más falta hace.

Cuando entre la pasarela de verdad, se cambia la etiqueta y ya.

---

## Qué muestra

Dos columnas. Izquierda: los tres planes y los extras. Derecha: el resumen,
pegado al hacer scroll.

### Selector de planes

Una tarjeta por plan, con radio. Al hacer clic en cualquier parte de la
tarjeta se selecciona.

| Elemento | Contenido |
|---|---|
| Nombre | + chip "Actual" si es el contratado, + chip "Popular" si `destacado` |
| Descripción | Texto comercial (ver abajo) |
| Límites | "Incluye 5 profesionales · locaciones ilimitadas · 100 mensajes WhatsApp/mes" |
| Precio | Con promo: el mensual tachado + el promocional + "/mes los primeros 3 meses" |
| Features | Lista de dos columnas con check verde |

**Preselección:** el plan contratado; si el negocio está en prueba (no tiene
plan), el `destacado`. El Blade siempre arranca en el primero de la lista, que
es el más barato.

### Extras

Dos contadores con `−` / `+`, tope 100 (el máximo de la validación).

| Extra | Precio | Efecto |
|---|---|---|
| Profesional extra | S/ 11.00 c/u | +1 al cupo de profesionales |
| Paquete de WhatsApp | S/ 17.00 | +50 mensajes al mes |

Debajo de cada contador, el resultado en vivo: *"Tu plan ahora cuenta con 6
profesionales"* / *"…con 150 mensajes al mes"*.

**Los precios y el tamaño del paquete salen del plan seleccionado**, no son
constantes: al cambiar de plan se recalculan los textos y el total. Hoy los
tres planes tienen los mismos valores (11 / 17 / 50), pero el esquema permite
que difieran y la UI ya lo respeta.

### Resumen

Nombre del plan, precio, chip de promo si aplica, lista de features, desglose
de extras y **total mensual**. Los extras solo aparecen si son > 0.

```
Premium                    S/ 9.00 /mes
[Precio de lanzamiento por 3 meses]

Además incluye
✓ Agenda …

Extras añadidos
1 profesional extra        S/ 11.00
1 paquete de WhatsApp      S/ 17.00
─────────────────────────────────
Total mensual              S/ 37.00
```

---

## Los tres planes

Valores de la última migración de datos. Ojo: hay **cuatro migraciones que
pisan los mismos registros**; la que manda es
`2026_08_09_212457_add_promociones_a_planes`.

| | Básico | Premium | Pro |
|---|---|---|---|
| Precio mensual | S/ 99 | S/ 149 | S/ 449 |
| Precio anual | S/ 990 | S/ 1 490 | S/ 4 490 |
| **Promo** | S/ 9 × 3 meses | S/ 9 × 3 meses | — |
| Profesionales | 2 | 5 | 15 |
| Locaciones | 1 | ilimitadas | ilimitadas |
| WhatsApp/mes | 0 | 100 | 500 |
| Destacado | | ✅ | |

`max_sucursales` usa **999 como centinela de "ilimitadas"**, no null. La UI lo
traduce (`esIlimitado()` en `types.ts`).

### La promo solo aplica en prueba

`Negocio::elegiblePromo()` devuelve `$this->estado === 'prueba'`. O sea: el
precio de S/ 9 lo ve **únicamente** quien todavía no ha pagado nunca. En cuanto
el negocio pasa a activo, ve S/ 99 / S/ 149.

Es una decisión de negocio razonable (promo de captación), pero conviene
tenerla presente: un cliente que renueva no la ve, y si alguien pregunta "¿por
qué a mí me sale otro precio?", la respuesta está aquí.

El frontend recibe `elegible_promo` como booleano en `GET /api/suscripcion` en
vez de replicar la regla.

### Features por plan

Básico (11): `agenda`, `agenda_online`, `gestion_clientes`, `recordatorios`,
`notificaciones_alertas`, `dashboard_stats`, `caja`, `inventario`, `whatsapp`,
`sitio_publico`, `subdominio`.

Premium (18) = Básico + `multi_sede`, `encuesta_satisfaccion`,
`ficha_personal`, `giftcard`, `presupuestos`, `historial_producto`,
`soporte_prioritario`.

Pro (25) = Premium + `dominio_personalizado`, `reportes_avanzados`,
`exportaciones`, `backups`, `api`, `soporte_telefonico`,
`asesoria_personalizada`.

**Las etiquetas viven en el frontend** (`features/suscripcion/constants.ts`),
copiadas del array `$featureLabels` del Blade. Son texto de marketing, no
datos: el backend solo guarda las claves.

> El Blade tiene un fallback (`str_replace('_',' ', ucfirst($feature))`) para
> claves sin etiqueta. Lo repliqué, porque si mañana se añade una feature en
> la BD la pantalla no debería romperse ni mostrar `soporte_24_7` en crudo.

---

## Endpoints

### `GET /api/planes`

Ordenados por `precio_mensual`, como en Laravel.

```json
{
  "data": [
    {
      "id": 2,
      "nombre": "Premium",
      "slug": "premium",
      "descripcion": "Más seguimiento, mejor atención, mayor control, personalización de tu sitio",
      "precio_mensual": 149,
      "precio_anual": 1490,
      "precio_promo": 9,
      "promo_duracion_meses": 3,
      "promo_activa": true,
      "max_profesionales": 5,
      "max_sucursales": 999,
      "max_whatsapp_mes": 100,
      "precio_profesional_extra": 11,
      "precio_whatsapp_extra": 17,
      "mensajes_whatsapp_extra": 50,
      "destacado": true,
      "features": ["agenda", "agenda_online"]
    }
  ]
}
```

**`descripcion` no está en la tabla `planes`.** Hoy el Blade la decide con un
ternario anidado según el slug:

```php
$plan->slug === 'basico' ? 'Toma el control de tu negocio'
  : ($plan->slug === 'premium' ? 'Más seguimiento…' : 'Integraciones…')
```

Eso significa que un plan nuevo hereda el texto de "Pro" sin que nadie lo
note. Debería ser una columna. Mientras tanto el mock la trae como campo, que
es como debería llegar.

### `GET /api/suscripcion`

```json
{
  "data": {
    "estado": "prueba",
    "plan": null,
    "dias_restantes": 5,
    "renueva_el": null,
    "extra_profesionales": 0,
    "extra_whatsapp": 0,
    "elegible_promo": true
  }
}
```

`extra_profesionales` y `extra_whatsapp` están en la tabla `negocios`
(migración `2026_08_08_084032`). Se precargan en los contadores al abrir la
pantalla, para que el usuario vea lo que ya tiene contratado en vez de
empezar de cero.

### `POST /api/plan/{plan}/solicitar`

```json
{ "extra_profesionales": 1, "extra_whatsapp": 1 }
```

| Campo | Reglas |
|---|---|
| `extra_profesionales` | opcional, entero, 0–100 |
| `extra_whatsapp` | opcional, entero, 0–100 |

Crea un ticket con asunto *"Solicitud de cambio de plan: Premium"* y el
desglose línea a línea, incluido el total. **No cambia `negocio.plan_id`.**

### `POST /api/plan/extras`

Existe en el controlador pero **el Blade no lo usa**: el formulario siempre
manda todo a `solicitar`.

La diferencia es que `extras` **sí** actualiza `negocio.extra_profesionales` y
`extra_whatsapp` de inmediato, y luego abre el ticket de facturación. Valida
los dos campos como `required`.

Queda por decidir si hace falta: si el negocio solo quiere sumar un
profesional sin cambiar de plan, este es el endpoint correcto. Hoy esa acción
no tiene botón.

---

## Diferencias con la app actual

| Elemento | En tu app | Aquí |
|---|---|---|
| Botón principal | "Pagar S/ X" (no cobra) | "Solicitar este plan" + aclaración |
| Barra inferior | Fija, tapa contenido | Botón dentro del resumen pegajoso |
| Plan preseleccionado | Siempre el más barato | El contratado, o el destacado |
| Extras ya contratados | No se precargan | Sí, desde `negocios` |
| Confirmación | Flash de sesión tras recargar | Alert con enlace al ticket en Soporte |
| Resumen | Tarjeta oscura `slate-800` | Tarjeta del tema, pegajosa |
| Estado de la petición | — | Botón deshabilitado + "Enviando…" |
| Plurales | "1 extras", "1 paquetes" | "1 extra", "1 paquete" |

El resumen del Blade se mantiene sincronizado con ~15 `document.getElementById`
en un `<script>` al final. Aquí es estado de React: seleccionar plan y mover
contadores recalcula todo solo.

---

## Lo que se corrigió del módulo `suscripcion`

Este módulo ya existía a medias, del banner de prueba. Su tipo `Plan` **me lo
había inventado**: Básico / Profesional / Empresarial a 49 / 89 / 149, sin
límites ni features. Queda reemplazado por el real.

`usePlanes()` no lo usaba nadie todavía, así que el cambio no rompió nada.

---

## Pendiente

- [ ] **Pasarela de pago.** Hoy todo el flujo termina en un ticket manual
- [ ] `descripcion` debería ser columna de `planes`, no un ternario por slug
- [ ] ¿Se usa `precio_anual`? Está en la tabla y en el modelo, pero **ninguna
      pantalla ofrece el cobro anual**. Falta el conmutador mensual/anual
- [ ] ¿Hace falta un botón que use `POST /plan/extras` (ampliar sin cambiar
      de plan)?
- [ ] Consolidar las 4 migraciones que pisan los mismos planes en un seeder
- [ ] ¿Qué pasa al bajar de plan si el negocio tiene más profesionales o
      locales que el cupo nuevo? No hay validación en `solicitar`
- [ ] El cupo de profesionales ya se valida en Empleados; conectar el mismo
      contador con `max_profesionales + extra_profesionales`
