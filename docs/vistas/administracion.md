# Administración

**Ruta:** `/administracion` → redirige a `/administracion/general/negocio`
**Entrada:** menú del usuario (avatar) → **Configuración**
**Estado:** ✅ **Con panel propio en 10 de sus 12 secciones** (2026-09-05)

---

## Qué es

La **segunda vista** del producto. El panel (Vista general) quedó con lo que se
abre cada mañana —Dashboard, Calendario, Citas, Clientes, el catálogo, Caja,
Inventario, Reportes—; todo lo que se toca de vez en cuando vive aquí.

Es un caparazón aparte, tomado de la administración de Monday: una barra con
**Volver**, el índice a la izquierda y el panel de la sección a la derecha. Sin
el sidebar del día a día y sin su header.

El modo claro/oscuro y la paleta **no se deciden en esta vista**: cuelgan del
`CustomizerContext` del layout raíz, el mismo del panel. Si el panel está en
oscuro, esto entra en oscuro.

## El índice

| Grupo | Secciones | Panel |
|---|---|---|
| General | Datos del negocio · Agenda · Marca · Sitio público | ✅ [Configuración](configuracion.md) |
| Equipo | Usuarios · Profesionales · Roles | ✅ [Usuarios](usuarios.md) · [Profesionales](profesionales.md) · [Roles](roles.md) |
| Locales | Sedes · Quién atiende en cada sede · Grupos | ✅ [Locales](locales.md) |
| WhatsApp | Plantillas de mensaje | 🚧 enlaza a `/whatsapp` |
| Facturación | Mi Plan · Suscripción · Pagos | 🚧 enlaza a `/mi-plan` |
| Soporte | Tickets | 🚧 enlaza a `/soporte` |

Las rutas viejas (`/configuracion`, `/empleados`, `/locales`) **no dejan de
responder**: redirigen a su sección, con `source` exacto. Hay enlaces guardados
en marcadores y en correos del onboarding.

### Quién ve qué

El índice se filtra con la matriz de permisos (`GET /api/capacidades`): una
sección cuyo módulo el rol no alcanza no se enseña, y a quien no le toca
ninguna se le dice «Nada que administrar» en vez de dejarle una barra en
blanco. `/administracion` entra por la primera sección **que le toque**, no por
una fija.

**Esconder no es autorizar**: el backend responde 403 igual. Y dos secciones
—Usuarios y Roles— son solo del administrador general por un candado aparte,
no por la matriz (`soloAdminGeneral` en `nav.ts`).

Los grupos de una sola sección van como fila normal, sin desplegar: sería un
clic de más.

**El catálogo no está aquí.** Categorías, Servicios y Productos son lo que el
negocio vende, y eso se toca a diario: se quedan en la Vista general.
Administración es lo que se configura una vez.

## Dónde está

```
app/administracion/layout.tsx                   el caparazón (barra + índice + panel)
app/administracion/page.tsx                     entra por la primera que le toque
features/administracion/paneles.ts              qué componente monta cada sección
app/administracion/[grupo]/[seccion]/page.tsx   el panel de una sección
features/administracion/nav.ts                  el índice: grupos, secciones y textos
features/administracion/components/AdminNav.tsx el menú desplegable
```

`nav.ts` es la única fuente del índice: las rutas, los títulos y los textos
salen de ahí, y `buscarSeccion()` resuelve la URL. Una URL inventada no saca al
usuario de la vista: se queda con el índice y un aviso ("Esa sección no
existe"), en vez de la página de error de Next.

## Pendientes

- **WhatsApp, Facturación y Soporte** siguen enlazando a su pantalla del panel
  (`rutaActual` en `nav.ts`). Se mudan cuando se conecte su módulo, en su
  sprint.
- El **alcance por sedes** de una cuenta no tiene dónde asignarse todavía: el
  backend lo aplica pero no hay endpoint que lo escriba.
