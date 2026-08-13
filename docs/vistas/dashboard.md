# Dashboard

**Ruta:** `/`
**Estado:** ✅ Fiel a la app actual (construido desde captura de `localhost:8080/admin`)
**Archivos:**
- `web/src/app/(dashboard)/page.tsx`
- `web/src/features/dashboard/`

---

## Qué muestra

Resumen del día. De arriba a abajo: el banner de prueba gratuita (ver
[suscripcion.md](suscripcion.md)), una fila de 4 KPIs, y debajo dos tarjetas —
la gráfica de ventas de la semana y la lista de citas de hoy.

### Elementos

| Elemento | Componente | Descripción |
|---|---|---|
| Enlace de la tienda | `EnlaceTiendaDashboard.tsx` | URL pública + Ver mi sitio · Copiar · Compartir |
| KPIs | `StatsCards.tsx` | Citas hoy, Pendientes, Clientes, Ingresos hoy |
| Gráfica | `VentasChart.tsx` | Barras, ventas de los últimos 7 días |
| Lista | `CitasDeHoy.tsx` | Citas del día con hora, cliente, servicio y estado |

Los tres widgets llaman al mismo hook (`useResumenDashboard`). React Query
deduplica por query key, así que se dispara **una sola request**.

### Estados de la UI

| Estado | Qué se muestra |
|---|---|
| Cargando | Skeletons en las 4 tarjetas, en la gráfica y en la lista |
| Vacío (citas) | "No hay citas hoy." |
| Error | Alert rojo con el mensaje de `toApiError()` |

---

## Endpoints

### `GET /api/dashboard`

Un solo endpoint alimenta toda la pantalla, para evitar 4 requests en paralelo
al cargar la vista principal.

Sin parámetros.

**Respuesta:**

```json
{
  "data": {
    "citas_hoy": 0,
    "citas_pendientes": 14,
    "total_clientes": 11,
    "ingresos_hoy": 0,
    "ventas_ultimos_dias": [
      { "fecha": "2026-08-03", "total": 0 },
      { "fecha": "2026-08-04", "total": 0 },
      { "fecha": "2026-08-05", "total": 0 },
      { "fecha": "2026-08-06", "total": 0 },
      { "fecha": "2026-08-07", "total": 40 },
      { "fecha": "2026-08-08", "total": 0 },
      { "fecha": "2026-08-09", "total": 0 }
    ],
    "citas_del_dia": [
      {
        "id": 104,
        "hora": "11:00",
        "cliente": "Rosa Medina Campos",
        "servicio": "Consulta general",
        "empleado": "Dra. Carmen Ríos",
        "estado": "confirmada"
      }
    ]
  }
}
```

---

## Campos

### Raíz

| Campo | Tipo | Confirmado | Notas |
|---|---|---|---|
| `citas_hoy` | int | ✅ | KPI "Citas hoy" |
| `citas_pendientes` | int | ✅ | KPI "Pendientes" |
| `total_clientes` | int | ✅ | KPI "Clientes" |
| `ingresos_hoy` | decimal | ✅ | KPI "Ingresos hoy", formateado con `formatMoneda()` |
| `ventas_ultimos_dias` | array | ✅ | Exactamente 7 elementos, orden ascendente por fecha |
| `citas_del_dia` | array | ✅ | Puede venir vacío |

### `ventas_ultimos_dias[]`

| Campo | Tipo | Notas |
|---|---|---|
| `fecha` | date `Y-m-d` | Se muestra como `DD/MM` en el eje X |
| `total` | decimal | Incluye días con 0 — el backend debe rellenarlos |

### `citas_del_dia[]`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | int | |
| `hora` | string | `"14:30"` o ISO completo, ambos se parsean |
| `cliente` | string | Nombre ya aplanado, no objeto |
| `servicio` | string | Nombre ya aplanado |
| `empleado` | string \| null | |
| `estado` | enum | `pendiente` · `confirmada` · `atendida` · `cancelada` · `no_asistio` |

Los colores de cada estado están en `web/src/features/citas/constants.ts`.

---

## El enlace de la tienda

Lo primero de la pantalla. Muestra la URL pública del negocio y tres acciones:
**Ver mi sitio**, **Copiar** y **Compartir** (abre WhatsApp con el mensaje ya
escrito: *"Ya puedes reservar tu cita en X desde aquí: …"*).

La URL se arma igual que `subdominio_url()` en Laravel: con
`NEXT_PUBLIC_APP_DOMAIN` puesto va por subdominio, y sin él por ruta. Así lo
que se ve en el panel es **exactamente** lo que el negocio va a repartir.

El mismo componente aparece en Configuración, encima de las pestañas, tal como
en la app actual.

> El botón de **copiar** no está en el Blade y es la acción que más se hace:
> el dueño no quiere abrir su web, quiere pegar el enlace en su Instagram o su
> estado de WhatsApp.

---

## Pendiente

- [ ] Definir si "Ingresos hoy" cuenta citas atendidas o cobros de caja
- [ ] Confirmar si "Pendientes" son solo las de hoy o todas las futuras
