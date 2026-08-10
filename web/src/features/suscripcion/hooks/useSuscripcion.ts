import { useQuery } from "@tanstack/react-query";
import { suscripcionApi } from "../services/suscripcion.api";

export const suscripcionKeys = {
  actual: ["suscripcion", "actual"] as const,
  planes: ["suscripcion", "planes"] as const,
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
