/**
 * Cobro por adelantado con QR (prototipo de la Épica 7, con varios métodos).
 *
 * ⚠️ **No existe en el backend todavía.** La base central solo tiene un QR por
 * negocio (`tenants.qr_imagen`); aquí se maqueta la variante con **varios
 * métodos** (Yape, Plin, BIM, Lemon, Prex…), cada uno con su QR, para
 * enseñarla y decidir. Todo responde con mocks guardados en el navegador.
 */

/** Las billeteras que se ofrecen en Perú. `otro` cubre bancos y el resto. */
export type TipoBilletera = "yape" | "plin" | "bim" | "lemon" | "prex" | "otro";

/**
 * Cuándo se pide el pago al reservar. Los mismos tres modos de la Story 7.1:
 *
 * - `no_pedido`: la tienda no menciona el pago.
 * - `opcional`: el cliente elige pagar ahora o en el local.
 * - `obligatorio`: sin pago no hay reserva.
 */
export type ModoCobro = "no_pedido" | "opcional" | "obligatorio";

export interface MetodoPago {
  id: number;
  tipo: TipoBilletera;
  /** Lo que lee el cliente: «Yape», «BCP», «Interbank»… */
  nombre: string;
  /** URL o data URL de la imagen del QR. */
  qr_url: string | null;
  /** Número o cuenta, para quien prefiere pagar sin escanear. */
  numero: string | null;
  titular: string | null;
  activo: boolean;
}

export interface ConfigPagos {
  modo: ModoCobro;
  metodos: MetodoPago[];
  /** Texto libre que ve el cliente encima del QR. */
  instrucciones: string | null;
  /** Minutos que tiene el cliente para pagar (15 a 240). */
  plazo_min: number;
}

/** Cómo eligió pagar el cliente. Igual que `citas.metodo_pago_eleccion`. */
export type EleccionPago = "ahora" | "local";

/** Igual que `cita_pagos.estado`, más `pendiente` (aún sin captura). */
export type EstadoPago =
  | "pendiente"
  | "comprobante_subido"
  | "verificado"
  | "rechazado";

/** Un pago por adelantado de una reserva, tal como lo revisa el negocio. */
export interface PagoReserva {
  /** El código de la reserva (`R-123456`): nunca un id numérico. */
  codigo: string;
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_email: string;
  /** Resumen legible: «Consulta general + Limpieza dental». */
  servicios: string;
  fecha: string; // YYYY-MM-DD
  hora_inicio: string; // "HH:MM"
  total: number;
  estado: EstadoPago;
  /** El método que el cliente dice haber usado. */
  metodo_id: number | null;
  metodo_nombre: string | null;
  /** Data URL de la captura. En el backend real: disco privado + URL firmada. */
  comprobante_url: string | null;
  codigo_operacion: string | null;
  /** Motivo de «pedir otra captura» o de rechazo. */
  motivo: string | null;
  /** Hasta cuándo tiene para pagar (ISO). */
  vence_a: string;
  creado_en: string;
}

export const ETIQUETA_ESTADO_PAGO: Record<EstadoPago, string> = {
  pendiente: "Esperando pago",
  comprobante_subido: "Por verificar",
  verificado: "Verificado",
  rechazado: "Rechazado",
};

export const COLOR_ESTADO_PAGO: Record<
  EstadoPago,
  "warning" | "info" | "success" | "error"
> = {
  pendiente: "warning",
  comprobante_subido: "info",
  verificado: "success",
  rechazado: "error",
};

/** Nombre por defecto y color de marca de cada billetera, para los chips. */
export const BILLETERAS: Record<TipoBilletera, { nombre: string; color: string }> = {
  yape: { nombre: "Yape", color: "#742284" },
  plin: { nombre: "Plin", color: "#00a19a" },
  bim: { nombre: "BIM", color: "#e4002b" },
  lemon: { nombre: "Lemon", color: "#1d9e3f" },
  prex: { nombre: "Prex", color: "#ff6a13" },
  otro: { nombre: "Otro", color: "#5d87ff" },
};

export function metodosActivos(config: ConfigPagos | null | undefined) {
  return (config?.metodos ?? []).filter((metodo) => metodo.activo && metodo.qr_url);
}

/** ¿La tienda debe hablar de pago? Sin métodos activos, no hay nada que ofrecer. */
export function cobroActivo(config: ConfigPagos | null | undefined) {
  return !!config && config.modo !== "no_pedido" && metodosActivos(config).length > 0;
}
