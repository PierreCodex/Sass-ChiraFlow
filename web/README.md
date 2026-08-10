# web — Frontend

Next.js 16 (App Router) + React 19 + MUI 7, sobre la plantilla Modernize.

```bash
npm install
cp .env.example .env.local   # ajusta la URL de Laravel
npm run dev                  # http://localhost:3000
npm run typecheck            # tsc --noEmit
```

## Desplegar en Vercel

El repo es un monorepo, así que hay **un ajuste obligatorio**:

> **Root Directory: `web`**
> (Vercel → Settings → General → Root Directory)

Sin eso, Vercel busca el `package.json` en la raíz y el build falla.

### Variables de entorno

**Ninguna es obligatoria para la maqueta.** `.env.local` no se sube al repo, y
los valores por defecto de `src/config/env.ts` ya son los del proyecto: soles,
formato peruano y mocks activos. Un despliegue limpio se ve bien sin tocar nada.

Se configuran solo si quieres cambiar algo:

| Variable | Por defecto | Para qué |
|---|---|---|
| `NEXT_PUBLIC_USE_MOCKS` | `true` | Ponla en `false` cuando exista el backend |
| `NEXT_PUBLIC_APP_NAME` | `Mi SaaS` | Título del navegador |
| `NEXT_PUBLIC_CURRENCY` | `PEN` | Moneda de los importes |
| `NEXT_PUBLIC_LOCALE` | `es-PE` | Formato de fechas y números |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api` | Solo con mocks apagados |

⚠️ **No pongas `NEXT_PUBLIC_USE_MOCKS=false` en el despliegue de la maqueta**:
sin Laravel accesible, todas las pantallas mostrarían "No se pudo conectar con
el servidor".

### Qué verá quien abra el enlace

Todo funciona sobre datos ficticios en memoria: se puede crear, editar y
eliminar, y los cambios se ven al instante. **Se pierden al recargar** — cada
carga de página reinicia los mocks.

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
