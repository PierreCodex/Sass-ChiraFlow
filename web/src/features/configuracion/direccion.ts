/**
 * La dirección pública del negocio, `{slug}.tivuapp.store` (Story 6.1).
 *
 * Quien decide es el backend (`GET /configuracion/direccion/disponible`); esto
 * solo adelanta lo evidente mientras se escribe y pone los textos, que en este
 * proyecto los pone el panel.
 */

export type MotivoDireccion = "formato" | "reservado" | "ocupado";

export interface DisponibilidadDireccion {
  disponible: boolean;
  motivo?: MotivoDireccion;
}

export interface DireccionCambiada {
  slug: string;
  url: string;
}

/** Misma regla que `DireccionPublica::FORMATO` (+ sin dos guiones seguidos). */
const FORMATO = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/;

/** Como lo guarda el backend: recortado y en minúsculas. */
export function normalizarDireccion(texto: string): string {
  return texto.trim().toLowerCase();
}

export function tieneFormatoValido(slug: string): boolean {
  return FORMATO.test(slug) && !slug.includes("--");
}

export const TEXTO_MOTIVO: Record<MotivoDireccion, string> = {
  formato:
    "Solo minúsculas, números y guiones (de 3 a 63), sin guion al principio ni al final ni dos seguidos.",
  reservado: "Esa dirección está reservada por la plataforma.",
  ocupado: "Esa dirección ya la usa otro negocio.",
};
