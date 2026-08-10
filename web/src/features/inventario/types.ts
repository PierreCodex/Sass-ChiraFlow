/**
 * Módulo de Inventario todavía sin maquetar: este tipo existe porque el
 * formulario de Citas necesita listar productos. Al construir Inventario,
 * revisar los campos contra la vista real.
 */
export interface Producto {
  id: number;
  nombre: string;
  sku: string | null;
  precio: number;
  stock: number;
}
