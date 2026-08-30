import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAvisos } from "@/context/avisos";
import { crearHooksRecurso } from "@/lib/query/recurso-hooks";
import type {
  Grupo,
  GrupoPayload,
  LocalProfesionalPayload,
} from "../types";
import { gruposApi, localProfesionalApi } from "../services/recursos.api";

export const localProfesionalKeys = {
  all: ["local-profesional"] as const,
  porLocal: (localId: number) => ["local-profesional", localId] as const,
};

/** Profesionales del negocio con su configuración en un local. */
export function useProfesionalesDelLocal(localId: number | undefined) {
  return useQuery({
    queryKey: localProfesionalKeys.porLocal(localId ?? 0),
    queryFn: () => localProfesionalApi.lista(localId!),
    enabled: !!localId,
  });
}

/** Sirve tanto para el interruptor de la tabla como para el modal. */
export function useActualizarLocalProfesional(localId: number | undefined) {
  const queryClient = useQueryClient();
  const { avisar } = useAvisos();

  return useMutation({
    mutationFn: ({
      profesionalId,
      payload,
    }: {
      profesionalId: number;
      payload: LocalProfesionalPayload;
    }) => localProfesionalApi.actualizar(localId!, profesionalId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: localProfesionalKeys.all });
      avisar("Profesional actualizado");
    },
  });
}

export const {
  keys: gruposKeys,
  useLista: useGrupos,
  useCrear: useCrearGrupo,
  useActualizar: useActualizarGrupo,
  useEliminar: useEliminarGrupo,
} = crearHooksRecurso<Grupo, GrupoPayload>("grupos", gruposApi, {
  singular: "Grupo",
});
