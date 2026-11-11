# Cómo colaborar en tivu

Guía para quien se suma a desarrollar (escrita el 2026-11-11, para Sandro). Las
reglas valen para los **dos** repos: `Sass-ChiraFlow` (frontend, Next) y
`Backend-Sass` (backend, Laravel).

## 1. Las ramas

```
tu rama (sale de develop) ──PR──> develop ──PR (bloque probado)──> main
```

| Rama | Para qué | Quién mergea |
|---|---|---|
| `main` | Lo estable. Solo recibe `develop` por PR, cuando un bloque está probado (al cerrar un sprint o antes de desplegar) | **Jean**, y nadie más |
| `develop` | La rama común: ahí se junta y se prueba todo | Jean, después de revisar tu PR |
| **Tu rama** | Una por historia o arreglo. **Sale de `develop`** y vuelve a `develop` por PR | — |

**Tus PR siempre apuntan a `develop`.** Nunca a `main`: `main` solo recibe
`develop`, y esa PR la abre y la mergea Jean cuando el bloque está probado.

### Nombres de rama

| Qué | Nombre | Ejemplo |
|---|---|---|
| Historia | `sprint-N/N-M-descripcion` | `sprint-3/3-3-tablero-que-dice-la-verdad` |
| Funcionalidad suelta | `feat/…` | `feat/exportar-clientes` |
| Arreglo | `fix/…` | `fix/hora-en-utc-del-dashboard` |
| Limpieza, sin cambio de comportamiento | `chore/…` | `chore/header-sin-restos-de-plantilla` |

### Lo que no se hace

- **Nadie hace push ni merge directo a `develop` ni a `main`**, tampoco un
  agente de IA. Todo entra por PR.
- **Las ramas personales (`sandro/develop`, `dev-Sandro`…) son para probar en
  local.** No se mergean a `develop` ni a `main`, y nadie saca ramas de ellas:
  arrastran trabajo sin revisar. Lo que valga de ahí se lleva a una rama nueva,
  salida de `develop`, con su PR.
- **PR encadenadas:** la base de una PR tiene que ser `develop` o una rama que
  ya tenga su PR abierta. Nunca una rama sin PR.
- **No commitear** cambios locales de `web/next.config.mjs` (`allowedDevOrigins`)
  ni ningún `.env` con credenciales.

## 2. Antes de abrir la PR

1. Sacaste la rama de un `develop` **actualizado** (`git pull origin develop`).
2. **Frontend:** `cd web && npm run typecheck` en verde.
3. **Backend:** las pruebas de lo que tocaste en verde
   (`vendor/bin/pest tests/Feature/<carpeta>`), y las tuyas nuevas.
4. **Revisión del código** hecha (`bmad-code-review`, o a mano si no lo tienes,
   y dilo en la PR).
5. **Probado en el navegador**, no supuesto: abre la pantalla y dispara el
   flujo.
6. En la PR: qué cambia, cómo se probó, y **el enlace a la spec de la historia**
   (`_bmad-output/implementation-artifacts/spec-…md`).
7. Al mergear, Jean usa **«Create a merge commit»**, para que cada historia se
   pueda revertir de un tirón.

## 3. Reglas del proyecto

Están completas en `CLAUDE.md`. Las que más se olvidan:

- **El contrato `docs/api-contract.md` solo se edita en este repo**
  (frontend). En el backend se lee, no se cambia: si una forma de datos tiene
  que cambiar, se cambia aquí y se propaga.
- **No cambiar el diseño de la plantilla Modernize.** Se usan sus componentes y
  su tema; los colores se piden al tema (`primary.main`), nunca en hexadecimal.
- **Datos ficticios primero**: nadie lee `env.usarMocks` directo, se usa
  `usarMocksPara(modulo)`. Un módulo sin backend se ve como «Próximamente» en
  producción (`moduloEnConstruccion`).
- **Una ficha en `docs/vistas/` por pantalla**, y se actualiza al terminar el
  módulo.
- **Errores**: 422 con `errors` por campo, en español; listas siempre paginadas;
  el filtro de búsqueda se llama `search`.
- **Secretos** (claves, contraseñas, `.env`) solo en Coolify y Bitwarden, nunca
  en el repo ni en el chat.

## 4. Qué está haciendo cada quien

Para no pisarnos. Se actualiza cuando alguien toma o termina algo.

| Quién | Qué | Estado |
|---|---|---|
| Jean (con Claude) | 4.4 recordatorios → 4.5 cada aviso a quien le toca → 6.6/6.7/6.8 la reserva en la tienda | en curso |
| **Sandro** | 1. `chore/header-sin-restos-de-plantilla`: quitar «Apps», «Chat», «Calendar», «Email», la bandera y la campana falsa del header (solo frontend) | por empezar |
| **Sandro** | 2. **Story 3.3** «Un tablero que dice la verdad»: `GET /dashboard` en el backend (hoy el frontend lo calcula con varias llamadas, ver `dashboard.api.ts`) | después |
| **Sandro** | Después: 3.2, 3.1 y la Épica 5 (marca del negocio); 9.2 (términos y privacidad) si hace falta | backlog |

**Mejor no tocar** sin hablarlo antes: la Épica 4 (avisos), 6.6–6.12 y la
Épica 7 (tienda y pagos) y la Épica 8 (planes): dependen de los avisos o tocan
lo mismo que está en curso.
