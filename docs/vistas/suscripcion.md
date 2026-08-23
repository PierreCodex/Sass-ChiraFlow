# Suscripción (banner global)

**Ruta:** no tiene — se renderiza en el layout del dashboard
**Estado:** ✅ Fiel a la app actual
**Archivos:**
- `web/src/app/(dashboard)/layout.tsx` (lo monta)
- `web/src/features/suscripcion/`

---

## Qué muestra

Aviso del estado del plan, encima del contenido de **todas** las pantallas del
dashboard. El botón lleva a `/mi-plan`.

### La urgencia se escala (rediseño del 2026-08-23)

Antes era un banner ámbar fijo: el mismo grito el día 14 que el día 1, y con
un `(s)` de programador en *"Te quedan 5 día(s)"*.

Como **sale en las 17 pantallas, todo el día, todos los días de la prueba**,
el diseño se rige por dos reglas: la urgencia sube según se acerca el final, y
la animación solo aparece cuando significa algo.

Además es un **bloque propio** —fondo teñido, borde y el reloj en una insignia
redonda— y no un `Alert` del montón: tiene que verse distinto del contenido
para que el dueño lo registre. Y el subtítulo dice **el motivo**, que es lo que
convierte; el número solo informa.

| Días | Color | Arena | Botón |
|---|---|---|---|
| Más de 7 | `info` | Bulbo lleno | "Ver planes" |
| De 3 a 7 | `warning` | A la mitad | "Ver planes" |
| 2 o menos | `error` | Casi vacío | "Compra tu plan" |
| Vencida o cancelada | `error` | Vacío, sin chorro | "Compra tu plan" |

### El reloj es un SVG propio (`RelojArena.tsx`)

La arena cae de verdad: un trazo discontinuo desplazándose hace de granos, el
bulbo de arriba se vacía según el nivel y el montón de abajo crece. Se hizo a
mano en vez de usar el GIF de Icons8 (96×96, 25 fotogramas, 37 KB) o un render
3D (1536×1024, **2,3 MB**):

- **Hereda el color** con `currentColor`, así que sigue la escala azul → ámbar
  → rojo. Los colores de un GIF están quemados.
- Pesa **menos de 1 KB** en un componente que sale en las 17 pantallas.
- Respeta `prefers-reduced-motion`; un GIF seguiría animándose.
- Sin atribución de terceros (el plan gratuito de Icons8 la exige).

⚠️ **Trampa:** `transform-origin` en CSS **no funciona sobre un `<path>`** — el
navegador escala respecto a (0,0) y la arena se va al borde del lienzo. Se
compone a mano con el atributo `transform`: escalar respecto a `origenY` es
`translate(0, origenY·(1-k)) scale(1, k)`.

**Lo que no se hizo, y por qué.** Se valoraron tres propuestas:

- *Barra de tiempo consumido*: la mejor idea informativa, pero **falta el
  dato** — `Suscripcion` trae `dias_restantes` y no los días totales de la
  prueba, así que el porcentaje habría que inventarlo. Queda para cuando el
  backend mande `dias_totales`.
- *Botón latiente*: descartado. Un botón que pulsa sin parar durante 14 días
  no genera urgencia, genera fatiga; y en una herramienta de trabajo,
  desconfianza.
- *Shimmer y borde resplandeciente*: descartado. No comunica nada —el brillo
  no dice cuántos días quedan— y cuesta animación continua.

### Comportamiento

| Estado de la suscripción | Qué se muestra |
|---|---|
| `activa` | Nada — el banner no se renderiza |
| `prueba` con `dias_restantes > 0` | Según la tabla de arriba. Singular correcto: "Te queda 1 día" |
| `vencida`, o `dias_restantes <= 0` | "Tu prueba gratuita terminó. Compra un plan para seguir usando la plataforma." |
| `cancelada` | "Tu suscripción está cancelada…" — antes caía en el texto de la prueba, que no venía a cuento |
| Cargando | Nada — evita que el banner parpadee al entrar |

**Verificado en el navegador (2026-08-23):** los cuatro niveles con 12, 5, 1 y
0 días, y el estado `vencida`. En **modo oscuro** el ámbar sobre el fondo del
panel da **6,7:1** de contraste — por encima del 4,5:1 que pide WCAG AA, así
que se mantiene.

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
