import type { EstadoCita, EstadoPago } from "./types";

type ColorChip = "warning" | "info" | "success" | "error" | "default";

/**
 * Etiqueta y color de cada estado. Única fuente de verdad para toda la app.
 *
 * Los valores salen del enum real de la tabla `citas`:
 *   enum('pendiente', 'confirmada', 'completada', 'cancelada')
 */
export const ESTADOS_CITA: Record<
  EstadoCita,
  { label: string; color: ColorChip }
> = {
  pendiente: { label: "Pendiente", color: "warning" },
  confirmada: { label: "Confirmada", color: "info" },
  completada: { label: "Completada", color: "success" },
  cancelada: { label: "Cancelada", color: "error" },
};

/** Estado del comprobante QR que subió el cliente al reservar. */
export const ESTADOS_PAGO: Record<EstadoPago, { label: string; color: ColorChip }> = {
  pendiente: { label: "Pago pendiente", color: "warning" },
  confirmado: { label: "Pago confirmado", color: "success" },
  rechazado: { label: "Pago rechazado", color: "error" },
};

/** De dónde salió la reserva (columna `fuente` de la tabla `citas`). */
export const FUENTES_CITA: Record<string, string> = {
  web: "Web",
  panel: "Panel",
  publica: "Página pública",
};
