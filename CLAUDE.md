# Mi SaaS — guía para trabajar en este repo

SaaS de reservas para negocios que venden tiempo de personas (clínicas,
salones, barberías). Mercado peruano: soles, DNI, WhatsApp.

**Multi-inquilino con tienda pública**: cada negocio que se registra obtiene un
panel de gestión y, en el mismo acto, una tienda en su propio subdominio donde
sus clientes reservan solos.

```
mi-saas/
├── web/    Next.js 16 + React 19 + MUI 7 — es donde está todo hoy
│           incluye el BFF: app/api/* proxea a Laravel con el token
└── docs/   La especificación: una ficha por vista con su contrato JSON
```

**El backend no vive aquí.** La carpeta `api/` se eliminó: Laravel se
construye en un repo aparte, **`backend-sass`**, y su contrato es
`docs/api-contract.md`.

Ese archivo es el **original único** y **solo se edita desde este repo**. En
`backend-sass` se lee, no se modifica: si el backend necesita cambiar una forma
de datos, se cambia aquí y desde ahí se propaga. Dos copias divergiendo es
exactamente el problema que el documento existe para evitar.

---

## Estado: maqueta terminada, backend por hacer

Las **16 fichas del panel más la tienda pública** están construidas y
funcionando con datos ficticios. No hay backend: la capa de servicios devuelve
mocks.

El siguiente paso es levantar el Laravel. **Aún no se ha empezado.**

---

## Reglas del proyecto

Estas no son preferencias de estilo, son decisiones tomadas. Respetarlas.

### 1. No cambiar el diseño de la plantilla

`web/` parte de la plantilla **Modernize**. Se usan **sus** componentes, su
tema y su paleta. De un diseño anterior se replica el **contenido** (campos,
reglas, textos), **nunca** el diseño.

El tema es `BLUE_THEME`; no tocarlo.

### 2. Datos ficticios primero

Cada módulo se maqueta con mocks y se conecta después. El interruptor es una
variable:

```env
NEXT_PUBLIC_USE_MOCKS=false   # cuando el backend esté listo
```

Los servicios ya tienen las dos ramas —mock y axios— una al lado de la otra
(`web/src/lib/api/recurso.ts`). Los hooks y los componentes no cambian.

### 3. Una ficha en `docs/vistas/` por cada vista

Cada pantalla lleva su `.md` con: qué muestra, los endpoints con el **JSON de
ejemplo**, la tabla de campos con lo confirmado y lo supuesto, las diferencias
con la app anterior y los pendientes.

**Esas fichas son la especificación del backend.** No hay que diseñar la API:
hay que implementarla.

### 4. Verificar en el navegador, no suponer

Hay `agent-browser` disponible. Después de maquetar algo, abrirlo y comprobar
que hace lo que se dice: medir tamaños, disparar el flujo, mirar la captura.
Varias veces en este proyecto lo que parecía correcto no lo era.

---

## Dónde está cada cosa

| Ruta | Qué es |
|---|---|
| `F:\PERSONAL_JEAN\mi-saas` | **Este proyecto.** Trabajar aquí. |
| `F:\PERSONAL_JEAN\mi-modernize-app\packages\typescript\main` | La plantilla Modernize, **solo consulta**: mirar cómo resuelve algo antes de inventarlo |
| `C:\laragon\www\SAAS_LINEA_BIEN` | El Laravel anterior, **solo lectura** |

### Sobre el Laravel anterior

Es de un compañero y **se va a rehacer entero**; solo se conserva la idea de
negocio. Sirve como referencia de qué hacía el producto.

- Rama buena: **`origin/feat/planes-suscripcion`** (la `main` está incompleta)
- Consultarlo con `git show origin/feat/planes-suscripcion:<ruta>`
- **No abrir `.env` ni nada con credenciales.** Los datos de configuración se
  sacan de `config/` y de las migraciones.

---

## Comandos

```bash
cd web
npm run dev         # http://localhost:3000
npm run typecheck   # tsc --noEmit  <- pasar esto SIEMPRE antes de dar algo por hecho
```

No hay tests todavía. `npm run lint` no está configurado (no hay eslint.config).

---

## Arquitectura de `web/src`

