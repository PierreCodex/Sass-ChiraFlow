/** Enum real de `soporte_tickets.estado`. */
export type EstadoTicket = "abierto" | "en_proceso" | "cerrado";

/**
 * `soporte_tickets.prioridad` es `string(20)` con default "media", pero el
 * controlador valida `in:baja,media,alta`.
 */
export type PrioridadTicket = "baja" | "media" | "alta";

export interface Ticket {
  id: number;
  asunto: string;
  mensaje: string;
  /** null mientras soporte no haya contestado. */
  respuesta: string | null;
  estado: EstadoTicket;
  prioridad: PrioridadTicket;
  /** Quién abrió el ticket dentro del negocio (`user_id`). */
  autor: string;
  /** Agente de soporte asignado (`soporte_user_id`), null si nadie lo tomó. */
  respondido_por: string | null;
  creado_en: string; // ISO datetime
  actualizado_en: string; // ISO datetime
}

export interface TicketPayload {
  asunto: string;
  mensaje: string;
  prioridad: PrioridadTicket;
}
