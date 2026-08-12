import { api } from "@/lib/api/client";
import { env } from "@/config/env";
import { delay, haceDias } from "@/lib/mock-utils";
import { citasMock } from "@/features/citas/mocks";
import { clientesMock } from "@/features/clientes/mocks";
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
      servicio: cita.servicio.nombre,
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
    if (env.usarMocks) {
      await delay();
      return resumenMock();
    }
    const { data } = await api.get<{ data: ResumenDashboard }>("/dashboard");
    return data.data;
  },
};
