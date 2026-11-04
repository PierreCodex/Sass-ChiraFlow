import { useMutation, useQuery, useQueryClient, type QueryKey } from "@tanstack/react-query";
import type { ListParams, Paginated } from "@/lib/api/types";
import type { Recurso } from "@/lib/api/recurso";
import { useAvisos } from "@/context/avisos";

/**
 * Cómo se nombra el recurso en los avisos: "Cliente creado", "Categoría
 * eliminada". El género hace falta porque en castellano el participio
 * concuerda, y "Categoría creado" canta.
 */
export interface EtiquetaRecurso {
  /** En singular y con mayúscula inicial: "Cliente", "Categoría". */
  singular: string;
  femenino?: boolean;
}

/**
 * Genera los hooks de React Query de un recurso creado con `crearRecurso`.
 * Centraliza las query keys, la invalidación tras cada mutación y el aviso
 * flotante que le dice al usuario que su acción surtió efecto.
 *
 * El aviso vive **aquí** y no en cada pantalla a propósito: guardar sin
 * respuesta visible es lo que hace dudar de si se guardó, y un módulo nuevo
 * lo hereda sin tener que acordarse.
 * `invalidarTambien` refresca las consultas de otros módulos que dependen del recurso.
 */
export function crearHooksRecurso<T extends { id: number }, P = Partial<T>>(
  clave: string,
  recurso: Recurso<T, P>,
  etiqueta: EtiquetaRecurso = { singular: "Registro" },
  invalidarTambien: readonly QueryKey[] = []
) {
  const participio = (verbo: "cre" | "actualiz" | "elimin") =>
    `${etiqueta.singular} ${verbo}${etiqueta.femenino ? "ada" : "ado"}`;

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

  /*
   * Solo se avisa del éxito. Los errores ya se pintan donde el usuario está
   * mirando —bajo el campo si es un 422, dentro del diálogo si es de red—, y
   * duplicarlos en un toast que se va solo sería peor: se lee a medias y tapa
   * el mensaje que sí explica qué corregir.
   */
  function useCrear() {
    const queryClient = useQueryClient();
    const { avisar } = useAvisos();
    return useMutation({
      mutationFn: (payload: P) => recurso.create(payload),
      onSuccess: async (creado) => {
        queryClient.setQueryData(keys.detail(creado.id), creado);
        void Promise.all(
          [keys.all, ...invalidarTambien].map((queryKey) => queryClient.invalidateQueries({ queryKey }))
        );
        avisar(`${participio("cre")} correctamente`);
      },
    });
  }

  function useActualizar() {
    const queryClient = useQueryClient();
    const { avisar } = useAvisos();
    return useMutation({
      mutationFn: ({ id, payload }: { id: number; payload: Partial<P> }) =>
        recurso.update(id, payload),
      onSuccess: async (actualizado) => {
        queryClient.setQueryData(keys.detail(actualizado.id), actualizado);
        // La respuesta guardada ya es válida, incluso si el refresco posterior falla.
        const reemplazar = (item: T) => item.id === actualizado.id ? actualizado : item;
        queryClient.setQueriesData<Paginated<T>>({ queryKey: [clave, "list"] }, (pagina) =>
          pagina ? { ...pagina, data: pagina.data.map(reemplazar) } : pagina
        );
        queryClient.setQueryData<T[]>(keys.todos, (items) => items?.map(reemplazar));
        void Promise.all(
          [keys.all, ...invalidarTambien].map((queryKey) => queryClient.invalidateQueries({ queryKey }))
        );
        avisar(`${participio("actualiz")} correctamente`);
      },
    });
  }

  function useEliminar() {
    const queryClient = useQueryClient();
    const { avisar } = useAvisos();
    return useMutation({
      mutationFn: (id: number) => recurso.remove(id),
      onSuccess: async () => {
        void Promise.all(
          [keys.all, ...invalidarTambien].map((queryKey) => queryClient.invalidateQueries({ queryKey }))
        );
        avisar(`${participio("elimin")} correctamente`);
      },
    });
  }

  return { keys, useLista, useTodos, useDetalle, useCrear, useActualizar, useEliminar };
}
