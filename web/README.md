# web — Frontend

Next.js 16 (App Router) + React 19 + MUI 7, sobre la plantilla Modernize.

```bash
npm install
cp .env.example .env.local   # ajusta la URL de Laravel
npm run dev                  # http://localhost:3000
npm run typecheck            # tsc --noEmit
```

## Rutas

| Ruta | Archivo |
|---|---|
| `/` | `src/app/(dashboard)/page.tsx` |
| `/clientes` | `src/app/(dashboard)/clientes/page.tsx` |
| `/ajustes`, `/ajustes/perfil` | `src/app/(dashboard)/ajustes/` |
| `/login`, `/register`, `/forgot-password`, `/two-steps` | `src/app/(auth)/` |
| `/error`, `/maintenance` | `src/app/` |

Los grupos entre paréntesis — `(dashboard)`, `(auth)` — **no aparecen en la URL**;
solo sirven para que cada grupo tenga su propio layout.

## Capas

```
page.tsx  →  features/<modulo>/hooks  →  features/<modulo>/services  →  lib/api/client (axios)
```

Ningún componente llama a `axios` directamente. La regla mantiene el manejo de
errores, el token CSRF y la invalidación de caché en un solo sitio.

## Personalizar el tema

- Colores y paletas: `src/utils/theme/LightThemeColors.tsx` y `DarkThemeColors.tsx`
- Tipografía: `src/utils/theme/Typography.tsx`
- Overrides de componentes MUI: `src/utils/theme/Components.tsx`
- Defaults de layout (sidebar, modo, dirección): `src/context/config.ts`
- Logo: `src/layout/shared/logo/Logo.tsx`

El panel flotante "Customizer" (`src/layout/shared/customizer/`) es útil en
desarrollo para probar temas; quítalo de `src/app/(dashboard)/layout.tsx` antes
de salir a producción si no quieres exponerlo a los usuarios.
