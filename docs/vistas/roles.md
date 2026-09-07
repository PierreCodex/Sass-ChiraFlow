# Roles

**Ruta:** `/administracion/equipo/roles`
**Estado:** ✅ **Conectada al backend** (2026-09-05)
**Archivos:**
- `web/src/features/roles/`
- se monta desde `features/administracion/paneles.ts`

---

## Qué muestra

Los roles del negocio: los **tres de sistema** que llegan con el provisioning y
los que cree el administrador general.

| Columna | Contenido |
|---|---|
| Rol | Nombre + chip «Del sistema», y debajo «Gestiona N de 14 módulos, ve otros M» |
| Alcance | «Solo lo suyo» / «Todo el negocio» (`solo_propios`) |
| Personas | `usuarios_count` — cuenta **cuentas del panel**, no fichas de profesional |
| Acciones | Editar / Ver permisos · Duplicar · Eliminar |

### Las barandillas llegan resueltas

`editable`, `borrable` y `duplicable` los manda el backend y **aquí no se
deducen** de `sistema` ni de `clave`. Si esta pantalla reimplementara esa
matriz acabaría divergiendo de la que manda.

| Rol | Editar | Borrar | Duplicar |
|---|---|---|---|
| Administrador general (`admin_general`) | ✗ | ✗ | ✗ |
| Administrador local (`admin_local`) | ✓ | ✗ | ✓ |
| Profesional (`profesional`) | ✓ | ✗ | ✓ |
| Los que cree el negocio | ✓ | ✓ (si nadie lo usa) | ✓ |

El botón apagado lleva su motivo en el tooltip. **El rol no editable se abre
igual**, en modo lectura: es la única forma de saber qué da el administrador
general sin mirar la base de datos.

---

## La matriz de permisos

Un acordeón por bloque y, dentro, una tabla con una casilla por nivel.

```
El día a día        Dashboard · Citas · Calendario · Clientes
Catálogo y stock    Servicios y categorías · Inventario
Dinero              Caja · Reportes
El negocio          Locales y grupos · Profesionales · Configuración
Cuenta y canales    WhatsApp · Facturación · Soporte
```

Los rótulos y la agrupación los pone el frontend
(`features/roles/modulos.ts`): el backend manda **claves**, no etiquetas.
Catorce interruptores seguidos no se leen — quien decide qué puede hacer una
recepcionista piensa en «lo del día a día» y «lo de la empresa».

### Dos columnas, no cuatro

**No hay Crear / Editar / Eliminar.** El backend guarda **dos niveles** por
módulo —`ver` y `gestionar`— y descartó los verbos CRUD a propósito: *«nadie en
una barbería quiere puede crear clientes pero no borrarlos, y multiplica los
tests por cuatro»*.

Pintar tres casillas sería inventar una distinción que no se guarda: marcar
solo «Crear» acabaría escribiendo `gestionar` y al reabrir saldrían las tres
marcadas. La pantalla mentiría.

Cómo se leen:

| Casilla | Significa | Al quitarla |
|---|---|---|
| **Ver** | tiene acceso al módulo | lo retira **entero** |
| **Gestionar** | además puede escribir | lo deja en **solo lectura** |

`Gestionar` marca también `Ver` —es la regla del backend, donde `gestionar`
incluye `ver`— pero **no la bloquea**: bloquearla dejaba un callejón sin salida
para quitar un módulo del todo.

### `solo_propios` va aparte

En su propio recuadro y no como una fila más: no dice **qué** puede hacer sino
**sobre quién**, y colarlo entre los catorce lo haría parecer un permiso.

Hoy el backend lo emite y **no filtra nada** — empieza a significar algo con
las citas del Sprint 4.

---

## Duplicar no es un endpoint

Es abrir el mismo diálogo con las casillas copiadas y otro nombre. Se propone
«{nombre} (copia)» porque los nombres son únicos por negocio.

Es la respuesta del backend a «necesito una combinación distinta para esta
persona»: en vez de permisos por usuario, un rol propio. El de administrador
general no se duplica — sería fabricar un segundo titular.

---

## Endpoints

### `GET /api/roles`

```json
{
  "data": [
    {
      "id": 2,
      "nombre": "Administrador local",
      "clave": "admin_local",
      "sistema": true,
      "permisos": { "dashboard": "gestionar", "configuracion": null, "…": "los 14" },
      "solo_propios": false,
      "editable": true,
      "borrable": false,
      "duplicable": true,
      "usuarios_count": 3
    }
  ],
  "meta": { "…": "paginación" },
  "modulos": ["dashboard", "citas", "calendario", "…"]
}
```

Dos cosas que no se ven en el JSON:

1. **`permisos` trae SIEMPRE los 14 módulos**, con `null` donde no hay acceso,
   aunque el guardado tenga cinco claves. Al guardar da igual mandar los nulls.
2. **`modulos` viaja fuera de `data`**: la lista completa y ordenada para las
   filas de la matriz. La pantalla usa **esa** y no su constante local, para
   que un módulo nuevo del backend se pinte solo. Si llega uno que aquí no está
   agrupado, sale al final en «Otros» — un permiso invisible se queda sin
   repartir.

### `POST` · `PUT /api/roles/{id}` · `DELETE /api/roles/{id}`

Payload: `nombre`, `permisos` (objeto módulo → `ver` | `gestionar` | `null`) y
`solo_propios`. Nada más — `clave` y `sistema` se ignoran si se mandan.

**Leer lo puede cualquier usuario del negocio** (el select de rol tiene que
funcionarle a quien da altas); **escribir, solo el administrador general** →
403. Si un administrador local pudiera crear roles, se haría uno con todo
marcado y se lo asignaría.

---

## Los 422 con nombre propio

| Situación | Campo | Texto |
|---|---|---|
| Nombre repetido | `nombre` | Ya tienes un rol con ese nombre. |
| Módulo inexistente | `permisos` | Estos módulos no existen: … |
| Nivel inventado | `permisos.{modulo}` | El nivel de acceso solo puede ser «ver» o «gestionar». |
| Editar el rol del titular | `rol` | El rol del administrador general no se puede editar. |
| Borrar uno de sistema | `rol` | Los roles del sistema no se pueden borrar… |
| Borrar uno en uso | `rol` | Este rol lo usan N persona(s)… |

Los que caen en `rol` no tienen campo en pantalla: se pintan en el aviso de
arriba del diálogo.

---

## Dónde más se ve esta matriz

En el formulario de [Usuarios](usuarios.md), al elegir un rol, con el **mismo
componente** en modo lectura. Se reutiliza a propósito: con dos listas, el día
que la matriz cambie habría que acordarse de tocar las dos y la vista previa
acabaría enseñando algo distinto de lo que aquí se guarda.

---

## Pendientes

- **Permisos por usuario**, como AgendaPro (rol + casillas por persona). Hoy no
  son representables: `roles.permisos` es la única matriz y `/usuarios` no
  acepta overrides. El backend eligió el modelo de un solo eje a propósito —
  argumenta que da las mismas combinaciones con la mitad de matriz. Si se
  quiere, es cambio de backend.
- **Alcance por sedes** (`local_usuario`): el esquema existe y `GET
  /capacidades` lo emite, pero no hay endpoint que lo escriba. Es **de la
  persona, no del rol**, así que su sitio sería Usuarios y no esta pantalla.
