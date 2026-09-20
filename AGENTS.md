# AGENTS.md — Sass-ChiraFlow (Next.js 16 + BFF)

Instrucciones para cualquier agente (Claude Code, Codex CLI) que trabaje en
**este** repositorio. Son las mismas reglas que `CLAUDE.md`, en la forma que
Codex lee. Si las dos difieren, manda `CLAUDE.md` y hay que corregir este
archivo.

## Qué es esto

Panel y tienda pública de ChiraFlow: **Next.js 16 + React 19 + MUI 7 +
TanStack Query**, con su propio **BFF** (`web/app/api/*`) que proxea a Laravel
guardando el token en una cookie httpOnly — **el navegador nunca ve el token**.

El backend es un repo aparte: `D:/PERSONAL_JEAN/Backend-Sass`.

```
web/    Next.js + BFF — es donde está todo el código
docs/   api-contract.md (el contrato) y vistas/ (una ficha por pantalla)
_bmad-output/planning-artifacts/     PRD, arquitectura, épicas e historias
_bmad-output/implementation-artifacts/sprint-status.yaml   estado del sprint
```

## Dónde está la planificación

| Qué | Ruta (relativa a este repo) |
|---|---|
| Historias y épicas | `_bmad-output/planning-artifacts/epics.md` |
| Estado del sprint | `_bmad-output/implementation-artifacts/sprint-status.yaml` |
| PRD (FR-1..FR-84) | `_bmad-output/planning-artifacts/prds/prd-ChiraFlow-2026-09-19/prd.md` |
| Arquitectura (AD-1..AD-22) | `_bmad-output/planning-artifacts/architecture/architecture-ChiraFlow-2026-09-19/ARCHITECTURE-SPINE.md` |
| Diseño y experiencia | `_bmad-output/planning-artifacts/ux-designs/ux-ChiraFlow-2026-09-19/{DESIGN,EXPERIENCE}.md` |
| **Contrato de la API** | `docs/api-contract.md` |
| Fichas por pantalla | `docs/vistas/` |

`docs/api-contract.md` es el **original único** y **solo se edita desde este
repo**. Desde `Backend-Sass` se lee.

`docs/estado.md` y `docs/plan-sprints.md` están **sustituidos** por
`sprint-status.yaml`; se leen solo como historial.

**Jerarquía ante conflicto:** PRD de BMAD → `Backend-Sass/docs/discrepancias.md`
(congelado) → `api-contract.md` → las fichas de `vistas/`.

## Entorno

```bash
cd web
npm run dev        # http://localhost:3000
npm run typecheck  # tsc --noEmit — obligatorio antes de cerrar una historia
npm run lint
```

`.env.local` sale de `.env.example`. `NEXT_PUBLIC_API_URL` apunta al Laravel
local (`http://127.0.0.1:8000/api`).

**`NEXT_PUBLIC_MODULOS_CONECTADOS`** decide qué módulos hablan con el backend
real y cuáles siguen con mocks. Un módulo entra en esa lista **cuando su
historia se cierra**, no antes.

## Aislamiento de recursos entre agentes (obligatorio)

Dos agentes trabajando a la vez no pueden compartir puerto ni backend:

| Agente | `npm run dev` | Backend contra el que apunta |
|---|---|---|
| Claude | 3000 | `127.0.0.1:8000` |
| Codex | `PORT=3001 npm run dev` | `127.0.0.1:8001` si levanta el suyo |

Cada worktree tiene su propio `.env.local` (no se comparte, no se commitea) y
su propio `node_modules`. Nunca dos `npm run dev` en el mismo puerto.

## Flujo de trabajo

- **Una historia** (`epics.md`, p. ej. «Story 1.11»): `bmad-build` sobre ella,
  en su rama. **Un arreglo pequeño**: `bmad-build` directo.
- **Antes de mergear:** `bmad-code-review`. **Al cerrar una épica:**
  `bmad-retrospective`.
- **Una rama por historia**, salida de `main`: `sprint-1/1-11-mi-perfil`.
  Merge con `--no-ff`.
- **Un responsable por historia**, el que dice `sprint-status.yaml` →
  `preparacion.listo_para_desarrollar` (`agente:`).
- **Al terminar**, actualizar el estado de esa historia en `sprint-status.yaml`
  y nada más.

## Reglas que no se negocian

1. **`git` solo en este repositorio.** Nunca crear ramas ni commitear en
   `Backend-Sass`: el 2026-08-22 las dos sesiones escribieron sobre el mismo
   repo y no se perdió trabajo de milagro.
2. **El contrato primero.** Si una historia cambia la forma de los datos, se
   acuerda en `docs/api-contract.md` **antes** de tocar un componente. Los
   tipos los usan nueve módulos: el último en enterarse es el que los rompe.
3. **Esconder una opción NO es autorización.** El menú se arma desde
   `GET /capacidades`, pero el backend responde 403 igual. Nunca se confía en
   que la pantalla oculte algo.
4. **El token nunca en el navegador**: lo guarda el BFF en cookie httpOnly.
   Ningún componente de cliente lo lee ni lo pasa.
5. **Nada de datos ficticios en producción** (AD-17): un módulo conectado no
   deja rama mock viva, y ninguna pantalla enseña cifras inventadas.
6. **Todo el texto, en español**, incluidos los errores.
7. **Paginar siempre**: los índices responden `{ data, meta }`. Búsqueda con
   `search`. Ningún selector trae `per_page=200` (trunca en silencio).

## Trampas conocidas (han mordido más de una vez)

- **`Autocomplete` de MUI: el `id` no va en `renderInput`**, que lo descarta —
  la etiqueta acaba sin enfocar nada. Ha pasado tres veces (`zona_horaria`,
  Cliente…).
- **`useTodos()` / `all()` truncan a 200** sin decirlo: con más de 200 clientes
  o servicios, el selector pierde opciones en silencio.
- **`CampoImagenes` descarta con `slice(0, max)`** sin avisar: con 2 guardadas
  y 4 elegidas, entran 2 y desaparecen 2.
- **El enlace de la tienda con `slug` en `NULL`** armaba
  `https://null.midominio.com`. Un enlace roto que se puede repartir por
  WhatsApp es peor que ninguno.
- **`cita.servicio` es un puente y puede llegar `null`**: la fuente de verdad
  es `servicios[]`, con `cantidad`, `duracion_min` y `precio` congelados de la
  pivote el día de la reserva.
- **El rojo es `no_asistio`, no `cancelada`**: cancelar es un desenlace
  ordenado; la inasistencia es la que cuesta dinero.
- **`monto_total` donde se muestra, `monto` donde se edita.**
