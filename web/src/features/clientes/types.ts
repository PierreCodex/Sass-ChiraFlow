export interface Cliente {
  id: number;
  nombre: string;
  /** En la app actual algunos clientes solo tienen teléfono. */
  telefono: string | null;
  /** Puede venir vacío: hay clientes registrados sin correo. */
  email: string | null;
  /** Número de citas del cliente (withCount). */
  total_citas: number;
  /** Fecha de su cita más reciente. Null si nunca tuvo una. */
  ultima_cita: string | null;
  /**
   * Marcó «Recibir avisos por WhatsApp» (Story 4.8c). Si después respondió
   * BAJA al número de clientes, vuelve a false.
   */
  acepta_whatsapp: boolean;
}

/** Payload de creación/edición. */
export interface ClientePayload {
  nombre: string;
  telefono?: string | null;
  email?: string | null;
  /** Sin la clave, el backend no la toca. */
  acepta_whatsapp?: boolean;
}
