import type { TipoServicio } from "./types";

/**
 * Tipos de servicio. Valores reales de la columna `servicios.tipo`
 * (string(30), por defecto 'normal').
 *
 * `sesiones` y `paquete` usan además `max_sesiones`.
 */
export const TIPOS_SERVICIO: Record<TipoServicio, string> = {
  normal: "Normal",
  sesiones: "Por sesiones",
  clases: "Clases",
  paquete: "Paquete",
};

/** Tipos que llevan un número máximo de sesiones. */
export const TIPOS_CON_SESIONES: TipoServicio[] = ["sesiones", "paquete"];

/** Paleta para el punto de color del servicio. */
export const COLORES_SERVICIO = [
  "#5D87FF",
  "#49BEFF",
  "#13DEB9",
  "#FFAE1F",
  "#FA896B",
  "#763EBD",
  "#0A7EA4",
  "#FB9678",
];
