export type EstadoSuscripcion = "prueba" | "activa" | "vencida" | "cancelada";

export interface Plan {
  id: number;
  nombre: string;
  precio: number;
  periodo: "mensual" | "anual";
}

/** Respuesta de GET /api/suscripcion */
export interface Suscripcion {
  estado: EstadoSuscripcion;
  plan: Plan | null;
  /** Días que faltan para que termine la prueba o el periodo pagado. */
  dias_restantes: number;
  renueva_el: string | null;
}
