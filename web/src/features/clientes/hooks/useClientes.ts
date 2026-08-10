import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ListParams } from "@/lib/api/types";
import { clientesApi } from "../services/clientes.api";
import type { ClientePayload } from "../types";

/**
 * Query keys centralizadas: así invalidar la caché nunca depende de
 * recordar el string exacto en cada sitio.
 */
export const clientesKeys = {
  all: ["clientes"] as const,
  list: (params: ListParams) => [...clientesKeys.all, "list", params] as const,
  detail: (id: number) => [...clientesKeys.all, "detail", id] as const,
};

export function useClientes(params: ListParams = {}) {
  return useQuery({
    queryKey: clientesKeys.list(params),
    queryFn: () => clientesApi.list(params),
  });
}

export function useCliente(id: number) {
  return useQuery({
    queryKey: clientesKeys.detail(id),
    queryFn: () => clientesApi.get(id),
    enabled: Number.isFinite(id),
  });
}

export function useCrearCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ClientePayload) => clientesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientesKeys.all });
    },
  });
}

export function useActualizarCliente(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<ClientePayload>) =>
      clientesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientesKeys.all });
    },
  });
}

export function useEliminarCliente() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => clientesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientesKeys.all });
    },
  });
}
