import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pagosApi } from "../services/pagos.api";
import type { ConfigPagos, PagoReserva } from "../types";

export const pagosKeys = {
  config: ["pagos", "config"] as const,
  configPublica: (slug: string) => ["publico", slug, "pagos"] as const,
  pago: (slug: string, codigo: string) => ["publico", slug, "pago", codigo] as const,
  lista: ["pagos", "lista"] as const,
};

export function useConfigPagos() {
  return useQuery({ queryKey: pagosKeys.config, queryFn: pagosApi.config });
}

export function useGuardarConfigPagos() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (config: ConfigPagos) => pagosApi.guardarConfig(config),
    onSuccess: (config) => {
      queryClient.setQueryData(pagosKeys.config, config);
      queryClient.invalidateQueries({ queryKey: ["publico"] });
    },
  });
}

/** Lo que la tienda necesita para ofrecer el pago. */
export function useConfigPagosPublica(slug: string) {
  return useQuery({
    queryKey: pagosKeys.configPublica(slug),
    queryFn: () => pagosApi.configPublica(slug),
    staleTime: 60 * 1000,
  });
}

export function usePagoDeReserva(slug: string, codigo: string) {
  return useQuery({
    queryKey: pagosKeys.pago(slug, codigo),
    queryFn: () => pagosApi.pagoDeReserva(slug, codigo),
  });
}

export function useSubirComprobante(slug: string, codigo: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (datos: {
      metodo_id: number;
      comprobante: File;
      codigo_operacion: string | null;
    }) => pagosApi.subirComprobante(slug, codigo, datos),
    onSuccess: (pago) => queryClient.setQueryData(pagosKeys.pago(slug, codigo), pago),
  });
}

export function usePagos() {
  return useQuery({
    queryKey: pagosKeys.lista,
    queryFn: pagosApi.listar,
    // El cliente puede subir su captura en cualquier momento.
    refetchInterval: 15 * 1000,
  });
}

/** Las tres decisiones de la encargada sobre un pago. */
export function useDecidirPago() {
  const queryClient = useQueryClient();
  const alTerminar = (pago: PagoReserva) => {
    queryClient.setQueryData<PagoReserva[]>(pagosKeys.lista, (lista) =>
      lista?.map((item) => (item.codigo === pago.codigo ? pago : item))
    );
  };

  return {
    aprobar: useMutation({ mutationFn: pagosApi.aprobar, onSuccess: alTerminar }),
    pedirOtra: useMutation({
      mutationFn: ({ codigo, motivo }: { codigo: string; motivo: string }) =>
        pagosApi.pedirOtra(codigo, motivo),
      onSuccess: alTerminar,
    }),
    rechazar: useMutation({
      mutationFn: ({ codigo, motivo }: { codigo: string; motivo: string }) =>
        pagosApi.rechazar(codigo, motivo),
      onSuccess: alTerminar,
    }),
  };
}
