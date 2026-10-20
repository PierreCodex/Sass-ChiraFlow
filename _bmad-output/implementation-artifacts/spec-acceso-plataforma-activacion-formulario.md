---
title: 'Esperar la activación del formulario antes de aceptar credenciales'
type: 'bugfix'
created: '2026-10-19'
status: 'done'
route: 'oneshot'
route_source: 'auto'
review: 'quick'
review_source: 'auto'
lenses_ran: ['quick']
baseline_commit: '609f816f3c95dc700bcf1f7f9a42a2d82a1da806'
context: []
---

<frozen-after-approval reason="intención del usuario">

## Intent

El usuario sigue sin poder solicitar el código: al pulsar el botón se vacían los campos. Evitar que el HTML del acceso a plataforma acepte o envíe credenciales antes de que se active su comportamiento interactivo. Mostrar una explicación visible si no se activa, conservar el envío normal y evitar el envío nativo de contraseñas en la URL.

</frozen-after-approval>

## Implementation Notes

- Continuación del arreglo de autocompletado, limitada al formulario. No cambia cuentas ni backend.
- Con JavaScript activo, prueba real contra el BFF y Laravel con usuario inexistente: POST 422 en `/api/plataforma/acceso/codigo`, aviso correcto, campos conservados y cero errores de JavaScript.
- Con JavaScript deshabilitado se reproduce el vaciado: el formulario hace un GET nativo con email y password en la consulta. Se usaron exclusivamente datos ficticios. Esta reproducción no confirma todavía la configuración del navegador del usuario.
- Arreglo: habilitar los campos y el botón después del montaje; usar POST como método nativo y mostrar instrucciones mientras no se active el formulario.

## Verification

- TypeScript y revisión del diff.
- Navegador sin JavaScript y con scripts bloqueados: campos y botón deshabilitados, aviso visible y ninguna navegación con credenciales.
- Navegador normal: campos activos, escritura/autocompletado, POST y errores conservando valores, paso del código y reenvío con API simulada.
- Resultado: todas las comprobaciones anteriores pasan. TypeScript y `git diff --check` correctos.
- Sigue pendiente confirmar la causa concreta en el navegador del usuario. No se ha comprobado entrega real de correo ni se ha modificado una cuenta.

## Review Triage Log

- Revisión quick independiente: sin hallazgos. El HTML inicial bloquea los campos y el envío; POST impide credenciales en la URL; el flujo interactivo mantiene FormData y BFF.
