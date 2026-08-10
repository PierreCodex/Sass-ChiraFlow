import type { EstadoCita } from "@/features/citas/types";

/** Una barra de la gráfica "Ventas últimos 7 días". */
export interface VentaDia {
  fecha: string; // "2026-08-09"
  total: number;
}

export interface CitaResumen {
  id: number;
  hora: string; // "14:30" o ISO
  cliente: string;
  servicio: string;
  empleado: string | null;
  estado: EstadoCita;
}

/** Respuesta de GET /api/dashboard */
export interface ResumenDashboard {
  citas_hoy: number;
  citas_pendientes: number;
  total_clientes: number;
  ingresos_hoy: number;
  ventas_ultimos_dias: VentaDia[];
  citas_del_dia: CitaResumen[];
}
