import { env } from "@/config/env";
import { usarMocksPara } from "@/lib/api/mocks";
import { api } from "@/lib/api/client";
import { delay, haceDias } from "@/lib/mock-utils";
import { citasMock } from "@/features/citas/mocks";
import { citasApi } from "@/features/citas/services/citas.api";
import { nombreDeServicios, type Cita } from "@/features/citas/types";
import { clientesMock } from "@/features/clientes/mocks";
import { clientesApi } from "@/features/clientes/services/clientes.api";
import type { ResumenDashboard } from "../types";

/**
 * El resumen ficticio se calcula a partir de los mismos mocks de citas y
 * clientes, para que los números del dashboard cuadren con lo que se ve en
 * las otras pantallas.
 */
function resumenMock(): ResumenDashboard {
  const hoy = haceDias(0);
  const citasDeHoy = citasMock.filter((cita) => cita.fecha === hoy);

  const ventasUltimosDias = Array.from({ length: 7 }, (_, i) => {
    const fecha = haceDias(6 - i);
    const total = citasMock
      .filter((cita) => cita.fecha === fecha && cita.estado === "completada")
      .reduce((suma, cita) => suma + cita.monto, 0);
    return { fecha, total };
  });

  return {
    citas_hoy: citasDeHoy.length,
    citas_pendientes: citasMock.filter((cita) => cita.estado === "pendiente")
      .length,
    total_clientes: clientesMock.length,
    ingresos_hoy: citasDeHoy
      .filter((cita) => cita.estado === "completada")
      .reduce((suma, cita) => suma + cita.monto, 0),
    ventas_ultimos_dias: ventasUltimosDias,
    citas_del_dia: citasDeHoy.map((cita) => ({
      id: cita.id,
      hora: cita.hora_inicio,
      cliente: cita.cliente_nombre,
      servicio: nombreDeServicios(cita),
      empleado: cita.empleado?.nombre ?? null,
      estado: cita.estado,
    })),
  };
}

/** «2026-11-11» en la hora del navegador, hace `dias` días (no en UTC: a las 20:00 en Lima, UTC ya es mañana). */
function fechaLocal(dias: number) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  const dosCifras = (n: number) => String(n).padStart(2, "0");
  return `${fecha.getFullYear()}-${dosCifras(fecha.getMonth() + 1)}-${dosCifras(fecha.getDate())}`;
}

/** Lo cobrado de las citas completadas: servicios y productos. */
const cobrado = (citas: Cita[]) =>
  citas
    .filter((cita) => cita.estado === "completada")
    .reduce((suma, cita) => suma + (cita.monto_total ?? cita.monto), 0);

/**
 * Sin endpoint `/dashboard` todavía, el resumen se arma con lo que SÍ está
 * conectado: las citas de cada día y el total de clientes y de pendientes.
 * Un negocio nuevo ve ceros y se llena solo al usarlo. Cuando exista el
 * endpoint, se conecta `dashboard` y esto deja de usarse.
 */
async function resumenReal(): Promise<ResumenDashboard> {
  const dias = Array.from({ length: 7 }, (_, i) => fechaLocal(6 - i));

  const [porDia, pendientes, clientes] = await Promise.all([
    Promise.all(dias.map((fecha) => citasApi.porFecha(fecha))),
    citasApi.list({ estado: "pendiente", per_page: 1 }),
    clientesApi.list({ per_page: 1 }),
  ]);

  const citasDeHoy = [...porDia[porDia.length - 1]].sort((a, b) =>
    a.hora_inicio.localeCompare(b.hora_inicio)
  );

  return {
    citas_hoy: citasDeHoy.length,
    citas_pendientes: pendientes.meta.total,
    total_clientes: clientes.meta.total,
    ingresos_hoy: cobrado(citasDeHoy),
    ventas_ultimos_dias: dias.map((fecha, i) => ({ fecha, total: cobrado(porDia[i]) })),
    citas_del_dia: citasDeHoy.map((cita) => ({
      id: cita.id,
      hora: cita.hora_inicio,
      cliente: cita.cliente_nombre,
      servicio: nombreDeServicios(cita),
      empleado: cita.empleado?.nombre ?? null,
      estado: cita.estado,
    })),
  };
}

export const dashboardApi = {
  /**
   * Un solo endpoint devuelve todo lo que pinta el dashboard.
   * Evita 4 requests en paralelo al cargar la pantalla principal.
   */
  resumen: async (): Promise<ResumenDashboard> => {
    if (usarMocksPara("dashboard")) {
      // En producción no se enseñan datos inventados: se calcula con lo real.
      if (!env.mostrarDatosFicticios) return resumenReal();
      await delay();
      return resumenMock();
    }
    const { data } = await api.get<{ data: ResumenDashboard }>("/dashboard");
    return data.data;
  },
};
