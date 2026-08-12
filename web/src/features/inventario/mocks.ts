import type { Producto } from "./types";

export const productosMock: Producto[] = [
  { id: 1, nombre: "Enjuague bucal 500ml", descripcion: "Sin alcohol, menta", precio_compra: 11, precio_venta: 18, stock: 24, stock_minimo: 5, activo: true },
  { id: 2, nombre: "Cepillo dental suave", descripcion: "Cerdas suaves", precio_compra: 6, precio_venta: 12, stock: 60, stock_minimo: 10, activo: true },
  { id: 3, nombre: "Pasta dental blanqueadora", descripcion: "100 ml", precio_compra: 14, precio_venta: 22, stock: 18, stock_minimo: 8, activo: true },
  { id: 4, nombre: "Hilo dental", descripcion: "50 m encerado", precio_compra: 4, precio_venta: 8, stock: 45, stock_minimo: 10, activo: true },
  // Bajo el umbral: la tabla lo marca en rojo.
  { id: 5, nombre: "Protector bucal", descripcion: "Termomoldeable", precio_compra: 32, precio_venta: 55, stock: 3, stock_minimo: 5, activo: true },
  { id: 6, nombre: "Crema hidratante facial", descripcion: "Piel sensible, 50 ml", precio_compra: 38, precio_venta: 65, stock: 12, stock_minimo: 6, activo: true },
  { id: 7, nombre: "Bloqueador solar SPF50", descripcion: "Rostro y cuerpo", precio_compra: 29, precio_venta: 48, stock: 30, stock_minimo: 10, activo: true },
  { id: 8, nombre: "Gel antibacterial 250ml", descripcion: null, precio_compra: 5, precio_venta: 10, stock: 80, stock_minimo: 20, activo: true },
  // Agotado.
  { id: 9, nombre: "Mascarilla de arcilla", descripcion: "Uso profesional", precio_compra: 22, precio_venta: 40, stock: 0, stock_minimo: 4, activo: true },
];
