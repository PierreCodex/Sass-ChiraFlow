# Registro

**Ruta:** `/register`
**Estado:** ✅ Maquetado y **conectado al backend real** (2026-08-16), con sus
dos pantallas hermanas (`/verificar-correo` y `/reset-password`)
**Archivos:**
- `web/src/app/(auth)/register/page.tsx` — variante **side** de la plantilla
  (`auth/auth1`): ilustración a la izquierda, formulario a la derecha
- `web/src/features/auth/components/AuthRegister.tsx`
- `web/src/features/auth/schemas/registro.schema.ts`
- `web/src/features/auth/types.ts` (rangos, `separarNombre`, `normalizarTelefono`)
- `web/src/app/(auth)/verificar-correo/page.tsx` + `features/auth/components/VerificacionCorreo.tsx`
- `web/src/app/(auth)/reset-password/page.tsx` + `features/auth/components/ResetPasswordForm.tsx`
- `web/src/features/auth/components/ReenviarVerificacion.tsx` (botón con cuenta atrás)
- `web/src/app/(auth)/forgot-password/page.tsx` + `features/auth/components/AuthForgotPassword.tsx`

---

## Qué es

La entrada al producto: el formulario que crea el negocio (tenant) y su
dueño. **No pide el nombre del negocio** — eso se decide con calma en el
paso 1 del [onboarding](onboarding.md); el tenant nace **sin slug**
(`slug NULL`) y con la tienda pública apagada hasta que el nombre exista.

Flujo completo decidido:

```
registro (sin slug) → verificar correo → PROVISIONING de la BD del tenant
→ primer login → panel con checklist de onboarding
```

El provisioning se dispara **al verificar el correo**: cuando el usuario entra
por primera vez, su BD ya existe.

---

## Campos, en orden

| # | Campo | Control | Obligatorio | Notas |
|---|---|---|---|---|
| 1 | Tipo de negocio | Select | Sí | Opciones de `GET /publico/categorias-negocio` |
| 2 | Profesionales | Select | Sí | `independiente` · `2` · `3-5` · `6-15` · `+16` |
| 3 | Nombre y apellido | Texto **único** | Sí | De la persona, no del negocio. Se parte en dos al enviar |
| 4 | Email | Email | Sí | Único **global** (§2.10 de discrepancias) |
| 5 | Teléfono | Texto con prefijo fijo `+51` | Sí | Se normaliza a `+51987654321` **antes de enviar** |
| 6 | Contraseña | Password con ojo de mostrar/ocultar | Sí | Mínimo 8 |

### Un campo en pantalla, dos en el contrato

El formulario pide "nombre y apellido" junto —así lo hace la referencia y así
lo escribe la gente— pero el contrato guarda `nombre` y `apellido` separados.
`separarNombre()` toma la primera palabra como nombre y el resto como
apellido: *"María de los Ángeles Quispe Rojas"* → `nombre: "María"`,
`apellido: "de los Ángeles Quispe Rojas"`. El esquema exige **dos palabras**,
así que `apellido` nunca llega vacío, y un 422 en cualquiera de los dos campos
se pinta sobre el campo único.

**Tampoco hay confirmación de contraseña** (la referencia no la tiene), pero
el backend valida `confirmed`: el cliente manda `password_confirmation` con el
mismo valor. Si algún día se quiere la confirmación real, es añadir el campo,
no tocar el backend.

Tras enviar, la tarjeta se sustituye por el panel **"Revisa tu correo"** con
el email, un botón de reenvío (`POST /email/reenviar`) y el enlace al login.
El registro **no abre sesión**: tras verificar, el usuario pasa por el login
normal.

### Normalización del teléfono

El input muestra el prefijo `+51` fijo y el usuario escribe los 9 dígitos.
Antes de enviar se quita todo lo que no sea dígito y se antepone `+51`:
`987 654 321` → `+51987654321`. Es el mismo formato que usará WhatsApp.

---

## Endpoints

### `GET /api/publico/categorias-negocio`

Sin sesión. Alimenta el select del tipo de negocio (tabla
`business_categories` de la BD central).

```json
{ "data": [ { "id": 3, "nombre": "Barbería" }, { "id": 7, "nombre": "Clínica dental" } ] }
```

### `POST /api/register`

```json
{
  "tipo_negocio_id": 3,
  "rango_profesionales": "3-5",
  "nombre": "María",
  "apellido": "Quispe",
  "email": "maria@correo.pe",
  "telefono": "+51987654321",
  "password": "secreta123",
  "password_confirmation": "secreta123"
}
```

| Campo | Reglas |
|---|---|
| `tipo_negocio_id` | requerido, existente en `business_categories` |
| `rango_profesionales` | requerido, uno de los 5 valores |
| `nombre` / `apellido` | requeridos, máx. 150 |
| `email` | requerido, email, **único global** |
| `telefono` | requerido, formato `+51` + 9 dígitos |
| `password` | requerida, mín. 8, confirmada |

**Qué hace el backend** (una sola transacción): crea `tenants` con `slug NULL`,
plan de prueba del seeder y `estado='registrada'`; crea el
`users` dueño (con fila en `profesionales` del tenant al provisionar,
`atiende=1`); envía el correo de verificación.

**Respuesta (201):** `{ "data": Usuario }` — sin token, sin cookie.

### `POST /api/email/verificar`

