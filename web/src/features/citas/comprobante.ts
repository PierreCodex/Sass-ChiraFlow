import type { BorradorComprobante } from "@/features/comprobantes/components/DialogoEmitirComprobante";

import { lineasDeServicio, type Cita, type EstadoCita } from "./types";

/**
 * Una cita que no se atendió no se cobra: sin comprobante. El resto sí,
 * aunque esté pendiente — hay negocios que cobran por adelantado.
 */
const SIN_COMPROBANTE: EstadoCita[] = ["cancelada", "no_asistio"];

export function admiteComprobante(cita: Cita): boolean {
  return !SIN_COMPROBANTE.includes(cita.estado);
}

/**
 * El borrador del comprobante con lo que ya dice la cita: el cliente y una
 * línea por servicio y por producto. El documento del cliente no lo guarda
 * la cita, así que se pide en el diálogo.
 */
export function borradorDesdeCita(cita: Cita): BorradorComprobante {
  return {
    reserva_codigo: cita.codigo,
    metodo_pago: null,
    cliente: {
      nombre: cita.cliente_nombre,
      email: cita.cliente_email ?? undefined,
      telefono: cita.cliente_telefono ?? undefined,
    },
    lineas: [
      ...lineasDeServicio(cita).map((linea) => ({
        descripcion: linea.nombre,
        cantidad: linea.cantidad || 1,
        // La tarifa congelada el día de la reserva (api-contract, LineaServicio).
        precio_unitario: linea.precio,
      })),
      ...cita.productos.map((producto) => ({
        descripcion: producto.nombre,
        cantidad: producto.cantidad,
        precio_unitario: producto.precio_unitario,
      })),
    ],
  };
}
