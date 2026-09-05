import type { MatrizPermisos, NivelPermiso, Rol } from "./types";

/**
 * Los 14 módulos del panel, en el orden en que los manda el backend
 * (`modulos`, fuera de `data`). Aquí solo sirven para armar los mocks: la
 * pantalla de roles usa la lista que llega con el listado, no esta.
 */
const MODULOS = [
  "dashboard", "citas", "calendario", "clientes", "servicios",
  "inventario", "caja", "reportes", "locales", "empleados",
  "whatsapp", "configuracion", "facturacion", "soporte",
] as const;

/** Los 14 módulos con el nivel indicado, y los sueltos por encima. */
function permisos(
  base: NivelPermiso | null,
  excepciones: MatrizPermisos = {}
): MatrizPermisos {
  return {
    ...Object.fromEntries(MODULOS.map((modulo) => [modulo, base])),
    ...excepciones,
  };
}

export const rolesMock: Rol[] = [
  {
    id: 1,
    nombre: "Administrador general",
    clave: "admin_general",
    sistema: true,
    permisos: permisos("gestionar"),
    solo_propios: false,
    editable: false,
    borrable: false,
    duplicable: false,
    usuarios_count: 1,
  },
  {
    id: 2,
    nombre: "Administrador",
    clave: "admin_local",
    sistema: true,
    // La facturación es lo único que no se delega: separa al dueño de su mano
    // derecha.
    permisos: permisos("gestionar", {
      dashboard: "ver",
      reportes: "ver",
      facturacion: null,
    }),
    solo_propios: false,
    editable: true,
    borrable: false,
    duplicable: true,
    usuarios_count: 1,
  },
  {
    id: 3,
    nombre: "Profesional",
    clave: "profesional",
    sistema: true,
    permisos: permisos(null, {
      dashboard: "ver",
      citas: "gestionar",
      calendario: "ver",
      clientes: "ver",
      servicios: "ver",
    }),
    // Ve su agenda y sus citas, no las de sus compañeros.
    solo_propios: true,
    editable: true,
    borrable: false,
    duplicable: true,
    usuarios_count: 4,
  },
  {
    id: 4,
    nombre: "Recepción",
    clave: null,
    sistema: false,
    permisos: permisos(null, {
      dashboard: "ver",
      citas: "gestionar",
      calendario: "ver",
      clientes: "gestionar",
      servicios: "ver",
      caja: "gestionar",
    }),
    solo_propios: false,
    editable: true,
    borrable: true,
    duplicable: true,
    usuarios_count: 0,
  },
];