El enlace del correo apunta al **frontend** (`/verificar-correo?...`), que
reenvía los parámetros firmados:

```json
{ "id": 12, "hash": "…", "expires": 1765400000, "signature": "…" }
```

200 → marca `email_verified_at` y **encola el job de provisioning** de la BD
del tenant. Enlace vencido o firma inválida → 422 con `message`.

### `POST /api/email/reenviar`

`{ "email": "maria@correo.pe" }` → 200 **siempre**, exista o no la cuenta.

Trae `retry_after` en segundos, y también lo trae el **429** cuando el
cooldown por correo (60 s) sigue corriendo. La cuenta atrás del botón usa ese
valor y nunca uno escrito en el frontend: el límite es por correo, así que
otra pestaña puede haber consumido parte del tiempo. Ver api-contract.md §
Autenticación.

---

## Las pantallas del correo

### `/verificar-correo?id&hash&expires&signature`

Pública —el registro no abre sesión— y sin guard. Al montar reenvía los
cuatro parámetros **tal como llegaron** a `POST /email/verificar`:
`expires` es un timestamp Unix y `signature` un HMAC sobre `id|hash|expires`,
de modo que tocar cualquiera invalida la firma.

- **200** → "¡Listo!" con el mensaje del backend y botón al login. El endpoint
  es **idempotente**: recargar vuelve a dar 200, así que la segunda visita no
  se trata como error.
- **422** → enlace vencido (duran 48 h) o firma que no cuadra: se muestra el
  `message` del backend y un campo de email para pedir uno nuevo.
- Si faltan parámetros en la URL no se llama al backend: mismo panel de
  enlace inválido.

`useSearchParams` suspende el árbol durante el prerender, así que la página
envuelve el componente en `<Suspense>`; sin eso la build falla. Y el POST se
guarda tras un `useRef` porque en desarrollo React monta dos veces.

### `/forgot-password`

Pide el email y llama a `POST /forgot-password`, que responde **200 exista o
no la cuenta**. Por eso el panel de éxito repite el mensaje del backend ("Si el
correo está registrado…") en vez de afirmar que se envió: el frontend no sabe
—ni debe saber— si esa cuenta existe.

### `/reset-password?token&email`

Mismo patrón. `token` y `email` vienen de la URL y no se editan; el usuario
solo elige contraseña y confirmación (mínimo 8, iguales). Un token vencido o
ya usado vuelve como **422 con `errors.email`**, que se pinta en el Alert de
arriba porque ese campo no está en pantalla.

---

## Diferencias con la app actual

| Elemento | En el Laravel anterior | Aquí |
|---|---|---|
| Nombre del negocio | Se pedía en el registro y fijaba el slug al instante | Se pide en el onboarding; sin slug mientras tanto |
| Plan asignado | Bug: `slug 'profesional'` no existía y caía en `Plan::first()` | Plan de prueba explícito del seeder |
| Verificación de correo | No había | Obligatoria antes del login |
| Provisioning | Todo en la BD única al registrar | Job en cola al verificar el correo |

---

## Verificado en el navegador (2026-08-16)

Contra el Laravel real, con `POST /api/register` devolviendo **201**:

- Enviar vacío → los 6 mensajes de validación del cliente.
- `987-654 321` → se guarda `+51987654321` (el campo solo admite dígitos y
  corta a 9).
- *"María de los Ángeles Quispe Rojas"* → `nombre` y `apellido` correctos.
- Verificación: enlace firmado real → 200 y panel "¡Listo!"; recargar → 200 otra
  vez (idempotente, un solo POST por visita); firma manipulada → 422 con el
  texto del backend y el formulario de reenvío.
- Cooldown: primer reenvío → cuenta atrás desde el `retry_after` del 200
  (60 s, y baja 5 en 5 s exactos); pedir otro dentro de la ventana → 429, se
  muestra su `message` y la cuenta se reinicia con los segundos **que
  faltaban** (46 s), no con 60.
- Recuperación: enviar vacío → "Ingresa tu email"; con un email real → 200 y
  panel "Revisa tu correo" con el mensaje del backend.
- Reset: contraseñas distintas → "Las contraseñas no coinciden"; iguales →
  200 y panel de éxito; reusar el mismo token → 422 "El enlace de
  restablecimiento no es válido o ya venció"; sin `token`/`email` en la URL →
  panel de enlace incompleto sin llamar al backend.
- El tenant nace con `slug NULL`, `estado='registrada'`, `rango='3-5'` y un id
  aleatorio (`yl9njvhq`); el usuario con `rol='dueno'` y sin verificar.

Sobre el layout: se probó primero la tarjeta centrada (`auth2`) y se cambió a
la variante **side** (`auth1`) porque con seis campos la tarjeta no cabía en
`100vh`. En 1440×900 el formulario entra entero sin scroll; por debajo de `lg`
la ilustración se oculta y queda solo el logo con el formulario.

---

## Pendiente

- [ ] El seeder tiene la categoría **"Otro"**, que según su comentario debería
      pedir un detalle libre (`tenants.categoria_otro_detalle`), pero
      `POST /register` no acepta ese campo: o se añade al contrato o se quita
      la columna
- [ ] ¿`rango_profesionales` precarga algo? (p. ej. sugerir plan en Mi Plan,
      o marcar solo el paso 3 del onboarding si es `independiente`)
- [ ] Textos definitivos y estados de error (email ya registrado, enlace
      vencido)
