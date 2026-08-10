import type { EstadoCita } from "./types";

type ColorChip = "warning" | "info" | "success" | "error" | "default";

/** Etiqueta y color de cada estado. Única fuente de verdad para toda la app. */
export const ESTADOS_CITA: Record<
  EstadoCita,
  { label: string; color: ColorChip }
> = {
  pendiente: { label: "Pendiente", color: "warning" },
  confirmada: { label: "Confirmada", color: "info" },
  atendida: { label: "Atendida", color: "success" },
  cancelada: { label: "Cancelada", color: "error" },
  no_asistio: { label: "No asistió", color: "default" },
};
