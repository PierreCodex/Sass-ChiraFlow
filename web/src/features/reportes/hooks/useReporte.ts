import { useMutation, useQuery } from "@tanstack/react-query";
import { reportesApi } from "../services/reportes.api";
import type { ParamsReporte } from "../types";

export const reportesKeys = {
  all: ["reportes"] as const,
  rango: (params: ParamsReporte) => ["reportes", params] as const,
};

export function useReporte(params: ParamsReporte) {
  return useQuery({
    queryKey: reportesKeys.rango(params),
    queryFn: () => reportesApi.obtener(params),
    // Un reporte de un rango cerrado no cambia mientras se mira.
    staleTime: 5 * 60 * 1000,
  });
}

/** Descarga el CSV. No hay query que invalidar: solo baja un archivo. */
export function useExportarReporte() {
  return useMutation({
    mutationFn: (params: ParamsReporte) => reportesApi.exportar(params),
  });
}
