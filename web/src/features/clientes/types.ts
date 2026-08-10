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
}

/** Payload de creación/edición. */
export interface ClientePayload {
  nombre: string;
  telefono?: string | null;
  email?: string | null;
}
