---
title: 'Permitir enviar las credenciales visibles del panel de plataforma'
type: 'bugfix'
created: '2026-10-19'
status: 'done'
route: 'oneshot'
route_source: 'auto'
review: 'quick'
review_source: 'auto'
lenses_ran: ['quick']
baseline_commit: '75e9c8af5fb572ee5991e727f49e682bb3159308'
context: []
---

<frozen-after-approval reason="intención del usuario">

## Intent

El usuario llena correo y contraseña en `/plataforma/login`, pero «Enviarme el código» sigue deshabilitado. Permitir enviar los valores presentes en los campos, incluso cuando se rellenan sin eventos de cambio, y mostrar un error en español si falta alguno. Conservar la autenticación del backend, el paso del código y el reenvío.

</frozen-after-approval>

## Implementation Notes

- Arreglo acotado a `web/src/app/plataforma/login/page.tsx`; ruta oneshot.
- Reproducción con Playwright: escribir mediante `fill` habilita el botón; asignar los valores nativos sin eventos mantiene el botón bloqueado. Esto reproduce un caso compatible con el síntoma; no prueba qué navegador o mecanismo usó el usuario.
- Los cambios previos en documentación son ajenos al arreglo y se conservan. No corresponde cerrar ninguna historia del sprint.
- Se leen las credenciales con FormData al enviar; los campos tienen name y autoComplete. El botón inicial solo se deshabilita durante la petición. Los campos vacíos muestran un aviso en español.
- Correo y contraseña se conservan para reenvío y regreso al primer paso; se asignan claves distintas a los campos para que React no reutilice el input del código al volver.

## Verification

- `npm run typecheck`.
- Navegador con API interceptada: escritura normal, valores sin eventos, campos vacíos, petición pendiente, error y reintento, paso de código y reenvío. Ningún correo real.
- Resultado: TypeScript correcto. Pruebas de navegador correctas, incluyendo volver y editar los datos; sin errores de JavaScript. API simulada: no se verificó entrega real de correo.
- `git diff --check`: correcto.

## Review Triage Log

- Revisión independiente quick: sin hallazgos en el diff ni en el código circundante. Sin elementos diferidos.
