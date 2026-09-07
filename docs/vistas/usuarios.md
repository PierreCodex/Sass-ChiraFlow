# Usuarios

**Ruta:** `/administracion/equipo/usuarios`
**Estado:** ✅ **Conectada al backend** (2026-09-05)
**Archivos:**
- `web/src/features/usuarios/`
- se monta desde `features/administracion/paneles.ts`

---

## Qué es, y qué no

**Quién entra al panel.** Una recepcionista es esto y nada más.

No confundir con [Profesionales](profesionales.md), que es quién presta los
servicios. Desde el 2026-09-04 son **dos módulos y ninguno implica al otro**:

| Persona | ¿Cuenta del panel? | ¿Ficha de profesional? |
|---|---|---|
| Recepcionista | sí | **no** |
| Barbero que no toca el sistema | **no** | sí |
| Barbero que ve su agenda | sí | sí |
| Titular que además atiende | sí | sí |
| Titular de oficina | sí | **no** |

El módulo anterior (`/empleados`) obligaba a que todo el staff tuviera ficha de
profesional: para dar de alta a una recepcionista había que declarar cómo se le
paga, y entraba con un 50 % de comisión sobre servicios que no presta.

**Todo `/usuarios` es del administrador general** — 403 al resto. La sección se
esconde a los demás (`soloAdminGeneral` en `nav.ts`), pero eso es cortesía: la
puerta la cierra el backend.

---

## Qué muestra

Tabla de cuentas, sin tarjeta de cupo: **las cuentas del panel son
ilimitadas**. Lo que cuesta dinero es tener agenda, no tener login.

| Columna | Contenido |
|---|---|
| Persona | Inicial + nombre completo + correo debajo, y el chip «Tú» en tu propia fila |
| Rol | El nombre tal cual llega — el negocio puede haberlo renombrado |
| Ficha de profesional | Su nombre con enlace, o **«Sin ficha»** |
| Estado | Chip «Activo» / «Sin acceso» |
| Acciones | Reenviar invitación · Editar · Quitar acceso |

«Sin ficha» no es una carencia que haya que corregir: es lo normal en quien
solo usa el panel.

### Barandillas, que el backend ya impone

- **Al administrador general no se le quita el acceso**: su fila no ofrece
  papelera. Es quien lleva facturación y dejar al negocio sin él solo se
  arregla entrando a la base.
- **Nadie se borra a sí mismo**: tu fila enlaza a **Mi perfil**, que es donde
  esos datos sí se cambian. Un enlace y no botones apagados — deshabilitados
  dirían «aquí no» sin decir dónde sí.

---

## El formulario

Seis campos, y **ninguno es la contraseña**.

| Campo | Reglas |
|---|---|
| `nombre` | obligatorio, máx. 150 |
| `apellido` | opcional, máx. 150 |
| `email` | obligatorio, **único global** en toda la plataforma |
| `telefono` | opcional, `+51` + 9 dígitos |
| `rol_id` | obligatorio, un rol del negocio |
| `activo` | «Puede entrar al panel» |

### Nadie escribe la contraseña de nadie

La cuenta nace con una aleatoria que no conoce ni quien la crea, y a la persona
le llega **«te dieron acceso, crea tu contraseña»** con un enlace de 7 días
(ver [login.md](login.md) § Invitación).

El diálogo lo dice al crear: sin ese aviso, el hueco entre «Guardar» y «ya
puede trabajar» parece un fallo.

### El desplegable de rol no ofrece dos de ellos

- **Profesional**: quien lo lleva sin ficha queda a medias —permisos pensados
  para ver *su* agenda, y ninguna agenda que ver—. Ese alta se hace en
  Profesionales, que crea las dos mitades y ya asigna ese rol.
- **Administrador general**: hay exactamente uno y lo crea el registro, así que
  elegirlo solo lleva a un 422.

Los dos **sí** aparecen al editar a quien ya los tiene, o el desplegable
saldría en blanco sobre su propio rol y guardar se lo cambiaría sin querer.

### La vista de permisos

Al elegir un rol aparece **su matriz**, con el mismo checklist de
[Roles](roles.md) pero apagado: los 14 módulos en cinco bloques, con las
columnas Ver y Gestionar, más `solo_propios` aparte.

Es de solo lectura **por el modelo, no por la pantalla**: los permisos son del
ROL. Unas casillas editables aquí no configurarían a este usuario — cambiarían
lo que pueden hacer todos los que llevan ese rol. Por eso enseña y enlaza a
Roles.

> Si alguien necesita una combinación distinta para una persona concreta, el
> camino es **duplicar el rol** desde Roles. Es lo que propone el backend en vez
> de permisos por usuario.

---

## Endpoints

### `GET /api/usuarios`

```json
{
  "data": [
    {
      "id": 1,
      "nombre": "Jean",
      "apellido": "Cordova",
      "email": "jean@elrosal.pe",
      "telefono": "+51981912807",
      "activo": true,
      "rol_id": 1,
      "rol": { "id": 1, "nombre": "Administrador general", "clave": "admin_general" },
      "profesional": { "id": 1, "nombre": "Jean Cordova", "atiende": true }
    }
  ],
  "meta": { "…": "paginación de siempre" }
}
```

`profesional` es **`null`** en quien no presta servicios. El `id` es el de
`usuarios` (base del negocio), **no** el del `users` central: por eso la fila
«Tú» se reconoce por correo, que es único global.

`search` busca por nombre, apellido y email — se resuelve en dos pasos porque
esos campos viven en la otra base.

### `POST` · `PUT /api/usuarios/{id}` · `DELETE /api/usuarios/{id}`

JSON, no multipart: aquí no hay foto. La de la persona vive en su ficha de
profesional, que es donde se usa.

Payload: `nombre`, `apellido`, `email`, `telefono`, `rol_id`, `activo`.

### `POST /api/usuarios/{id}/invitacion`

Reenvía la invitación. **No es un extra**: el alta depende de que un correo
llegue, y los correos se pierden —caducan los 7 días, caen en spam—. Sin este
botón la única salida sería borrar la cuenta y volverla a crear.

Responde `{ "message": "Invitación reenviada." }`.

---

## Los 422 con nombre propio

| Situación | Campo | Texto |
|---|---|---|
| Correo repetido | `email` | Ya existe una cuenta con ese correo. |
| Dar el rol de administrador general | `rol_id` | Ya hay un administrador general en este negocio. |
| Quitárselo a quien lo tiene | `rol_id` | El administrador general no puede cambiar de rol. |
| Borrar al administrador general | `usuario` | Al administrador general no se le puede quitar el acceso. |
| Borrarte a ti mismo | `usuario` | No puedes quitarte el acceso a ti mismo. |

---

## Pendientes

- **El alcance por sedes no se puede asignar.** `GET /api/capacidades` emite
  `locales` y `GET /locales` filtra por él, pero **no hay endpoint que lo
  escriba**: `UsuarioRequest` no acepta `locales` y `CuentaResource` no los
  emite. Hasta que exista, el selector de sedes de este formulario no se puede
  construir. Anotado como traspaso FE → BE el 2026-09-04.
- Cuando falla el envío de la invitación el backend deshace el alta entera
  (2026-09-05), así que reintentar funciona.
