---
title: 'Story 1.9 — Todos los errores en español'
type: 'feature'
created: '2026-10-20'
status: 'in-review'
route: 'full'
review: 'quick'
baseline_commit: 'sandro/develop'
---

## Intent

Evitar que el panel reciba mensajes de validación, autenticación o límite de
solicitudes en inglés.

## Implementation

- La aplicación usa `es` como idioma y fallback por defecto.
- Se añadió el catálogo `lang/es/validation.php` con reglas y atributos de
  negocio (`profesional`, `sede`, `fecha y hora de inicio`, entre otros).
- Las excepciones JSON de sesión y rate limit devuelven mensajes y códigos en
  español.

## Verification

`tests/Feature/ErroresEspanolTest.php` cubre validaciones genéricas y de login,
atributos de negocio, acceso sin sesión y límite de solicitudes. La prueba
enfocada pasó: 4 tests, 13 assertions.

### Review Findings

- [x] [Review][Patch] Completar las traducciones para todas las reglas usadas, incluida `exclude_unless`, para evitar mensajes no traducidos [Backend-Sass/lang/es/validation.php:3-85]
- [x] [Review][Patch] Aplicar las respuestas JSON en español a las excepciones de API aunque la petición no envíe `Accept: application/json` [Backend-Sass/bootstrap/app.php:43-59]
- [x] [Review][Patch] Aislar la prueba del rate limit para que no dependa del estado compartido ni contamine otras pruebas [Backend-Sass/tests/Feature/ErroresEspanolTest.php:39-57]
- [x] [Review][Patch] Cubrir con una prueba el fallback español cuando el locale activo no tiene traducciones [Backend-Sass/tests/Feature/ErroresEspanolTest.php:5-30]

#### Rejected

- `false`: que `APP_LOCALE` y `APP_FALLBACK_LOCALE` sigan siendo configurables no contradice el cambio: los valores por defecto son `es` y el despliegue puede declarar explícitamente otro idioma.
