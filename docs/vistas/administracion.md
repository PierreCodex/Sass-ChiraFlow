# Administración

**Ruta:** `/administracion` → redirige a `/administracion/general/negocio`
**Entrada:** menú del usuario (avatar) → **Configuración**
**Estado:** 🚧 solo el índice; el formulario de cada sección está por maquetar

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

| Grupo | Secciones | Ruta |
|---|---|---|
| General | Datos del negocio · Horario base | `/administracion/general/{negocio,horario}` |
| Equipo | Empleados · Roles | `/administracion/equipo/{empleados,roles}` |
| Locales | Sedes · Horarios de las sedes | `/administracion/locales/{sedes,horarios}` |
| WhatsApp | Plantillas de mensaje | `/administracion/whatsapp/plantillas` |
| Facturación | Mi Plan · Suscripción · Pagos | `/administracion/facturacion/{plan,suscripcion,pagos}` |
| Soporte | Tickets | `/administracion/soporte/tickets` |

Los grupos de una sola sección van como fila normal, sin desplegar: sería un
clic de más.

**El catálogo no está aquí.** Categorías, Servicios y Productos son lo que el
negocio vende, y eso se toca a diario: se quedan en la Vista general.
Administración es lo que se configura una vez.

## Dónde está

```
app/administracion/layout.tsx                   el caparazón (barra + índice + panel)
app/administracion/page.tsx                     redirige a la primera sección
app/administracion/[grupo]/[seccion]/page.tsx   el panel de una sección
features/administracion/nav.ts                  el índice: grupos, secciones y textos
features/administracion/components/AdminNav.tsx el menú desplegable
```

`nav.ts` es la única fuente del índice: las rutas, los títulos y los textos
salen de ahí, y `buscarSeccion()` resuelve la URL. Una URL inventada no saca al
usuario de la vista: se queda con el índice y un aviso ("Esa sección no
existe"), en vez de la página de error de Next.

## Pendientes

- **El formulario de cada sección.** Hoy cada panel enseña el título, la
  descripción y un enlace (`rutaActual` en `nav.ts`) a la pantalla del panel que
  hace ese trabajo: `/configuracion`, `/empleados`, `/locales`, `/whatsapp`,
  `/mi-plan`, `/soporte`. Esas pantallas siguen montadas y funcionando; están **ocultas del sidebar**, no
  borradas (`MenuitemsOcultos` en `layout/vertical/sidebar/MenuItems.ts`).
- **Roles** no tiene pantalla: el rol se elige dentro de la ficha del empleado.
- No hay endpoints propios: esta vista no habla con la API todavía.
