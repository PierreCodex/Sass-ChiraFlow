# Onboarding (checklist lateral)

**Ruta:** no tiene — se renderiza en el layout del dashboard, como el banner
de [suscripción](suscripcion.md)
**Estado:** ⚠️ Diseño cerrado (2026-08-14) · **sin maquetar**
**Archivos (previstos):**
- `web/src/app/(dashboard)/layout.tsx` (lo monta)
- `web/src/features/onboarding/`

---

## Qué es

Un **checklist lateral no bloqueante** para el negocio recién creado. El
usuario entra directo a su panel completo desde el primer login; el checklist
acompaña, no encierra:

- Panel/drawer lateral **cerrable** (el cierre se recuerda en el cliente; al
  volver a abrir sigue donde estaba).
- Progreso visible tipo **"1/6"**.
- Cada tarea enlaza a la pantalla donde se completa; el estado se refresca al
  volver.
- Cuando `completado: true`, deja de mostrarse.

El estado vive en `tenants.onboarding_pasos` (JSON, BD central). El frontend
pone etiquetas, descripciones y enlaces; el backend solo manda claves y
booleanos (patrón declarado del contrato).

---

## Las 6 tareas, en orden

| # | Clave | Etiqueta | Enlaza a | Quién la marca |
|---|---|---|---|---|
| 1 | `nombre_negocio` | Ponle nombre a tu negocio | modal propio del checklist | `POST /onboarding/nombre` |
| 2 | `horario_local` | Configura el horario de tu local | `/configuracion` (pestaña Agenda) | backend, al guardar `PUT /configuracion` con horario |
| 3 | `primer_profesional` | Agrega tu primer profesional | `/empleados` | backend, al crear el primer `rol=profesional` |
| 4 | `primer_servicio` | Crea tu primer servicio | `/servicios` | backend, en el primer `POST /servicios` |
| 5 | `reserva_prueba` | Haz una reserva de prueba | `/citas` | backend, en la primera cita (panel o pública) |
| 6 | `sitio_publico` | Conoce tu sitio público | enlace de la tienda | el cliente: `PUT /onboarding/pasos/sitio_publico` al abrirla |

### El paso 1 es especial

**Fija el nombre del negocio y, con él, el slug definitivo** — que después es
**inmutable** (es el subdominio de la tienda). Ojo: como la BD del tenant se
provisiona al verificar el correo, **antes** de conocer el slug, el nombre de
la BD no puede depender de él — el id interno del tenant y el slug son cosas
distintas (decisión anotada en el Sprint 0 de
[plan-sprints.md](../plan-sprints.md)). Por eso:

- El registro no lo pidió: se decide aquí, con calma, viendo el enlace que va
  a resultar (el modal muestra la URL en vivo: `mi-barberia.dominio.pe`).
- **Mientras no se complete, la tienda pública está APAGADA**
  (`GET /publico/{slug}` → 404): nadie debe compartir un enlace con el slug
  temporal aleatorio del registro.
- El paso 6 ("Conoce tu sitio público") y el enlace de la tienda del
  [dashboard](dashboard.md) quedan deshabilitados hasta entonces, con la
  pista "Primero ponle nombre a tu negocio".
- El dueño ya viene con `atiende=1` desde el provisioning: el paso 3 va de
  añadir al **resto** del equipo.

---

## Endpoints

### `GET /api/onboarding`

```json
{
  "data": {
    "completado": false,
    "pasos": [
      { "clave": "nombre_negocio",     "completado": true },
      { "clave": "horario_local",      "completado": false },
      { "clave": "primer_profesional", "completado": false },
      { "clave": "primer_servicio",    "completado": false },
      { "clave": "reserva_prueba",     "completado": false },
      { "clave": "sitio_publico",      "completado": false }
    ]
  }
}
```

El orden del array es el del checklist. El progreso ("1/6") lo cuenta el
frontend.

### `POST /api/onboarding/nombre`

```json
{ "nombre": "Barbería El Cairo" }
```

| Campo | Reglas |
|---|---|
| `nombre` | requerido, string, máx. 150 |

El backend deriva el slug (minúsculas, sin tildes, guiones; sufijo si
colisiona), renombra el tenant, marca el paso y **enciende la tienda**.

**Respuesta:** `{ "data": { "nombre": "Barbería El Cairo", "slug": "barberia-el-cairo" } }`

Si el nombre ya se fijó antes → **422** con `errors.nombre` ("El nombre ya
está definido y el enlace de tu tienda no puede cambiar.").

### `PUT /api/onboarding/pasos/{clave}`

Sin cuerpo. Solo para las claves marcables desde el cliente — hoy únicamente
`sitio_publico`. Cualquier otra clave → 422 (las marca el backend como efecto
lateral de su endpoint; el checklist no puede "hacerse trampas").

**Respuesta:** el objeto `Onboarding` actualizado.

---

## Relación con el resto de módulos

Los pasos 2–5 los marcan los endpoints de otros módulos, así que **cada
sprint que implemente uno de esos módulos debe añadir su hook de marcado**
(está anotado en [plan-sprints.md](../plan-sprints.md)):

| Paso | Se implementa en |
|---|---|
| `horario_local` | Sprint 2 (Configuración) |
| `primer_profesional` | Sprint 2 (Empleados) |
| `primer_servicio` | Sprint 1 (Servicios) |
| `reserva_prueba` | Sprint 4 (Citas) / Sprint 5 (reserva pública) |

Marcar un paso es idempotente y **nunca se desmarca** (borrar el único
servicio no reabre la tarea: el objetivo es enseñar el camino, no auditar el
estado).

---

## Herencia del Laravel anterior

`ConfiguracionController::update` ya marcaba `perfil_negocio` y
`horario_local` con `marcarPasoOnboarding()` — el patrón de "el backend marca
como efecto lateral" viene de ahí. Las claves y la lista de tareas son nuevas.

---

## Pendiente

- [ ] Maquetar el drawer (Sprint 0): lista, progreso, modal del paso 1 con la
      URL en vivo
- [ ] ¿El cierre del drawer se recuerda por dispositivo (localStorage) o por
      usuario (backend)? Propuesta: localStorage, no amerita columna
- [ ] Si `rango_profesionales = independiente`, ¿el paso 3 se marca solo o
      cambia su texto? (ver [registro.md](registro.md))
- [ ] Validación de nombres reservados en el slug (`www`, `api`, `admin`,
      `app`, `mail`, `ftp` — la lista del middleware de la tienda)
