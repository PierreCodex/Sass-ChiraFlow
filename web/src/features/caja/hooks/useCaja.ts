import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAvisos } from "@/context/avisos";
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

/**
 * Las tres acciones invalidan lo mismo: el estado completo de la caja. Y las
 * tres avisan, porque mover dinero sin confirmación visible es justo donde
 * uno duda de si le dio al botón.
 */
function useAccionCaja<TPayload, TResultado>(
  fn: (payload: TPayload) => Promise<TResultado>,
  mensaje: string
) {
  const queryClient = useQueryClient();
  const { avisar } = useAvisos();

  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cajaKeys.all });
      avisar(mensaje);
    },
  });
}

export const useAbrirCaja = () => useAccionCaja(cajaApi.abrir, "Caja abierta");
export const useCerrarCaja = () => useAccionCaja(cajaApi.cerrar, "Caja cerrada");
export const useRegistrarMovimientoCaja = () =>
  useAccionCaja(cajaApi.registrarMovimiento, "Movimiento registrado");
