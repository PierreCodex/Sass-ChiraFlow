# Mi perfil

**Ruta:** `/configuracion/perfil`
**Estado:** lectura y escrituras mediante el BFF; foto temporalmente de solo lectura (decisión A, 2026-09-28, FR-6 parcial).

## Qué muestra

La cuenta de la persona: nombres, apellidos, teléfono y documento editables;
correo bloqueado; avatar existente, rol y negocio en lectura. Los permisos
proceden de las capacidades del servidor y no se deducen de la etiqueta del rol. El rol que se muestra es el **del negocio** (`GET /capacidades` → `rol.nombre`), aquí, en el menú lateral y en la cabecera: el central diría «Profesional» a una recepcionista.
Debajo, **Avisos por WhatsApp** (Story 4.8b): el número de la persona para
recibir los avisos del equipo, que se activa escribiendo un código desde ese
WhatsApp.

La foto conserva su valor al guardar los demás campos. No hay selector de
archivo; la pantalla explica que la subida está pendiente.

## Endpoints y validación

El navegador llama a `/api`; el BFF conserva el token en cookie httpOnly.

```jsonc
// GET /api/user → { data: Usuario }
// PUT /api/user → { data: Usuario }
{ "nombre": "Ana María", "apellido": "Quispe Rojas",
  "telefono": "+51987654321", "documento": "CE-12345" }
// No enviar foto: omitirla conserva el avatar existente.

// PUT /api/user/password → 200
{ "password_actual": "…", "password": "…", "password_confirmation": "…" }
// 422 errors.password_actual si no coincide; revoca otros tokens y conserva el actual.
```

| Campo | Regla |
|---|---|
| Nombres y apellidos | Obligatorios, máximo 150 cada uno; no partir `name`. Un apellido nulo se muestra vacío. |
| Teléfono | Opcional. El `+51` es fijo y se escriben los nueve dígitos, como en el registro; el panel envía `+51987654321` |
| Documento | Opcional; letras, números y guiones, máximo 20 caracteres |
| Nueva contraseña | Mínimo ocho caracteres; distinta de la actual y confirmada |
| Correo, rol | Solo lectura. El rol es el **del negocio**, de `GET /capacidades` → `rol.nombre` (Story 1.11): `usuario.rol` es el central y diría «Profesional» a una recepcionista |
| Foto | Solo lectura; subida pendiente. El endpoint acepta cadena de hasta 255 o null, pero esta pantalla omite el campo. |

Un fallo de lectura se muestra con reintento, sin formulario vacío editable.
Los errores 422 aparecen junto a los campos; los rechazos sin campo aplicable,
403 y fallos de red permanecen visibles. Un rechazo conserva los datos escritos.
Los refrescos no sustituyen una edición pendiente. El guardado restablece el
formulario desde la respuesta del servidor y actualiza el panel sin recargar;
las cachés de profesionales y usuarios se invalidan para recoger la propagación.
Los avisos compartidos confirman únicamente respuestas satisfactorias.

### Avisos por WhatsApp (Story 4.8b)

```jsonc
// GET /api/user/whatsapp → { data: WhatsappEquipo | null }
// PUT /api/user/whatsapp { "telefono": "+51911111111" } → { data: WhatsappEquipo }
// DELETE /api/user/whatsapp → 204
```

Forma y reglas en `docs/api-contract.md` (§ Avisos por WhatsApp del equipo).

| Estado | Qué se ve |
|---|---|
| Sin número | Para qué sirve, el campo con `+51` fijo (propone el teléfono de la ficha) y «Continuar» |
| `pendiente` | El número, «Falta activarlo», el mensaje `ACTIVAR <código>` en grande con su vencimiento y **Abrir WhatsApp** (wa.me con el texto ya escrito). Se vuelve a pedir cada 5 s: al activarlo desde el celular, la tarjeta pasa sola a «Activo» con un aviso |
| `pendiente` vencido | «El código venció» y **Pedir otro** (PUT con el mismo número) |
| Sin número de la plataforma | El código, sin enlace: «aún no están disponibles» |
| `activo` | El número, «Activo», desde cuándo y que también puede responder BAJA |

En todos: **Cambiar número** (vuelve a pendiente) y **Quitar**, con
confirmación. El 422 (formato, tope del plan, número de otra persona) va bajo
el campo.

## Pendiente

- Subida real de foto: FR-6 sigue parcial por la decisión A aprobada.
- Cambio de correo con nueva verificación, fuera del alcance de esta historia.

## Verificación

4.8b: alta, pendiente con enlace, paso solo a «Activo» al llegar el
ACTIVAR por el webhook, cambiar número y quitar, comprobado en el navegador
contra el backend local, también a 390 px.

Comprobado en el navegador contra el backend (Story 1.11): datos reales al
abrir, guardado sin recargar, contraseña actual equivocada con su 422 en
español bajo el campo, y el rol del negocio en la tarjeta. El repo no tiene
pruebas automáticas de interfaz.
