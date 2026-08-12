import { haceDias } from "@/lib/mock-utils";
import type { CajaSesion, MovimientoCaja } from "./types";

const hoy = haceDias(0);

/** Marca de tiempo de hoy a la hora indicada, en ISO local. */
function hoyALas(hora: string) {
  return `${hoy}T${hora}:00`;
}

/**
 * La caja arranca **abierta** para que la pantalla principal se vea con
 * datos. Para probar el estado "sin abrir" hay que cerrarla y recargar, o
 * poner `sesionInicial = null`.
 */
export const sesionInicial: CajaSesion | null = {
  id: 1,
  fecha: hoy,
  monto_inicial: 150,
  ingresos: 430,
  egresos: 85,
  monto_final: null,
  abierta_por: "Ana Torres",
  abierta_en: hoyALas("08:45"),
  cerrada_en: null,
};

export const movimientosMock: MovimientoCaja[] = [
  {
    id: 1,
    tipo: "ingreso",
    monto: 90,
    concepto: "Limpieza dental — Lucía Ramos",
    fecha: hoy,
    creado_en: hoyALas("09:20"),
    usuario: "Ana Torres",
  },
  {
    id: 2,
    tipo: "ingreso",
    monto: 120,
    concepto: "Blanqueamiento — Diego Salas",
    fecha: hoy,
    creado_en: hoyALas("10:05"),
    usuario: "Ana Torres",
  },
  {
    id: 3,
    tipo: "egreso",
    monto: 45,
    concepto: "Compra de guantes y mascarillas",
    fecha: hoy,
    creado_en: hoyALas("11:30"),
    usuario: "Ana Torres",
  },
  {
    id: 4,
    tipo: "ingreso",
    monto: 180,
    concepto: "Ortodoncia — cuota mensual Marta Gil",
    fecha: hoy,
    creado_en: hoyALas("12:40"),
    usuario: "Carmen Díaz",
  },
  {
    id: 5,
    tipo: "egreso",
    monto: 40,
    concepto: "Movilidad mensajería",
    fecha: hoy,
    creado_en: hoyALas("13:15"),
    usuario: "Carmen Díaz",
  },
  {
    id: 6,
    tipo: "ingreso",
    monto: 40,
    concepto: "Venta de enjuague bucal",
    fecha: hoy,
    creado_en: hoyALas("16:02"),
    usuario: "Ana Torres",
  },
];
