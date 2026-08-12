/** Las seis cifras que calcula `ReporteController::metricasFn`. */
export interface MetricasPeriodo {
  citas: number;
  completadas: number;
  canceladas: number;
  ingresos: number;
  /** % del tiempo disponible que se llegó a ocupar. */
  ocupacion: number;
  /** % de citas canceladas sobre el total. */
  inasistencias: number;
}

/** Fila de los desgloses por servicio y por profesional. */
export interface FilaAgrupada {
  id: number;
  nombre: string;
  total: number;
  monto_total: number;
}

export interface RangoReporte {
  desde: string; // YYYY-MM-DD
  hasta: string;
  /** Período con el que se compara: mismo número de días, justo antes. */
  prev_desde: string;
  prev_hasta: string;
}

/** Una fila del mapa de calor: un día de la semana con su conteo por hora. */
export interface FilaPorHora {
  dia: string; // "Lunes"
  data: number[]; // alineado con `horas`
}

export interface FuenteReporte {
  clave: string; // "web" | "panel" | "publica"
  label: string;
  actual: number;
  anterior: number;
}

export interface DiaIngresos {
  /** Etiqueta ya formateada por el backend: "12/08". */
  etiqueta: string;
  actual: number;
  /** null si el período anterior tiene menos días que el actual. */
  anterior: number | null;
}

/** Todo lo que pinta la pantalla, en una sola respuesta. */
export interface Reporte {
  rango: RangoReporte;
  actual: MetricasPeriodo;
  anterior: MetricasPeriodo;
  por_servicio: FilaAgrupada[];
  por_profesional: FilaAgrupada[];
  /** Franjas horarias del negocio: ["09:00", "10:00", …]. */
  horas: string[];
  por_hora: FilaPorHora[];
  fuentes: FuenteReporte[];
  diario: DiaIngresos[];
}

export interface ParamsReporte {
  desde: string;
  hasta: string;
}

/**
 * Variación porcentual respecto al período anterior.
 *
 * Réplica de la función `cambioMetrica` del Blade: sin base previa, cualquier
 * valor positivo cuenta como +100%.
 */
export function variacion(actual: number, anterior: number) {
  if (anterior === 0) {
    return actual > 0 ? 100 : 0;
  }
  return ((actual - anterior) / Math.abs(anterior)) * 100;
}
