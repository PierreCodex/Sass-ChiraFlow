import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../services/dashboard.api";

export const dashboardKeys = {
  resumen: ["dashboard", "resumen"] as const,
};

/**
 * Todos los widgets del dashboard llaman a este hook. React Query deduplica
 * por query key, así que se dispara una sola request.
 */
export function useResumenDashboard() {
  return useQuery({
    queryKey: dashboardKeys.resumen,
    queryFn: dashboardApi.resumen,
    // Los KPIs del día envejecen rápido.
    staleTime: 30 * 1000,
  });
}
