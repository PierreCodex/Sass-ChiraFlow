import type { EstadoTicket, PrioridadTicket } from "./types";

type ColorChip = "warning" | "info" | "success" | "error" | "default";

/**
 * La app actual imprime el valor crudo de la columna ("en_proceso").
 * Aquí se traduce a etiqueta y color.
 */
export const ESTADOS_TICKET: Record<
  EstadoTicket,
  { label: string; color: ColorChip }
> = {
  abierto: { label: "Abierto", color: "info" },
  en_proceso: { label: "En proceso", color: "warning" },
  cerrado: { label: "Cerrado", color: "success" },
};

export const PRIORIDADES_TICKET: Record<
  PrioridadTicket,
  { label: string; color: ColorChip }
> = {
  baja: { label: "Baja", color: "default" },
  media: { label: "Media", color: "warning" },
  alta: { label: "Alta", color: "error" },
};
