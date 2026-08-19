import { useQuery } from "@tanstack/react-query";
import { superadminApi } from "../services/superadmin.api";

export const superadminKeys = {
  resumen: ["superadmin", "resumen"] as const,
};

export function useResumenSuperadmin() {
  return useQuery({
    queryKey: superadminKeys.resumen,
    queryFn: superadminApi.resumen,
    staleTime: 30 * 1000,
  });
}
