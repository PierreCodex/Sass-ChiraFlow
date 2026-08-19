# Documentación de vistas

Una ficha por pantalla en [`vistas/`](vistas/). Cada ficha declara qué muestra la
vista, qué endpoints consume y el **JSON exacto** que espera recibir de Laravel.

Sirve para dos cosas: como especificación para construir el backend, y como
checklist para validar cada maqueta contra la app actual.

## Índice

| Vista | Ruta | Estado |
|---|---|---|
| [Dashboard](vistas/dashboard.md) | `/` | ✅ Fiel a la app actual |
| [Suscripción](vistas/suscripcion.md) | (banner global) | ✅ Fiel a la app actual |
| [Onboarding](vistas/onboarding.md) | (checklist lateral) | ⚠️ Diseño cerrado · sin maquetar |
| [Clientes](vistas/clientes.md) | `/clientes` | ✅ Validado contra la app actual |
| [Citas](vistas/citas.md) | `/citas` | ✅ Validado contra el backend · ⚠️ tabla supuesta |
| [Servicios](vistas/servicios.md) | `/servicios` | ✅ Validado contra la app actual |
| [Categorías](vistas/categorias.md) | `/categorias` | ✅ Validado contra el código Laravel |
| [Empleados](vistas/empleados.md) | `/empleados` | ✅ Validado contra la app actual |
| [Locales](vistas/locales.md) | `/locales` | ✅ Las 4 pestañas validadas contra el código Laravel |
| [Calendario](vistas/calendario.md) | `/calendario` | ✅ Validado contra la app actual |
| [Caja](vistas/caja.md) | `/caja` | ✅ Validado contra el código Laravel · ⚠️ propone cambios de esquema |
| [Inventario](vistas/inventario.md) | `/inventario` | ✅ Validado contra el código Laravel · ⚠️ falta `update` en backend |
| [Reportes](vistas/reportes.md) | `/reportes` | ✅ Validado contra el código Laravel · ⚠️ una gráfica cambia de forma |
| [Mi Plan](vistas/mi-plan.md) | `/mi-plan` | ✅ Validado contra el código Laravel · ⚠️ no hay pasarela de pago |
| [WhatsApp](vistas/whatsapp.md) | `/whatsapp` | ✅ Validado contra el código Laravel |
| [Configuración](vistas/configuracion.md) | `/configuracion` | ✅ Validado contra el código Laravel |
| [Soporte](vistas/soporte.md) | `/soporte` | ✅ Validado contra el código Laravel |

> **Documentos de conjunto**
> - [api-contract.md](api-contract.md) — inventario de endpoints, formas de
>   datos y flujos de pantalla, extraído del código del frontend
> - [lectura-del-backend.md](lectura-del-backend.md) — qué pretendía el
>   backend actual, qué conservar y qué rehacer
> - [plan-backend.md](plan-backend.md) — cómo levantar el backend nuevo:
>   decisiones, orden de construcción y tablas que faltan
> - [plan-sprints.md](plan-sprints.md) — el plan de ejecución por sprints:
>   grafo de dependencias, fichas por módulo y criterios de aceptación
> - [flujos.md](flujos.md) — 12 diagramas del sistema, listos para Excalidraw

### Fuera del panel

| Vista | Ruta | Estado |
|---|---|---|
| [Tienda pública](vistas/tienda-publica.md) | `{slug}.dominio.com` · `/reservar/{slug}` | ✅ Validado contra el código Laravel · ⚠️ falta mapa y SEO |
| [Registro](vistas/registro.md) | `/register` | ✅ Maquetado y conectado al backend real |

**Estados:** ✅ construido a partir de la app real · ⚠️ tiene una decisión
abierta o una divergencia deliberada, explicada en su ficha.

> **El maquetado está completo.** Las 16 vistas del panel más la tienda
> pública están construidas con datos ficticios y documentadas. El siguiente
> paso es la conexión con Laravel: apagar `NEXT_PUBLIC_USE_MOCKS` y resolver
> los pendientes que cada ficha lista al final.

