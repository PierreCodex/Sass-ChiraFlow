# Profesionales

**Ruta:** `/administracion/equipo/profesionales`
**Estado:** ✅ **Conectada al backend** (2026-09-05)
**Archivos:**
- `web/src/features/profesionales/`
- se monta desde `features/administracion/paneles.ts`

> Sustituye a la antigua ficha `empleados.md`. `/api/empleados` dejó de existir
> el 2026-09-04 y el módulo se partió en dos; la otra mitad es
> [Usuarios](usuarios.md).

---

## Qué es, y qué no

**Quién presta los servicios.** Un barbero que nunca toca el sistema es esto y
nada más.

La distinción está en la tabla de [Usuarios](usuarios.md). Lo que hay que
retener aquí: **no se pide correo, ni rol, ni contraseña**. Pedírselos obligaba
a inventarle un correo a quien no usa el panel, y un correo inventado es peor
que ninguno porque parece un canal y no lo es.

---

## Qué muestra

La tarjeta del cupo del plan y, debajo, la tabla.

### La tarjeta de cupo

> **Profesionales activos en tu plan** · **3 de 5** ▓▓▓▓▓░░░

El cupo cuenta **filas activas de esta tabla**, sin mirar roles ni `atiende`.
Quien está aquí presta servicios, y punto. Una cuenta sin ficha —la
recepcionista— no aparece y no ocupa plaza: usuarios del panel ilimitados,
profesionales no.

Al llegar al tope sale un chip «Límite alcanzado» y un enlace a `/mi-plan`.

### Columnas

| Columna | Contenido |
|---|---|
| Profesional | Foto o inicial + nombre, y el chip «Tú» en tu propia ficha |
| Acceso al panel | Su correo y su rol, o **«Sin cuenta»** |
| Cargo | Texto libre, o `-` |
| Estado | «De alta» / «De baja», más «No reservable» si no atiende |
| Acciones | Editar · Dar de baja |

«Sin cuenta» es lo normal en quien presta servicios y nunca abre el sistema —
el caso que antes era imposible de registrar.

### El estado vacío

**Un negocio recién registrado no tiene a nadie aquí.** La ficha del titular se
crea en el provisioning **solo si en el registro respondió `independiente`**;
quien dijo «3-5» entra y no ve a nadie.

Por eso no dice «no hay resultados» —que suena a fallo o a filtro mal puesto—
sino qué es esta pantalla, que hace falta al menos uno para agendar, y que se
puede dar de alta a alguien **sin** darle cuenta.

---

## El formulario

Tres pestañas: **Datos**, **Pago** y **Horario**.

### Datos

`nombre` (obligatorio), `foto`, `telefono` (`+51` + 9 dígitos), `cargo`, y tres
interruptores en recuadro — cada uno decide algo con consecuencias, y una
casilla a pelo no da sitio para explicarlo:

| Interruptor | Qué decide |
|---|---|
| **Se puede reservar con esta persona por internet** (`atiende`) | Si sale en la tienda pública. **Y solo eso**: dejó de decidir el cupo y de significar «es staff» |
| **Está de alta** (`activo`) | Ocupa una plaza del plan. **Aquí cae el 422 del tope** |
| **Darle acceso al panel** | Opcional. Ver abajo |

> `atiende` apagado **no** quita la agenda: solo impide que le reserven por
> internet. Las citas se las crea el negocio.

### La casilla «darle acceso al panel»

Manda un objeto opcional:

```json
{ "usuario": { "email": "carmen@elrosal.pe", "rol_id": 3 } }
```

- Enseña **solo el correo**. El rol se resuelve al de sistema `profesional`,
  buscándolo por `clave` para que sobreviva a un renombrado. Ofrecer un
  desplegable con «Administrador general» dentro invitaba a un error caro con
  dos clics.
- Funciona igual al crear que al editar — un barbero lleva meses sin cuenta y
  un día la necesita.
- **A quien ya la tiene no se le ofrece**: el backend ignora ese objeto en ese
  caso, así que en su lugar se dice con qué correo entra y se enlaza a
  Usuarios. Un formulario que acepta cambios y no los guarda es peor que uno
  que no los ofrece.

### Pago

`tipo_pago` (`comision` · `sueldo` · `ambos`), `comision_porcentaje`, y
—solo con los tipos que llevan sueldo— `monto_sueldo` y `periodo_pago`
(`semanal` · `quincenal` · `mensual`). Al cambiar a un tipo sin sueldo, los dos
últimos **se limpian**.

