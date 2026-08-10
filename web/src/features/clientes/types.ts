export interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono: string | null;
  estado: "activo" | "inactivo";
  created_at: string;
}

/** Payload de creación/edición (lo que acepta el endpoint de Laravel). */
export interface ClientePayload {
  nombre: string;
  email: string;
  telefono?: string | null;
  estado: Cliente["estado"];
}
