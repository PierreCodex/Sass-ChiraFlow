---
title: 'Story 1.11 — Mi perfil deja de ser una maqueta'
type: 'feature'
created: '2026-11-03'
status: 'done'
route: 'full'
review: 'thorough'
baseline_commit: 'develop'
---

## Intent

Que cualquier usuario del panel cambie sus datos y su contraseña de verdad, sin
depender del dueño (PRD FR-6).

## Historia

Codex empezó la historia en su copia (`wt-fe-codex`) y la dejó sin commit,
sobre un `develop` de septiembre. Claude la trasladó a una rama nueva desde el
`develop` actual (2026-11-03), la revisó y la terminó. La copia de Codex queda
intacta como respaldo.

## Lo que hizo Codex (se conserva)

- Se apaga la rama mock de Mi perfil (apunte del sprint 1): lee y escribe
  contra el backend por el BFF.
- `nombre` y `apellido` sueltos, sin partir `name`.
- Validación igual a la del backend: teléfono `+51` y 9 dígitos, documento
  alfanumérico con guiones hasta 20, contraseña nueva distinta de la actual.
- Errores 422 bajo cada campo; el resto, arriba del formulario.
- Avisos flotantes al guardar; un refresco no pisa una edición pendiente.
- **Foto de solo lectura** (decisión A del 2026-09-28): `PUT /user` solo admite
  la foto como texto, así que la pantalla la enseña y no la envía. La subida
  real queda pendiente y FR-6 sigue parcial.

## Lo que añadió Claude

- **El rol del negocio**, no el central: `users.rol` convierte a Recepción y a
  los roles propios en «profesional», así que una recepcionista leía
  «Profesional». Backend: `GET /capacidades` devuelve `rol: { clave, nombre }`.
  Panel: `useNombreDelRol()` en la tarjeta de Mi perfil, el menú lateral y la
  cabecera.
- **Teléfono como en el registro**: `+51` fijo y se escriben los 9 dígitos; el
  panel envía `+51987654321`.
- Fuera lo que no estaba listo: Codex añadió `@playwright/test` y un script
  `test:perfil` que apuntaba a una prueba que no existía en el repo.
- `docs/vistas/perfil.md` al día.

## Verification

- `npm run typecheck` en verde.
- Backend: `CapacidadesTest` con 3 pruebas nuevas (rol del sistema, rol propio
  sin clave, sin cuenta → null) y `PerfilTest` en verde.
- En el navegador contra el backend real, con una cuenta de Recepción: datos
  reales, el rol «Recepción» en los tres sitios, guardado con aviso, teléfono
  guardado como `+51912345678`, el nombre nuevo en el menú sin recargar, y una
  contraseña actual equivocada con «Tu contraseña actual no es correcta.» bajo
  su campo. Los datos se dejaron como estaban.

## Pendiente

- Subida real de la foto (FR-6 parcial).
- Cambio de correo con nueva verificación.
