import { pseudoAleatorio } from "@/lib/mock-utils";
import { serviciosMock } from "@/features/servicios/mocks";
import { empleadosMock } from "@/features/empleados/mocks";
import { saleEnAgenda } from "@/features/empleados/types";
import type {
  DiaIngresos,
  FilaAgrupada,
  FilaPorHora,
  FuenteReporte,
  MetricasPeriodo,
  ParamsReporte,
  Reporte,
} from "./types";

/**
 * A diferencia del resto de módulos, el reporte **no se calcula a partir de
 * `citasMock`**: esos datos cubren unas dos semanas y cualquier rango normal
 * saldría casi vacío, que es justo lo que no sirve para revisar la maqueta.
 *
 * En su lugar se generan cifras deterministas a partir de la fecha, para que
 * el mismo rango dé siempre el mismo reporte. Los **nombres** sí salen de los
 * mocks reales de servicios y empleados.
 */

const DIAS_SEMANA = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

/** Semilla estable a partir de una cadena. */
function semilla(texto: string) {
  let total = 0;
  for (let i = 0; i < texto.length; i++) {
    total = (total * 31 + texto.charCodeAt(i)) % 100000;
  }
  return total;
}

function diasEntre(desde: string, hasta: string) {
  const inicio = new Date(`${desde}T00:00:00`);
  const fin = new Date(`${hasta}T00:00:00`);
  return Math.max(
    1,
    Math.round((fin.getTime() - inicio.getTime()) / 86400000) + 1
  );
}

function sumarDias(fechaISO: string, dias: number) {
  const fecha = new Date(`${fechaISO}T00:00:00`);
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

/** "2026-08-12" -> "12/08" */
function etiquetaDia(fechaISO: string) {
  return `${fechaISO.slice(8, 10)}/${fechaISO.slice(5, 7)}`;
}

function ingresosDelDia(fechaISO: string) {
  const fecha = new Date(`${fechaISO}T00:00:00`);
  const diaSemana = fecha.getDay(); // 0 = domingo
  if (diaSemana === 0) return 0; // el negocio no abre los domingos

  const base = pseudoAleatorio(semilla(fechaISO), 240, 980);
  // Los sábados se factura menos porque solo hay medio turno.
  return diaSemana === 6 ? Math.round(base * 0.55) : base;
}

function metricasDe(desde: string, hasta: string): MetricasPeriodo {
  const dias = diasEntre(desde, hasta);
  let ingresos = 0;
  let citas = 0;

  for (let i = 0; i < dias; i++) {
    const fecha = sumarDias(desde, i);
    const monto = ingresosDelDia(fecha);
    ingresos += monto;
    citas += monto === 0 ? 0 : pseudoAleatorio(semilla(`c${fecha}`), 4, 14);
  }

  const canceladas = Math.round(
    citas * (pseudoAleatorio(semilla(`x${desde}`), 4, 13) / 100)
  );
  const completadas = citas - canceladas - Math.round(citas * 0.06);

  return {
    citas,
    completadas: Math.max(0, completadas),
    canceladas,
    ingresos,
    ocupacion: Number(
      (pseudoAleatorio(semilla(`o${desde}${hasta}`), 3200, 7400) / 100).toFixed(2)
    ),
    inasistencias: citas
      ? Number(((canceladas / citas) * 100).toFixed(2))
      : 0,
  };
}

/** Reparte un total entre filas de forma estable, dejando alguna en cero. */
function desglose(
  items: { id: number; nombre: string }[],
  total: number,
  prefijo: string
): FilaAgrupada[] {
  const pesos = items.map((item) =>
    pseudoAleatorio(semilla(`${prefijo}${item.id}`), 0, 100)
  );
  const suma = pesos.reduce((a, b) => a + b, 0) || 1;

  return items.map((item, i) => {
    const cantidad = Math.round((pesos[i] / suma) * total);
    return {
      id: item.id,
      nombre: item.nombre,
      total: cantidad,
      monto_total: cantidad * pseudoAleatorio(semilla(`p${item.id}`), 25, 130),
    };
  });
}

function horasDelNegocio(apertura = 9, cierre = 20) {
  return Array.from({ length: cierre - apertura }, (_, i) =>
    `${String(apertura + i).padStart(2, "0")}:00`
  );
}

function porHora(horas: string[]): FilaPorHora[] {
  return DIAS_SEMANA.map((dia, indiceDia) => ({
    dia,
    data: horas.map((hora) => {
      // Domingo cerrado; sábado solo mañana.
      if (indiceDia === 6) return 0;
      const numeroHora = Number(hora.slice(0, 2));
      if (indiceDia === 5 && numeroHora >= 14) return 0;

      const base = pseudoAleatorio(semilla(`${dia}${hora}`), 0, 9);
      // Pico de media mañana y de media tarde, valle a la hora de comer.
      if (numeroHora === 13) return Math.max(0, base - 5);
      if (numeroHora === 10 || numeroHora === 17) return base + 3;
      return base;
    }),
  }));
}

export function reporteMock({ desde, hasta }: ParamsReporte): Reporte {
  const dias = diasEntre(desde, hasta);
  const prevHasta = sumarDias(desde, -1);
  const prevDesde = sumarDias(desde, -dias);

  const actual = metricasDe(desde, hasta);
  const anterior = metricasDe(prevDesde, prevHasta);

  const horas = horasDelNegocio();

  const diario: DiaIngresos[] = Array.from({ length: dias }, (_, i) => ({
    etiqueta: etiquetaDia(sumarDias(desde, i)),
    actual: ingresosDelDia(sumarDias(desde, i)),
    anterior: ingresosDelDia(sumarDias(prevDesde, i)),
  }));

  const fuentes: FuenteReporte[] = [
    { clave: "web", label: "Web" },
    { clave: "panel", label: "Panel" },
    { clave: "publica", label: "Pública" },
  ].map(({ clave, label }) => ({
    clave,
    label,
    actual: Math.round(
      actual.citas * (pseudoAleatorio(semilla(`f${clave}`), 15, 50) / 100)
    ),
    anterior: Math.round(
      anterior.citas * (pseudoAleatorio(semilla(`g${clave}`), 15, 50) / 100)
    ),
  }));

  return {
    rango: { desde, hasta, prev_desde: prevDesde, prev_hasta: prevHasta },
    actual,
    anterior,
    // El backend solo lista servicios y profesionales activos.
    por_servicio: desglose(
      serviciosMock.filter((servicio) => servicio.activo),
      actual.completadas,
      "s"
    ),
    por_profesional: desglose(
      empleadosMock.filter(saleEnAgenda),
      actual.completadas,
      "e"
    ),
    horas,
    por_hora: porHora(horas),
    fuentes,
    diario,
  };
}
