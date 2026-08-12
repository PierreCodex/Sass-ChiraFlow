export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio_compra: number;
  /** El que se cobra al cliente. Es el que usa el formulario de Citas. */
  precio_venta: number;
  stock: number;
  /** Umbral de alerta. Por defecto 5. */
  stock_minimo: number;
  activo: boolean;
}

export interface ProductoPayload {
  nombre: string;
  descripcion: string | null;
  precio_compra: number;
  precio_venta: number;
  stock: number;
  stock_minimo: number;
}

export type TipoMovimiento = "entrada" | "salida";

/**
 * Movimiento de stock. El backend recalcula `producto.stock` sumando o
 * restando según el tipo, así que no se envía el stock resultante.
 */
export interface MovimientoPayload {
  tipo: TipoMovimiento;
  cantidad: number;
  motivo: string | null;
}

/** ¿El producto está en o por debajo de su umbral? */
export function stockBajo(producto: Producto) {
  return producto.stock <= producto.stock_minimo;
}
