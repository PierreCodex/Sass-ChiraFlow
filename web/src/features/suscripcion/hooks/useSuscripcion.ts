import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { suscripcionApi } from "../services/suscripcion.api";
import type { SolicitudPlanPayload } from "../types";

export const suscripcionKeys = {
  all: ["suscripcion"] as const,
  actual: ["suscripcion", "actual"] as const,
  planes: ["suscripcion", "planes"] as const,
  planesPublicos: ["suscripcion", "planes", "publicos"] as const,
};

export function useSuscripcion() {
  return useQuery({
    queryKey: suscripcionKeys.actual,
    queryFn: suscripcionApi.actual,
    // El estado del plan casi no cambia dentro de una sesión.
    staleTime: 5 * 60 * 1000,
  });
}

export function usePlanes() {
  return useQuery({
    queryKey: suscripcionKeys.planes,
    queryFn: suscripcionApi.planes,
    staleTime: 30 * 60 * 1000,
  });
}

/** Los planes para la landing, sin sesión (`GET /publico/planes`). */
export function usePlanesPublicos() {
  return useQuery({
    queryKey: suscripcionKeys.planesPublicos,
    queryFn: suscripcionApi.planesPublicos,
    staleTime: 30 * 60 * 1000,
  });
}

/** Envía la solicitud de plan (abre un ticket, no cobra). */
export function useSolicitarPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SolicitudPlanPayload) =>
      suscripcionApi.solicitar(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: suscripcionKeys.actual });
      // El backend crea un ticket de soporte: la lista queda desactualizada.
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
}
