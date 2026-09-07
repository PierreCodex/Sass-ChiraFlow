import type { Modulo } from "@/features/capacidades/types";
import type { NivelPermiso } from "./types";

/**
 * Cómo se llama y dónde va cada uno de los 14 módulos en pantalla.
 *
 * El backend manda **claves**, no etiquetas: `empleados`, `facturacion`. Los
 * rótulos y la agrupación los pone el frontend, que es la convención del repo
 * — así el backend no decide cómo se lee su matriz.
 *
 * Las claves NO coinciden siempre con el nombre de la pantalla: `empleados` es
 * hoy «Profesionales» y no se renombró al mudar el módulo, porque la clave la
 * fija la matriz de permisos y cambiarla la desconectaría.
 *
 * Vive aquí, en `roles`, porque lo usan las dos pantallas que pintan una
 * matriz: la vista previa del formulario de usuarios y la de Roles.
 */
export const ETIQUETAS_MODULO: Record<string, string> = {
  dashboard: "Panel de inicio",
  citas: "Citas",
  calendario: "Calendario",
  clientes: "Clientes",
  servicios: "Servicios y categorías",
  inventario: "Inventario",
  caja: "Caja",
  reportes: "Reportes",
  locales: "Locales y grupos",
  empleados: "Profesionales",
  whatsapp: "WhatsApp",
  configuracion: "Configuración del negocio",
  facturacion: "Facturación y plan",
  soporte: "Soporte",
};

/**
 * Los 14 en bloques con sentido para quien reparte permisos.
 *
 * Catorce interruptores seguidos no se leen: quien está decidiendo qué puede
 * hacer una recepcionista piensa en «lo del día a día» y «lo de la empresa»,
 * no en una lista alfabética. El orden dentro de cada bloque es el del
 * backend.
 */
export interface GrupoModulos {
  titulo: string;
  descripcion: string;
  modulos: Modulo[];
}

export const GRUPOS_MODULOS: GrupoModulos[] = [
  {
    titulo: "El día a día",
    descripcion: "Lo que se abre cada mañana.",
    modulos: ["dashboard", "citas", "calendario", "clientes"],
  },
  {
    titulo: "Catálogo y stock",
    descripcion: "Lo que se vende y con qué se cuenta.",
    modulos: ["servicios", "inventario"],
  },
  {
    titulo: "Dinero",
    descripcion: "La caja del día y lo que se saca en limpio.",
    modulos: ["caja", "reportes"],
  },
  {
    titulo: "El negocio",
    descripcion: "Las sedes, la gente y los ajustes de la empresa.",
    modulos: ["locales", "empleados", "configuracion"],
  },
  {
    titulo: "Cuenta y canales",
    descripcion: "La factura del SaaS, el WhatsApp y el soporte.",
    modulos: ["whatsapp", "facturacion", "soporte"],
  },
];

/** Cómo se lee cada nivel. `null` es «sin acceso», no «ninguno». */
export const ETIQUETAS_NIVEL: Record<string, string> = {
  ver: "Solo ver",
  gestionar: "Ver y gestionar",
};

export function etiquetaNivel(nivel: NivelPermiso | null | undefined): string {
  return nivel ? (ETIQUETAS_NIVEL[nivel] ?? nivel) : "Sin acceso";
}

/** Cuántos módulos alcanza un rol, para resumirlo en una línea. */
export function contarAccesos(permisos: Record<string, NivelPermiso | null>) {
  const valores = Object.values(permisos);
  return {
    gestiona: valores.filter((n) => n === "gestionar").length,
    ve: valores.filter((n) => n === "ver").length,
    total: valores.length,
  };
}
