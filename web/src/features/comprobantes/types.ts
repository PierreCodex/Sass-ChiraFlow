/**
 * Comprobantes de pago que el negocio entrega a sus clientes (prototipo).
 *
 * ⚠️ **No existe en el backend todavía**, y **no es tributario**: es una nota
 * de venta numerada, no una boleta ni una factura electrónica. El PRD deja
 * fuera del lanzamiento la emisión ante SUNAT (§7, supuesto por confirmar en
 * L-6), y `tenants` aún no tiene RUC ni razón social (D-09). Se maqueta para
 * enseñarlo y decidir; todo responde con mocks guardados en el navegador.
 */

export type TipoDocumentoCliente = "dni" | "ruc" | "ce" | "ninguno";

export const ETIQUETA_DOCUMENTO: Record<TipoDocumentoCliente, string> = {
  dni: "DNI",
  ruc: "RUC",
  ce: "Carné de extranjería",
  ninguno: "Sin documento",
};

/** Largo exacto de cada documento. `null`: no se valida. */
export const LARGO_DOCUMENTO: Record<TipoDocumentoCliente, number | null> = {
  dni: 8,
  ruc: 11,
  ce: null,
  ninguno: null,
};

export interface LineaComprobante {
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
}

export interface ClienteComprobante {
  nombre: string;
  tipo_documento: TipoDocumentoCliente;
  numero_documento: string | null;
  email: string | null;
  telefono: string | null;
}

/**
 * Quién emite, copiado **en el momento de emitir**: si el negocio cambia de
 * dirección después, los comprobantes viejos no deben cambiar.
 */
export interface EmisorComprobante {
  nombre: string;
  ruc: string | null;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
}

export type EstadoComprobante = "emitido" | "anulado";

export interface Comprobante {
  id: number;
  /** `NV01`: nota de venta. Las series B/F quedarían para SUNAT. */
  serie: string;
  /** Correlativo dentro de la serie. Nunca se reutiliza, ni al anular. */
  numero: number;
  emitido_en: string; // ISO
  estado: EstadoComprobante;
  motivo_anulacion: string | null;
  /** La reserva que se cobró, si viene de un pago con QR. */
  reserva_codigo: string | null;
  metodo_pago: string | null;
  emisor: EmisorComprobante;
  cliente: ClienteComprobante;
  lineas: LineaComprobante[];
  total: number;
  notas: string | null;
}

export interface NuevoComprobante {
  reserva_codigo: string | null;
  metodo_pago: string | null;
  emisor: EmisorComprobante;
  cliente: ClienteComprobante;
  lineas: LineaComprobante[];
  notas: string | null;
}

/** «NV01-00000042» */
export function numeroComprobante(comprobante: Pick<Comprobante, "serie" | "numero">) {
  return `${comprobante.serie}-${String(comprobante.numero).padStart(8, "0")}`;
}

export function totalLineas(lineas: LineaComprobante[]) {
  const total = lineas.reduce(
    (suma, linea) => suma + linea.cantidad * linea.precio_unitario,
    0
  );
  // Céntimos: sin esto 3 × 33.33 se ve como 99.99000000000001.
  return Math.round(total * 100) / 100;
}

/** Métodos que se ofrecen al emitir a mano, además de los QR del negocio. */
export const METODOS_PAGO_MANUAL = [
  "Efectivo",
  "Yape",
  "Plin",
  "Tarjeta",
  "Transferencia",
];
