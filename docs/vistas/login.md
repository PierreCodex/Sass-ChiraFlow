# Login

**Ruta:** `/login`
**Estado:** ✅ Maquetado y **conectado al backend real** (2026-08-16)
**Archivos:**
- `web/src/app/(auth)/login/page.tsx` (tarjeta centrada de la plantilla)
- `web/src/features/auth/components/AuthLogin.tsx`

---

## Qué es

La puerta del panel. Tres campos —email, contraseña y "Recordarme"— y nada
más: **no hay OAuth** (decisión cerrada), así que se quitaron los botones
sociales y el divisor "or sign in with" que traía la plantilla.

El formulario habla con el **BFF**, nunca con Laravel directo:

```
POST /api/auth/login   { email, password, remember }
```

El BFF reenvía `{ email, password }` a Laravel, se queda con el token y lo
guarda en la cookie **httpOnly**; al navegador solo le vuelve
`{ data: Usuario }`. Por eso la redirección al panel se hace **después** del
200, no con un `<Link>`: hasta que la cookie no existe, no hay sesión.

`remember` no viaja a Laravel: lo consume el BFF para decidir la vida de la
cookie — 30 días si está marcado, cookie de sesión si no.

---

## Campos

| Campo | Control | Notas |
|---|---|---|
| Email | Texto `type="email"` | Identifica a una sola persona: es único **global** (§2.10) |
| Contraseña | Password con ojo de mostrar/ocultar | |
| Recordarme | Checkbox, marcado por defecto | Va como `remember` en el cuerpo |

La validación del cliente (requeridos y formato de email) es **de
conveniencia**: ahorra un viaje y nada más. La que decide es la del backend, y
sus errores se pintan tal como lleguen.

---

## Las cinco respuestas y cómo se pintan

| Código | Qué es | Qué hace la pantalla |
|---|---|---|
| **200** | `{ data: Usuario }` + cookie | Guarda el usuario en la caché de React Query y navega al panel |
| **422** | `errors` por campo | Cada array bajo su campo. **Las credenciales incorrectas llegan como `errors.email`**, no como error global |
| **403** | `{ message }` — correo sin verificar | Muestra el mensaje y ofrece el reenvío del enlace, con la cuenta atrás de `retry_after` |
| **429** | 10 intentos por minuto (por IP) | Mensaje genérico pidiendo esperar |
| **502** | El BFF no alcanzó a Laravel | "El servicio no está disponible ahora mismo" |

El botón se deshabilita mientras la petición está en vuelo: un doble clic
crearía dos tokens en Sanctum.

El 403 comparte componente con el panel "Revisa tu correo" del
[registro](registro.md): `ReenviarVerificacion`, que toma la espera del
`retry_after` de la respuesta y nunca de un número escrito en el frontend.

---

## Diferencias con la app actual

| Elemento | En el Laravel anterior | Aquí |
|---|---|---|
| Identificador | `usuario` o email | Solo email (la columna `usuario` se eliminó, §2.9) |
| Sesión | Cookie de sesión de Laravel | Token de Sanctum en cookie httpOnly puesta por el BFF |
| Verificación de correo | No había | 403 con reenvío desde la misma pantalla |

---

## Verificado en el navegador (2026-08-16)

- Enviar vacío → "Ingresa tu email" / "Ingresa tu contraseña", sin llamar a la
  API.
- Contraseña incorrecta → **422** y el mensaje del backend bajo el campo email.
- Cuenta sin verificar → **403**, aviso y botón de reenvío; al pulsarlo, 200 y
  cuenta atrás de 60 s.
- Credenciales correctas → **200**, salto a `/` y `document.cookie` **vacío**:
  el token es httpOnly y el JS del navegador no lo ve.
- Once intentos seguidos → **429** con el mensaje genérico.
- `remember: true` → `Max-Age=2592000` (30 días); `remember: false` → cookie
  sin `Max-Age`, muere con el navegador.

El 502 es el único camino no ejercitado en vivo: sale de `errorJson(…, 502)`
del BFF cuando el `fetch` a Laravel falla.

---

## Pendiente

- [ ] Montar `useUsuarioActual` en el layout del panel (hoy el header sigue
      con el usuario de la plantilla)
- [ ] Decidir qué hacer si el negocio está suspendido: el backend ya tiene
      estados de tenant (§1.6) pero el login no los distingue todavía