```
app/(dashboard)/<ruta>/page.tsx   solo composición, sin lógica
app/(publico)/reservar/...        la tienda pública, sin sesión
        ↓
features/<modulo>/components/     la pantalla
features/<modulo>/hooks/          React Query
features/<modulo>/services/       el fetch (o el mock)
features/<modulo>/types.ts        los tipos + helpers de dominio
        ↓
lib/api/client.ts                 axios, baseURL "/api"
        ↓
middleware.ts                     subdominios de tienda + guardia del panel
app/api/[...path]/route.ts        el BFF: pone el Bearer y reenvía a Laravel
app/api/auth/{login,logout}       lo único que escribe y borra la cookie
lib/auth/sesion.ts                cookies httpOnly + URL del upstream
```

### Las dos fábricas

Casi todo CRUD se monta con dos funciones; usarlas en vez de escribir el
mismo código otra vez:

- **`lib/api/recurso.ts` → `crearRecurso()`**: list, all, get, create, update,
  remove, con su rama mock y su rama axios. Opciones: `camposBusqueda`,
  `valoresPorDefecto`, `alGuardarMock`, `enviarComoFormData`, `filtrosMock`.
- **`lib/query/recurso-hooks.ts` → `crearHooksRecurso()`**: los hooks de React
  Query con sus keys e invalidaciones.

### Componentes compartidos que ya existen

`DataTable`, `ConfirmDialog`, `BuscadorTabla`, `CampoImagenes`, `StatCard`,
`DashboardCard`, `BlankCard`, `EncabezadoPagina`.

**`EncabezadoPagina`** es la cabecera de las 15 pantallas del panel: título,
descripción opcional y acciones a la derecha. Sustituyó al `Breadcrumb` de la
plantilla, que gastaba **145 px** en repetir "Inicio • Configuración" cuando el
sidebar ya marca dónde estás. **No volver a usar `Breadcrumb`.**

Y dos estilos en `components/shared/estilos-formulario.ts`:

- **`formularioCompacto`** — anula el `margin-top: 25px` fijo de
  `CustomFormLabel`, pensado para páginas y no para modales.
- **`dialogoResponsive`** — lo llevan **los 19 diálogos**. En escritorio no
  cambia nada; en móvil se anclan abajo como hoja inferior y ocupan solo lo que
  necesitan. Incluye `minHeight: 0` en `DialogContent`, sin el cual la botonera
  se sale del panel en los formularios largos.

---

## Convenciones de la API

Están completas en `docs/README.md`, y el inventario de endpoints con sus
formas de datos en `docs/api-contract.md`.

### Transporte: BFF con token Bearer

El navegador **no habla con Laravel**. Habla con un proxy que corre dentro del
propio Next:

```
navegador ──/api/*──> BFF (app/api/[...path]) ──Bearer──> Laravel
```

- El cliente axios tiene `baseURL: "/api"` — relativa, mismo origen.
- El token de Sanctum vive en una cookie **httpOnly** que solo lee el BFF; el
  JS del navegador no lo ve nunca.
- El BFF adjunta `Authorization: Bearer` y `X-Tenant`, y reenvía con
  `cache: 'no-store'`.
- `app/api/auth/login` y `app/api/auth/logout` son las **únicas** rutas que
  escriben o borran la cookie.
- Se acabaron el `GET /sanctum/csrf-cookie`, el `withCredentials` y el CORS:
  Laravel solo recibe tráfico del BFF.

### Sesión caída: dos capas

El **guardia** de `middleware.ts` manda al login si falta la cookie, pero solo
mira que **exista**. Un token revocado desde otro dispositivo lo pasa. Quien
manda es el **401**: el interceptor de axios llama a `POST /api/auth/logout`
para borrar la cookie muerta y salta a `/login?next=…&sesion=expirada`. Si solo
saltara, el guardia seguiría viendo la cookie y dejaría entrar al panel una y
otra vez. El **403** (correo sin verificar) no entra ahí.

### Las que más se incumplían en el backend anterior

- **Paginar siempre** lo que sea lista. Nada de `->get()` suelto.
- Un solo nombre para buscar: **`search`** (el anterior usaba `buscar`).
- Una sola forma: `{ data: … }` y `{ data: […], meta: {…} }`.
- Filtros como query params (`?estado=abierto`), no rutas nuevas.
- **422 con `errors` por campo** — es lo que los formularios ya saben pintar.
- Los colores y las etiquetas los pone el frontend, no el backend.

