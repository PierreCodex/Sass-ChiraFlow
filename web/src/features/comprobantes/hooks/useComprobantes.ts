import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { comprobantesApi } from "../services/comprobantes.api";
import type { Comprobante, NuevoComprobante } from "../types";

export const comprobantesKeys = {
  lista: ["comprobantes", "lista"] as const,
};

export function useComprobantes() {
  return useQuery({ queryKey: comprobantesKeys.lista, queryFn: comprobantesApi.listar });
}

/** El comprobante vigente de una reserva, si ya se emitió. */
export function useComprobanteDeReserva(codigo: string | null) {
  return useQuery({
    queryKey: comprobantesKeys.lista,
    queryFn: comprobantesApi.listar,
    enabled: !!codigo,
    select: (lista) =>
      lista.find((item) => item.reserva_codigo === codigo && item.estado === "emitido") ??
      null,
  });
}

export function useEmitirComprobante() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nuevo: NuevoComprobante) => comprobantesApi.emitir(nuevo),
    onSuccess: (comprobante) =>
      queryClient.setQueryData<Comprobante[]>(comprobantesKeys.lista, (lista) =>
        lista ? [comprobante, ...lista] : lista
      ),
  });
}

export function useAnularComprobante() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo: string }) =>
      comprobantesApi.anular(id, motivo),
    onSuccess: (anulado) =>
      queryClient.setQueryData<Comprobante[]>(comprobantesKeys.lista, (lista) =>
        lista?.map((item) => (item.id === anulado.id ? anulado : item))
      ),
  });
}
