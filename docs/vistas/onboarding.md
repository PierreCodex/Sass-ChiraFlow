# Onboarding (checklist lateral)

**Ruta:** no tiene — se renderiza en el layout del dashboard, como el banner
de [suscripción](suscripcion.md)
**Estado:** ✅ Maquetado y **conectado al backend real** (2026-08-22)
**Archivos:**
- `web/src/layout/vertical/header/Header.tsx` (lo monta)
- `web/src/features/onboarding/components/OnboardingChecklist.tsx` (icono + panel)
- `web/src/features/onboarding/components/NombreNegocioDialog.tsx` (paso 1)
- `web/src/features/onboarding/{types,slug}.ts`, `services/`, `hooks/`

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

## Cómo está construido

Se monta en el **header**, no en el layout: un `IconButton` con `Badge` que
abre un `Drawer anchor="right"`. Es el patrón de `Cart.tsx` de la plantilla.
**No usa un `Fab`**: esa esquina ya es del `Customizer`, que también es un
drawer derecho lanzado desde `right: 25px; bottom: 15px`.

| Pieza | De dónde sale |
|---|---|
| Icono + panel | `layout/vertical/header/Cart.tsx` |
| Filas de tarea | `widgets/cards/UpcomingActivity.tsx`: `Avatar variant="rounded"` 40×40 sobre color claro |
| Progreso | `LinearProgress determinate`, como `dashboards/modern/SellingProducts.tsx` |
| Contador | El `Chip` pequeño de `Notification.tsx` |
| Modal del paso 1 | `dialogoResponsive`, como los 19 diálogos del proyecto |

### Lo que se le añadió a la plantilla

La plantilla resuelve la estructura, pero una lista de seis filas iguales no
dice nada. Sin salir del tema (`BLUE_THEME`) y **sin dependencias nuevas** —todo
con `@keyframes` de MUI, nada de framer-motion—:

- **Cabecera con degradado** `primary → secondary` y un **anillo de progreso**
  que se rellena solo: MUI transiciona el `strokeDashoffset` al cambiar el
  valor. El subtítulo acompaña el avance ("Empecemos por lo primero" → "Buen
  comienzo" → "Vas más de la mitad" → "Te falta uno, ya está").
- **Cada paso es una tarjeta** con tres estados: hecha (tinte verde, borde
  verde y la casilla maciza con el check en blanco), **actual** (tinte azul,
  borde y sombra, con la etiqueta `PASO ACTUAL`) y pendiente (tarjeta plana).
  Seis filas idénticas no dicen por dónde empezar.
- **Un icono propio por tarea** a la derecha (tienda, reloj, persona, ficha,
  calendario, ojo): se reconoce la fila sin leerla entera.
- **Botonera fija abajo**: el botón lleva el nombre del paso actual y lo lanza
  sin buscarlo en la lista; "Ahora no" cierra. La referencia traía "Ver
  tutorial completo", que se descartó por no existir tal tutorial: un botón
  que no lleva a ningún sitio miente.
- **Panel flotante** con margen y esquinas redondeadas en escritorio; a
  pantalla completa en móvil.
- **Entrada escalonada**: cada fila entra 60 ms después de la anterior.
- **El check aparece con rebote** al completar un paso, y el avatar pasa de
  azul a verde con transición.
- **Latido lento del badge** del header (cada 2,4 s) para recordar sin dar la
  lata.
- **Pantalla de enhorabuena** al terminar los 6, en vez de que el panel
  desaparezca de golpe.
- Todo respeta `prefers-reduced-motion`.

Los fondos teñidos van con `alpha(primary.main, …)` y **no** con
`primary.light`: ese tono no se invierte en modo oscuro y el texto encima
queda ilegible (trampa documentada en `CLAUDE.md`).

⚠️ **Dos trampas encontradas montándolo:**

1. La animación de entrada lleva `fill-mode: both`, así que su último
   fotograma **se queda fijado** y pisaba el `opacity: 0.45` del paso
   deshabilitado. Se resolvió terminando el keyframe en
   `opacity: var(--opacidad-fila)` en vez de en `1`.
2. **`Scrollbar` ignora su `sx` por debajo de `lg`**: devuelve un `Box` plano
   con `overflowX: auto` y descarta todo lo demás. El `flexGrow` que pega la
   botonera abajo tuvo que salir a un `Box` exterior; dentro del componente no
   llegaba, y en móvil el pie quedaba flotando a 97 px del fondo.

Descartado el **`Stepper`** de `forms/form-wizard`: es lineal y bloqueante, y
este checklist no bloquea nada — las tareas 2 a 5 se hacen en cualquier orden
y desde sus propias pantallas.

El drawer **se abre solo la primera vez** (marca `mi-saas:onboarding-visto` en
`localStorage`, dentro de `try/catch` para que el modo incógnito no rompa el
panel); después se abre desde el icono, que lleva el número de tareas que
faltan.

⚠️ **En móvil la barra del header no daba para un icono más**: con el checklist
desbordaba 32 px. Se compactó el botón y **se esconde el selector de idioma
por debajo de `sm`** (la app es de un solo idioma). Medido: de +32 px a −15 px
de holgura.

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

## Verificado en el navegador (2026-08-22)

Contra el Laravel real, con el tenant `yl9njvhq` recién verificado:

- Primer login → el panel se abre **con el checklist desplegado**, "0 de 6", y
  el paso 6 atenuado con la pista "Primero ponle nombre a tu negocio".
- Paso 1 → el modal deriva el enlace en vivo: *"Barbería El Cairo"* →
  `/reservar/barberia-el-cairo` (la tilde desaparece, como en `Str::slug`).
- Al guardar → 200, la fila pasa a check verde con "Listo", el chip a "1 de 6"
  y la barra avanza. `GET /onboarding` confirma `nombre_negocio: true`.
- Repetir el paso 1 → **422** con `errors.nombre` ("El nombre ya está definido
  y el enlace de tu tienda no puede cambiar"). Desde la interfaz ya no se
  puede: la fila completada deja de ser pulsable.
- Recargar → el checklist **no** se reabre solo y el badge del header marca 5.
- Móvil (375×812) → el panel ocupa el ancho completo y se lee entero.
- Botonera pegada al fondo en las dos medidas: el borde inferior del pie
  coincide al píxel con el del panel (884/884 en escritorio, 812/812 en
  móvil).
- Con los 6 pasos marcados a mano en la BD de desarrollo → el icono
  **desaparece** del header y el panel deja de abrirse solo. (Se restauró el
  estado después.)

La **pantalla de enhorabuena** no se pudo ejercitar de punta a punta: se llega
a ella al marcar el último paso desde el propio panel, y el único que el
cliente puede marcar es `sitio_publico`, que necesita el `slug` que el backend
todavía no envía.

Un hallazgo del camino: `POST /onboarding/nombre` por `curl` devolvía **302**
en vez de 422, porque sin `Accept: application/json` Laravel redirige a un
formulario que aquí no existe. El BFF ahora **fuerza esa cabecera** en todas
las peticiones: lo que pasa por él es API, y no debe depender de quién llame.

---

## Pendiente

- [ ] **`negocio.slug` en `UsuarioResource`** (login y `GET /user`): sin él el
      paso 6 no tiene a dónde apuntar y queda deshabilitado. Anotado en el
      contrato § Usuario y en los traspasos de [estado.md](../estado.md)
- [ ] El enlace de la tienda del [dashboard](dashboard.md) sigue con datos
      ficticios: hay que apagarlo mientras el slug sea `NULL`
- [ ] Si `rango_profesionales = independiente`, ¿el paso 3 se marca solo o
      cambia su texto? (ver [registro.md](registro.md))
- [ ] Validación de nombres reservados en el slug (`www`, `api`, `admin`,
      `app`, `mail`, `ftp` — la lista del middleware de la tienda)