### Horario

Los 7 días con sus breaks, más las excepciones.

```jsonc
// horario[] — siempre los 7, con `activo:false` los que no se trabajan
{ "dia": 1, "activo": true, "desde": "09:00", "hasta": "18:00",
  "breaks": [{ "desde": "13:00", "hasta": "14:00" }] }

// excepciones[] — con `disponible:true`, desde/hasta REEMPLAZAN el día
{ "fecha": "2026-08-14", "disponible": true,
  "desde": "09:00", "hasta": "13:00", "nota": "Medio turno" }
```

`dia` va de 1 (lunes) a 7 (domingo), ISO-8601.

> **El adaptador de horario ya no existe.** La ficha anterior describía una
> traducción al `{dias:{lunes:…}, inicio, fin}` del Laravel viejo; el backend
> nuevo guarda y devuelve **la forma del contrato**, así que se manda y se
> recibe lo mismo. Borrado el 2026-09-04.

Validado por el backend, todo con 422: los breaks caen dentro de la jornada, no
se solapan entre sí (tocarse en el extremo vale), un día activo necesita sus
dos horas, y no hay dos excepciones para la misma fecha. De este JSON sale la
disponibilidad del Sprint 4: un break imposible produce huecos imposibles.

---

## Endpoints

### `GET /api/profesionales`

```json
{
  "data": [
    {
      "id": 2,
      "nombre": "Dra. Carmen Ríos",
      "foto_url": null,
      "usuario": {
        "id": 4, "email": "carmen@elrosal.pe", "activo": true,
        "rol_id": 3, "rol": { "id": 3, "nombre": "Profesional", "clave": "profesional" }
      },
      "cargo": "doctor cirujano",
      "telefono": "+51987441220",
      "activo": true,
      "atiende": true,
      "tipo_pago": "ambos",
      "comision_porcentaje": 50,
      "monto_sueldo": 12000,
      "periodo_pago": "quincenal",
      "horario": [ "…los 7 días…" ],
      "excepciones": []
    }
  ],
  "meta": { "…": "paginación" },
  "resumen": { "profesionales_activos": 3, "limite_profesionales": 5 }
}
```

`usuario` es **`null`** en quien no entra al panel. El `resumen` viaja con el
listado —son dos consultas ya hechas— y ahorra una petición para pintar la
misma pantalla.

`search` busca por nombre, cargo y correo. El `id` es el de `profesionales`: el
que usan las citas, `servicio_profesional` y `local_profesional`.

### `POST` · `PUT` (multipart, `POST` + `_method=PUT`) · `DELETE`

Multipart por la foto. `foto_eliminar=1` para quitarla — no mandar el archivo
significa «déjala como está».

`GET /api/profesionales/resumen` da el cupo sin recargar la tabla.

### El borrado es soft delete, y **no toca la cuenta**

`DELETE` responde 204. Las citas apuntan a `profesionales.id` y borrarlo de
verdad reescribiría el historial.

Y su cuenta del panel **sobrevive**. El diálogo lo dice cuando la hay: «esta
persona conserva su acceso al panel; para quitárselo, ve a Usuarios». Son dos
decisiones distintas, y mezclarlas haría que dejar de atender significara
quedarse fuera del sistema.

---

## Los 422 con nombre propio

| Situación | Campo | Texto |
|---|---|---|
| Tope del plan | `activo` | Alcanzaste el límite de profesionales de tu plan. Amplía tu plan para agregar a alguien más. |
| Correo repetido al dar acceso | `usuario.email` | Ya existe una cuenta con ese correo. |
| Teléfono con otro formato | `telefono` | El teléfono debe tener el formato +51 seguido de 9 dígitos. |

El cupo se comprueba **también al reactivar**: si solo mirase el alta, bastaría
dar de baja a uno, crear a otro y reactivar al primero.

> El formulario traduce `usuario.email` al campo que en pantalla se llama
> `acceso_email`, y salta a la pestaña del primer error — incluido el que llega
> del servidor.

---

## Pendientes

- **El profesional no se asigna a una sede desde aquí.** Eso vive en
  [Locales](locales.md) § Quién atiende en cada sede.
- `solo_propios` del rol se emite pero no filtra nada todavía: empieza a
  significar algo con las citas del Sprint 4.
