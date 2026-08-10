import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { configuracionApi } from "../services/configuracion.api";
import type { Configuracion } from "../types";

export const configuracionKeys = {
  all: ["configuracion"] as const,
};

export function useConfiguracion() {
  return useQuery({
    queryKey: configuracionKeys.all,
    queryFn: configuracionApi.obtener,
    // Cambia muy poco y la consulta el formulario de citas en cada apertura.
    staleTime: 10 * 60 * 1000,
  });
}

export function useGuardarConfiguracion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Configuracion) => configuracionApi.guardar(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: configuracionKeys.all }),
  });
}
