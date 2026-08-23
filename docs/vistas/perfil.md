# Mi perfil

**Ruta:** `/configuracion/perfil`
**Estado:** ✅ Maquetado y **leyendo del backend real** (2026-08-23) ·
⚠️ la escritura sigue en mocks hasta que existan `PUT /user` y
`PUT /user/password`
**Archivos:**
- `web/src/app/(dashboard)/configuracion/perfil/page.tsx`
- `web/src/features/perfil/components/{DatosPersonales,CambiarPassword,TarjetaCuenta}.tsx`
- `web/src/features/perfil/{types.ts,schemas,services,hooks}`

---

## Qué es

La cuenta de **la persona**, no la del negocio. Es la distinción que evita la
mitad de las dudas: lo de la empresa está en
[Configuración](configuracion.md), y el horario o la biografía pública de quien
atiende están en su ficha de [Empleados](empleados.md).

Tres bloques:

| Bloque | Contiene |
|---|---|
| **Información personal** | Foto, nombres, apellidos, email (bloqueado), teléfono, DNI |
| **Cambiar contraseña** | Actual + nueva + confirmación |
| **Tarjeta de la cuenta** | Avatar, rol y qué permite ese rol, y el negocio al que perteneces |

Antes de esto la pantalla era una **maqueta estática**: dos campos sueltos que
no leían ni guardaban nada, ni siquiera llamaban a `GET /user`.

---

## Qué se puede editar, y qué no

| Campo | Editable | Por qué |
|---|---|---|
| Foto | ✅ | Es el avatar del panel y, si atiende, el de su ficha pública |
| Nombres · Apellidos | ✅ | |
| Teléfono | ✅ | |
| DNI | ✅ (opcional) | Identifica al titular al conciliar pagos por Yape/QR |
| **Email** | ❌ | **Es el login y es único global**: cambiarlo obliga a poner `email_verified_at` a null y repetir la verificación, con el usuario a medias mientras tanto. Se muestra deshabilitado, con un tooltip que explica el porqué y manda a Soporte |
| Rol | ❌ | Nadie se asciende a sí mismo. Los roles del equipo se dan en Empleados |
| Nombre del negocio, slug | ❌ | Configuración y el paso 1 del onboarding; el slug es inmutable |

### Los dos "restablecer contraseña" no son el mismo

| Caso | Dónde | Pide |
|---|---|---|
| **No puedo entrar** | `/forgot-password` → correo → `/reset-password` | Solo el email |
| **Estoy dentro** | Aquí | La **contraseña actual** |

El segundo no reusa el flujo del correo a propósito: mandar a la bandeja a
alguien que ya está autenticado es fricción gratuita. Y exige la actual porque,
sin eso, cualquiera que se siente frente a una sesión abierta se queda con la
cuenta. Aun así la tarjeta enlaza al flujo por correo, para quien llega aquí y
resulta que tampoco la recuerda.

---

## Endpoints

`GET /user` ya existe y es lo que alimenta la pantalla. Lo que falta:

```jsonc
// PUT /api/user
{ "nombre": "María", "apellido": "Quispe", "telefono": "+51987654321",
  "documento": "70123456", "foto": "https://…" }
// → { data: Usuario }

// PUT /api/user/password
{ "password_actual": "…", "password": "…", "password_confirmation": "…" }
// → 200 · 422 errors.password_actual si no cuadra
```

Al cambiar la contraseña, el backend debe **revocar los demás tokens** y
conservar el actual: es lo que se espera de quien la cambia porque sospecha
que entraron a su cuenta.

⚠️ **`PUT /user` tiene que propagar `nombre`, `foto` y `telefono` a
`profesionales`**, que los lleva denormalizados (*"denormalizado p/ mostrar sin
ir a central"*, dice la migración). Si no, el dueño cambia su nombre y en
Empleados y en la tienda pública sigue el viejo.

---

## Referencia: cómo lo hace AgendaPro

Se revisó su pantalla `/profile` (2026-08-23) antes de decidir. Confirma dos
cosas y desaconseja otras dos:

- ✅ El **email sale deshabilitado**, en gris y con un tooltip.
- ✅ **Cambiar contraseña dentro del perfil**, con la actual.
- ❌ **Firma + PIN de 4 dígitos**: existe porque ellos firman **fichas de
  pacientes**. Sin módulo de fichas, una firma no tiene qué firmar.
- ❌ **Código de colegiatura**: es de la vertical salud, y aquí también hay
  barberías y salones. Si llega esa vertical, iría en `profesionales`.

Fíjate dónde ponen ellos el **RUT/DNI**: en la columna de la firma, no en
información personal. Es el DNI *del profesional que firma la ficha*. Copiar
el campo sin copiar el motivo deja un campo que nadie rellena.

---

## Verificado en el navegador (2026-08-23)

- La pantalla carga con los datos reales de `GET /user`: nombres, apellidos y
  email de quien inició sesión.
- Cambiar el nombre y guardar → el **sidebar y el avatar del header cambian sin
  recargar** (el usuario nuevo entra en la caché de React Query).
- Recargar → vuelven los valores del backend: la escritura es mock y no
  persiste, que es justo lo que se espera hasta que exista `PUT /user`.
- Contraseña: enviar vacío → los tres mensajes; con la confirmación distinta →
  "Las contraseñas no coinciden".
- Móvil (390 px) sin desbordes; las dos columnas se apilan.

---

## Pendiente

- [ ] **`users` no tiene columna `documento`** y `UsuarioResource` no emite
      `nombre`/`apellido` sueltos ni `telefono`. Mientras tanto los nombres se
      parten de `name` con `separarNombre()`, que es **lossy**: "Ana María
      Quispe" se guardaría como nombre "Ana" y apellido "María Quispe".
      Anotado en los traspasos de [estado.md](../estado.md)
- [ ] `PUT /user` y `PUT /user/password` (contrato § Autenticación)
- [ ] Decidir si el cambio de email entra en v2, con re-verificación
- [ ] `tenants` no tiene **RUC ni razón social**: hace falta para cobrar y para
      que el negocio emita comprobantes. También en traspasos
