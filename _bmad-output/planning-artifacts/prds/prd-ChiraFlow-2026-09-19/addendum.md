# Addendum técnico del PRD — ChiraFlow

Profundidad que no es de producto y que hereda la arquitectura BMAD
(`bmad-architecture`). No duplica: remite a las fuentes vigentes.

## Stack y topología (implementado)

- **Backend** `D:\PERSONAL_JEAN\Backend-Sass`: Laravel 12, API pura, PHP 8.3,
  Pest, MySQL 8/MariaDB. stancl/tenancy v3 **multi-BD** (central + `tenant_{id}`).
  Sanctum por tokens Bearer. Correo por Resend, encolado.
- **Frontend** `D:\PERSONAL_JEAN\Sass-ChiraFlow\web`: Next.js 16, React 19,
  MUI 7 (plantilla Modernize, tema `AQUA_THEME`), TanStack Query. **BFF** en
  `app/api/[...path]` con token en cookie httpOnly.
- Dominios separados panel / tiendas (decisión de `plan-backend.md` §1, por el
  dominio personalizado del plan Pro).

## Documentos que la arquitectura debe citar, no copiar

| Documento | Para qué |
|---|---|
| `Sass-ChiraFlow/docs/api-contract.md` | Forma de cada endpoint. Original único |
| `Backend-Sass/docs/discrepancias.md` | Decisiones de datos congeladas; prevalece sobre los SQL |
| `Backend-Sass/database/migrations/**` | Esquema real (los SQL de `docs/` son un volcado) |
| `Backend-Sass/CLAUDE.md` § Decisiones de producto | Invariantes de negocio y de seguridad |
| `Backend-Sass/docs/pendientes-contrato.md` | El porqué de cada divergencia implementada |

## Puntos técnicos abiertos para la arquitectura

Detalle y opciones en `../../diagnostico-2026-09-19.md` §2.2–2.3:
D-01 permisos del formulario de cita, D-05 regla de migraciones de tenant,
D-06 paridad del motor de huecos, D-07 scheduler/worker/despliegue, D-12 SEO
de la tienda, pipeline público sin sesión, servicio de cuotas único.
