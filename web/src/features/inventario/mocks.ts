import type { Producto } from "./types";

export const productosMock: Producto[] = [
  { id: 1, nombre: "Enjuague bucal 500ml", sku: "ENJ-500", precio: 18, stock: 24 },
  { id: 2, nombre: "Cepillo dental suave", sku: "CEP-SUA", precio: 12, stock: 60 },
  { id: 3, nombre: "Pasta dental blanqueadora", sku: "PAS-BLA", precio: 22, stock: 18 },
  { id: 4, nombre: "Hilo dental", sku: "HIL-001", precio: 8, stock: 45 },
  { id: 5, nombre: "Protector bucal", sku: "PRO-BUC", precio: 55, stock: 7 },
  { id: 6, nombre: "Crema hidratante facial", sku: "CRE-HID", precio: 65, stock: 12 },
  { id: 7, nombre: "Bloqueador solar SPF50", sku: "BLO-50", precio: 48, stock: 30 },
  { id: 8, nombre: "Gel antibacterial 250ml", sku: "GEL-250", precio: 10, stock: 80 },
];
