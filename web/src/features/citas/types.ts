export type EstadoCita =
  | "pendiente"
  | "confirmada"
  | "completada"
  | "cancelada";

/** Producto vendido durante la cita. */
export interface ProductoCita {
  producto_id: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
}

export interface Cita {
  id: number;
  fecha: string; // "2026-08-10"
  hora_inicio: string; // "20:00"
  /** Lo calcula el backend: hora_inicio + duración del servicio. */
  hora_fin: string;
  estado: EstadoCita;
  /** Editable: arranca del precio del servicio pero se puede ajustar. */
  monto: number;
  notas: string | null;

  /**
   * El formulario captura el cliente como texto libre. `cliente_id` viene
   * informado solo si la cita quedó vinculada a un cliente registrado.
   */
  cliente_id: number | null;
  cliente_nombre: string;
  cliente_telefono: string | null;
  cliente_email: string | null;

  servicio: {
    id: number;
    nombre: string;
    duracion_min: number;
    precio: number;
    /** Color del servicio: pinta el bloque en el calendario. */
    color: string;
  };
  /** Toda cita tiene profesional: `citas.user_id` no es nullable. */
  empleado: { id: number; nombre: string };
  productos: ProductoCita[];
}

export interface CitaPayload {
  empleado_id: number;
  servicio_id: number;
  fecha: string;
  hora_inicio: string;
  cliente_id: number | null;
  cliente_nombre: string;
  cliente_telefono: string | null;
  cliente_email: string | null;
  monto: number;
  estado: EstadoCita;
  notas: string | null;
  /** La clave es `id`, como la espera el backend: productos[i][id]. */
  productos: { id: number; cantidad: number }[];
}
