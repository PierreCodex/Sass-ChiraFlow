import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { suscripcionKeys } from "@/features/suscripcion/hooks/useSuscripcion";
import { plataformaApi } from "../services/plataforma.api";
import type { EstadoNegocio, MetodoPagoSuscripcion, PlanPlataforma } from "../types";

const raiz = ["plataforma"] as const;

export const plataformaKeys = {
  resumen: [...raiz, "resumen"] as const,
  negocios: [...raiz, "negocios"] as const,
  negocio: (id: string) => [...raiz, "negocio", id] as const,
  planes: [...raiz, "planes"] as const,
  pagos: [...raiz, "pagos"] as const,
};

export const useResumenPlataforma = () =>
  useQuery({ queryKey: plataformaKeys.resumen, queryFn: plataformaApi.resumen });

export const useNegociosPlataforma = () =>
  useQuery({ queryKey: plataformaKeys.negocios, queryFn: plataformaApi.negocios });

export const useNegocioPlataforma = (id: string) =>
  useQuery({ queryKey: plataformaKeys.negocio(id), queryFn: () => plataformaApi.negocio(id) });

export const usePlanesPlataforma = () =>
  useQuery({ queryKey: plataformaKeys.planes, queryFn: plataformaApi.planes });

export const usePagosPlataforma = () =>
  useQuery({ queryKey: plataformaKeys.pagos, queryFn: plataformaApi.pagos });

/** Cualquier cambio invalida todo el panel: los totales dependen de todo. */
function useRefrescar() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: raiz });
}

export function useAccionesNegocio(id: string) {
  const refrescar = useRefrescar();
  return {
    cambiarPlan: useMutation({
      mutationFn: ({ plan, nota }: { plan: string; nota: string | null }) =>
        plataformaApi.cambiarPlan(id, plan, nota),
      onSuccess: refrescar,
    }),
    registrarPago: useMutation({
      mutationFn: (pago: {
        monto: number;
        metodo: MetodoPagoSuscripcion;
        periodo: string;
        nota: string | null;
      }) => plataformaApi.registrarPago(id, pago),
      onSuccess: refrescar,
    }),
    renovar: useMutation({ mutationFn: () => plataformaApi.renovar(id), onSuccess: refrescar }),
    cambiarEstado: useMutation({
      mutationFn: ({ estado, motivo }: { estado: EstadoNegocio; motivo: string }) =>
        plataformaApi.cambiarEstado(id, estado, motivo),
      onSuccess: refrescar,
    }),
  };
}

export function useGuardarPlan() {
  const refrescar = useRefrescar();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (plan: PlanPlataforma) => plataformaApi.guardarPlan(plan),
    onSuccess: () => {
      refrescar();
      // La landing y «Mi plan» leen estos mismos planes (prototipo).
      queryClient.invalidateQueries({ queryKey: suscripcionKeys.planes });
    },
  });
}

export function useConfirmarPago() {
  const refrescar = useRefrescar();
  return useMutation({ mutationFn: plataformaApi.confirmarPago, onSuccess: refrescar });
}

export function useReiniciarDatos() {
  const refrescar = useRefrescar();
  return useMutation({ mutationFn: plataformaApi.reiniciarDatos, onSuccess: refrescar });
}