---

## Trampas ya encontradas

Cosas que costaron tiempo. No repetirlas.

| Trampa | Qué pasa |
|---|---|
| **`middleware.ts` matcher** | Excluir "rutas con punto" (`.*\..*`) tumba la app entera con Turbopack: HTTP 200, cuerpo vacío y **cero errores en consola**. Usar el matcher estándar. |
| **CSS layers** | `enableCssLayer: true` mete MUI en `@layer mui`, así que el CSS sin capa (react-big-calendar) **gana** sobre `sx`. Para eso está `calendario.css`. |
| **`primary.light` en modo oscuro** | Es lo único de la paleta de Modernize que **no** se invierte: sigue siendo `#ECF2FF`. Texto encima = ilegible. Usar `info.light` o `grey.100`. |
| **Inputs numéricos** | Devuelven **string**; yup solo castea al enviar. Para cálculos en vivo hay que hacer `Number()` a mano. |
| **`onClick` en el SVG** | En el header de la plantilla el toggle de tema tiene el `onClick` en el `<svg>`, no en el botón. Pulsar el botón no hace nada. |
| **`localhost` en `NEXT_PUBLIC_API_URL`** | El `fetch` de Node resuelve `localhost` a **::1** y `php artisan serve` solo escucha en IPv4: el BFF devuelve **502** aunque `curl` al backend funcione. Usar `http://127.0.0.1:8000/api`. |
| **BOM en un `.php` del backend** | Un archivo guardado con BOM (fue `config/app.php`) hace que Laravel emita `EF BB BF` antes del JSON. `JSON.parse` falla, axios se traga el error y el hook recibe una cadena en vez del objeto. Se ve con `curl … \| xxd \| head -1`. |
| **`Scrollbar` bajo `lg`** | `components/custom-scroll/Scrollbar.tsx` **descarta su `sx`** por debajo de `lg`: devuelve un `Box` plano con `overflowX: auto`. Alturas, `flexGrow` y demás hay que ponerlos en un `Box` que lo envuelva. |
| **`fill-mode: both` pisa el `sx`** | Un `@keyframes` que termine en `opacity: 1` deja ese valor **fijado** y anula el `opacity` del `sx`. Terminar el keyframe en una variable CSS (`var(--…)`) que lleve el valor real. |
| **Recargar pierde los mocks** | El estado vive en memoria del módulo. Para conservarlo hay que navegar con el sidebar, no recargar. |

---

## Documentación

| Documento | Para qué |
|---|---|
| `docs/README.md` | Índice de las 17 fichas + convenciones de la API |
| `docs/api-contract.md` | **El contrato con `backend-sass`**: endpoints, formas de datos y flujos. Original único: se edita aquí y solo aquí |
| `docs/vistas/*.md` | Una por pantalla, con su contrato JSON |
| `docs/plan-backend.md` | Cómo levantar el backend nuevo: decisiones, orden y tablas que faltan |

**Al terminar un módulo, actualizar su ficha.** Es lo que hace que la
especificación siga siendo cierta.

---

## Lo que viene

Por orden, según `docs/plan-backend.md`:

1. **Estructurar la base de datos** pensada para multi-inquilino — es lo
   siguiente y aún no está empezado
2. Backend Laravel **solo API**, sin Blade, en el repo `backend-sass`, con
   Sanctum emitiendo **tokens** (no sesión de cookie: el BFF ya está montado)
3. Conectar la maqueta (`NEXT_PUBLIC_USE_MOCKS=false`)

Pendiente de maquetar: la **landing del SaaS** con el registro de prueba (la
puerta de entrada al producto) y el **onboarding** del negocio recién creado.

### Decisión tomada: dominios separados

Panel y tiendas van en **dominios registrables distintos**. Se mantiene, pero
el motivo cambió de peso:

- **Ya no es por la cookie.** Con el BFF, la sesión del panel es una cookie
  httpOnly del dominio del panel y el token viaja en una cabecera que pone el
  servidor. No hay cookie de sesión que se derrame a las tiendas de los demás
  inquilinos.
- **Sigue en pie por el producto**: el plan Pro promete dominios
  personalizados, y eso solo funciona si las tiendas viven en su propio
  dominio. El razonamiento largo está en `docs/plan-backend.md`.
