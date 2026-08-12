import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cajaApi } from "../services/caja.api";

export const cajaKeys = {
  all: ["caja"] as const,
  estado: ["caja", "estado"] as const,
};

/** Sesión de caja de hoy + sus movimientos. */
export function useEstadoCaja() {
  return useQuery({
    queryKey: cajaKeys.estado,
    queryFn: cajaApi.estado,
    staleTime: 30 * 1000,
  });
}

/** Las tres acciones invalidan lo mismo: el estado completo de la caja. */
function useAccionCaja<TPayload, TResultado>(
  fn: (payload: TPayload) => Promise<TResultado>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: fn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cajaKeys.all }),
  });
}

export const useAbrirCaja = () => useAccionCaja(cajaApi.abrir);
export const useCerrarCaja = () => useAccionCaja(cajaApi.cerrar);
export const useRegistrarMovimientoCaja = () =>
  useAccionCaja(cajaApi.registrarMovimiento);
