/**
 * Checklist de entrada (ficha `docs/vistas/onboarding.md`).
 *
 * El backend manda solo claves y booleanos; las etiquetas, las descripciones
 * y los enlaces los pone el frontend. Por eso el orden de PASOS aquí es el
 * mismo que el del array que devuelve `GET /onboarding`: si algún día el
 * backend añade un paso, aparece igual (con su clave como etiqueta) en vez de
 * desaparecer.
 */

import { rutaDeSeccion } from "@/features/administracion/nav";

export type ClavePaso =
  | "nombre_negocio"
  | "horario_local"
  | "primer_profesional"
  | "primer_servicio"
  | "reserva_prueba"
  | "sitio_publico";

export interface PasoOnboarding {
  clave: ClavePaso | string;
  completado: boolean;
}

export interface Onboarding {
  /** true cuando los 6 pasos lo están; entonces el checklist deja de verse. */
  completado: boolean;
  pasos: PasoOnboarding[];
}

interface DescripcionPaso {
  etiqueta: string;
  descripcion: string;
  /** A dónde lleva la tarea. Sin `href` la resuelve el propio checklist. */
  href?: string;
}

export const DESCRIPCION_PASOS: Record<string, DescripcionPaso> = {
  nombre_negocio: {
    etiqueta: "Ponle nombre a tu negocio",
    descripcion: "Define el enlace de tu tienda",
  },
  horario_local: {
    etiqueta: "Configura el horario de tu local",
    descripcion: "Los días y horas en que atiendes",
    href: "/configuracion",
  },
  primer_profesional: {
    etiqueta: "Agrega tu primer profesional",
    descripcion: "El resto de tu equipo",
    // Sale de `nav.ts` y no a mano: la próxima mudanza se cambia en un sitio.
    href: rutaDeSeccion("equipo", "empleados"),
  },
  primer_servicio: {
    etiqueta: "Crea tu primer servicio",
    descripcion: "Lo que ofreces, con su precio y duración",
    href: "/servicios",
  },
  reserva_prueba: {
    etiqueta: "Haz una reserva de prueba",
    descripcion: "Comprueba cómo se ve una cita",
    href: "/citas",
  },
  sitio_publico: {
    etiqueta: "Conoce tu sitio público",
    descripcion: "La página donde reservan tus clientes",
  },
};

export function describirPaso(clave: string): DescripcionPaso {
  return DESCRIPCION_PASOS[clave] ?? { etiqueta: clave, descripcion: "" };
}

export function contarCompletados(onboarding: Onboarding) {
  return onboarding.pasos.filter((paso) => paso.completado).length;
}
