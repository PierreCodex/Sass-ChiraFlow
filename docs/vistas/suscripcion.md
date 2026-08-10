# Suscripción (banner global)

**Ruta:** no tiene — se renderiza en el layout del dashboard
**Estado:** ✅ Fiel a la app actual
**Archivos:**
- `web/src/app/(dashboard)/layout.tsx` (lo monta)
- `web/src/features/suscripcion/`

---

## Qué muestra

Aviso del estado del plan, encima del contenido de **todas** las pantallas del
dashboard. Réplica del banner ámbar de la app actual:

> Te quedan 5 día(s) de tu prueba gratuita. · **[Compra tu plan aquí]**

El botón lleva a `/mi-plan`.

### Comportamiento

| Estado de la suscripción | Qué se muestra |
|---|---|
| `activa` | Nada — el banner no se renderiza |
| `prueba` con `dias_restantes > 0` | Alert `warning`: "Te quedan N día(s) de tu prueba gratuita." |
| `vencida`, o `dias_restantes <= 0` | Alert `error`: "Tu prueba gratuita terminó. Compra un plan para seguir usando la plataforma." |
| Cargando | Nada — evita que el banner parpadee al entrar |

`staleTime` de 5 minutos: el plan casi no cambia dentro de una sesión.

---

## Endpoints

### `GET /api/suscripcion`

Estado del plan del tenant autenticado. Sin parámetros.

**Respuesta — en prueba:**

```json
{
  "data": {
    "estado": "prueba",
    "plan": null,
    "dias_restantes": 5,
    "renueva_el": null
  }
}
```

**Respuesta — plan activo:**

```json
{
  "data": {
    "estado": "activa",
    "plan": {
      "id": 2,
      "nombre": "Profesional",
      "precio": 89,
      "periodo": "mensual"
    },
    "dias_restantes": 23,
    "renueva_el": "2026-09-01"
  }
}
```

### `GET /api/planes`

Planes disponibles, para la pantalla "Mi Plan". Todavía sin consumir.

```json
{
  "data": [
    { "id": 1, "nombre": "Básico", "precio": 49, "periodo": "mensual" }
  ]
}
```

---

## Campos

| Campo | Tipo | Confirmado | Notas |
|---|---|---|---|
| `estado` | enum | ✅ | `prueba` · `activa` · `vencida` · `cancelada` |
| `plan` | objeto \| null | ✅ | `null` mientras esté en prueba |
| `dias_restantes` | int | ✅ | Días de prueba o del periodo pagado |
| `renueva_el` | date \| null | ⚠️ | Aún no se muestra en pantalla |

### `plan`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | int | |
| `nombre` | string | |
| `precio` | decimal | |
| `periodo` | enum | `mensual` · `anual` |

---

## Pendiente

- [ ] Confirmar si `cancelada` debe mostrar banner y con qué texto
- [ ] Construir la pantalla `/mi-plan` que consume `GET /api/planes`
