import { api } from "@/lib/api/client";
import { env } from "@/config/env";
import { delay, haceDias, pseudoAleatorio } from "@/lib/mock-utils";
import { negociosMock, ticketsAbiertosMock, ingresosMesMock } from "../mocks";
import type { ResumenSuperadmin } from "../types";
import type { VentaDia } from "@/features/dashboard/types";

/**
 * Serie de 7 días para las gráficas del dashboard. No hay mock de `Pago` ni
 * fechas de alta por negocio todavía, así que se genera con `pseudoAleatorio`
 * (estable por día, no cambia entre renders) — mismo criterio ilustrativo que
 * ya usa el resto de la app para datos que el backend real calculará.
 */
function serieUltimosDias(semilla: number, min: number, max: number): VentaDia[] {
  return Array.from({ length: 7 }, (_, i) => ({
    fecha: haceDias(6 - i),
    total: pseudoAleatorio(semilla + i, min, max),
  }));
}

/**
 * Replica en memoria lo que hace `SuperAdmin\DashboardController@index` en
 * Laravel: cuenta negocios por estado, toma los 8 más recientes, y filtra los
 * que vencen dentro de los próximos 7 días.
 */
function resumenMock(): ResumenSuperadmin {
  const hoy = haceDias(0);
  const limite = haceDias(-7); // dentro de 7 días

  const recientes = negociosMock.slice(0, 8);
  const vencenPronto = negociosMock
    .filter(
      (n) =>
        n.suscripcion_vence_el &&
        n.suscripcion_vence_el >= hoy &&
        n.suscripcion_vence_el <= limite
    )
    .sort((a, b) =>
      (a.suscripcion_vence_el ?? "").localeCompare(b.suscripcion_vence_el ?? "")
    );

  return {
    negocios_total: negociosMock.length,
    negocios_activos: negociosMock.filter((n) => n.estado === "activa").length,
    negocios_suspendidos: negociosMock.filter((n) => n.estado === "suspendida").length,
    negocios_prueba: negociosMock.filter((n) => n.estado === "prueba").length,
    ingresos_mes: ingresosMesMock,
    tickets_abiertos: ticketsAbiertosMock,
    ingresos_ultimos_dias: serieUltimosDias(1, 0, 380),
    negocios_nuevos_ultimos_dias: serieUltimosDias(50, 0, 3),
    recientes,
    vencen_pronto: vencenPronto,
  };
}

export const superadminApi = {
  /** Un solo request para todo el dashboard, igual criterio que `dashboardApi.resumen`. */
  resumen: async (): Promise<ResumenSuperadmin> => {
    if (env.usarMocks) {
      await delay();
      return resumenMock();
    }
    const { data } = await api.get<{ data: ResumenSuperadmin }>(
      "/superadmin/dashboard"
    );
    return data.data;
  },
};
