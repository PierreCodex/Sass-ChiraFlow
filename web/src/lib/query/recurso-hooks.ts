import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ListParams } from "@/lib/api/types";
import type { Recurso } from "@/lib/api/recurso";

/**
 * Genera los hooks de React Query de un recurso creado con `crearRecurso`.
 * Centraliza las query keys y la invalidación tras cada mutación.
 */
export function crearHooksRecurso<T extends { id: number }, P = Partial<T>>(
  clave: string,
  recurso: Recurso<T, P>
) {
  const keys = {
    all: [clave] as const,
    list: (params: ListParams) => [clave, "list", params] as const,
    todos: [clave, "todos"] as const,
    detail: (id: number) => [clave, "detail", id] as const,
  };

  function useLista(params: ListParams = {}) {
    return useQuery({
      queryKey: keys.list(params),
      queryFn: () => recurso.list(params),
    });
  }

  function useTodos() {
    return useQuery({
      queryKey: keys.todos,
      queryFn: () => recurso.all(),
      staleTime: 5 * 60 * 1000,
    });
  }

  function useDetalle(id: number) {
    return useQuery({
      queryKey: keys.detail(id),
      queryFn: () => recurso.get(id),
      enabled: Number.isFinite(id),
    });
  }

  function useCrear() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (payload: P) => recurso.create(payload),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
    });
  }

  function useActualizar() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, payload }: { id: number; payload: Partial<P> }) =>
        recurso.update(id, payload),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
    });
  }

  function useEliminar() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: number) => recurso.remove(id),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all }),
    });
  }

  return { keys, useLista, useTodos, useDetalle, useCrear, useActualizar, useEliminar };
}