Para añadir una vista nueva, copia [`vistas/_plantilla.md`](vistas/_plantilla.md).

---

## Convenciones de la API

Todas las respuestas siguen los formatos estándar de Laravel. El frontend ya
está escrito contra ellos (`src/lib/api/types.ts`).

### Recurso individual

```json
{ "data": { "id": 1, "nombre": "..." } }
```

### Colección paginada — `->paginate()`

```json
{
  "data": [{ "id": 1 }, { "id": 2 }],
  "links": { "first": null, "last": null, "prev": null, "next": null },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 4,
    "path": "",
    "per_page": 10,
    "to": 10,
    "total": 37
  }
}
```

El frontend solo usa `data` y `meta.total` / `meta.current_page` / `meta.per_page`.

### Moneda y formato

Los importes van en **soles (PEN)** y el frontend los formatea con
`formatMoneda()` → `S/ 20.00`. Configurable en `web/.env.local`:

```env
NEXT_PUBLIC_LOCALE=es-PE
NEXT_PUBLIC_CURRENCY=PEN
```

Las fechas viajan ISO (`2026-08-09`) y se muestran como `DD/MM/YYYY`.

### Parámetros de listado

Todos los índices aceptan los mismos:

| Param | Tipo | Notas |
|---|---|---|
| `page` | int | Base **1** |
| `per_page` | int | 10, 25 o 50 |
| `search` | string | Opcional, texto libre |
| `sort` | string | Opcional |

### Errores de validación (422)

```json
{
  "message": "Los datos proporcionados no son válidos.",
  "errors": { "email": ["El email ya está registrado."] }
}
```

`toApiError()` en `src/lib/api/client.ts` los normaliza para react-hook-form.

### Errores 401

El interceptor de axios redirige a `/login` automáticamente. El backend no
necesita devolver nada especial.

---

## Cómo están construidas las vistas

```
app/(dashboard)/<ruta>/page.tsx   solo composición
        ↓
features/<modulo>/components/     la pantalla
        ↓
features/<modulo>/hooks/          React Query
        ↓
features/<modulo>/services/       el fetch (o el mock)
        ↓
lib/api/client.ts                 axios
```

### Los diálogos en móvil

Los 19 diálogos comparten `dialogoResponsive`
(`components/shared/estilos-formulario.ts`). En escritorio no cambia nada:
siguen centrados con su `maxWidth`. **Por debajo de `sm` se anclan abajo como
hoja inferior**, ocupando solo lo que necesitan.

Antes cada diálogo decidía por su cuenta con `fullScreen={pantallaChica}`, y
eso daba dos problemas:

- **Espacio muerto.** `fullScreen` mira el ancho de la pantalla, no el
  contenido: el formulario de cliente son tres campos y ocupaba 844px con 450
  en blanco.
- **No había cómo salir.** A pantalla completa no queda fondo que tocar y los
  diálogos no llevan aspa: para cerrar había que bajar hasta "Cancelar".

Además solo 9 de 19 lo aplicaban, así que el comportamiento cambiaba de un
módulo a otro.

Ahora cada uno se ajusta a su contenido, con tope del 92% del alto:

| Diálogo | Alto en móvil |
|---|---|
| Confirmar eliminación | 194 px |
| Nuevo cliente | 453 px |
| Nuevo producto | 527 px |
| Nuevo ticket | 605 px |
| Servicio · Cita · Local · Plantilla | 776 px (tope) |

El estilo incluye también `minHeight: 0` en `DialogContent`: un hijo flex no
encoge por debajo de su contenido, y en Empleados eso empujaba la botonera 8px
fuera del panel, donde no se podía pulsar.

### El switch de datos ficticios

Hoy la capa de servicios devuelve los datos de `features/<modulo>/mocks.ts`.
Cuando el backend esté listo:

```env
# web/.env.local
NEXT_PUBLIC_USE_MOCKS=false
```

Ese es el único cambio. Los hooks y los componentes ya están escritos contra la
API real — ver `src/lib/api/recurso.ts`, donde cada método tiene la rama mock y
la llamada axios una al lado de la otra.
