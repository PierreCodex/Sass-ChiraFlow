import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";

import { useAvisos } from "@/context/avisos";
import { api } from "@/lib/api/client";
import { usarMocksPara } from "@/lib/api/mocks";
import type { ListParams, Paginated } from "@/lib/api/types";
import { delay, paginar } from "@/lib/mock-utils";
import { citasKeys } from "@/features/citas/hooks/useCitas";
import { serviciosApi } from "@/features/servicios/services/servicios.api";
import { seOfreceMock, serviciosHabilitadosMock } from "@/features/servicios/reservabilidad-mock";

/**
 * Qué servicios ofrece cada sede (Story 2.1, FR-21).
 *
 * El catálogo es del negocio; cada sede habilita los suyos. `id` es el del
 * SERVICIO, no el de la fila pivote (contrato § LocalServicio).
 */
export interface LocalServicio {
  id: number;
  nombre: string;
  categoria: { id: number; nombre: string } | null;
  habilitado: boolean;
  sin_quien_lo_preste: boolean;
}

export const localServicioApi = {
  lista: async (localId: number, params: ListParams = {}): Promise<Paginated<LocalServicio>> => {
    if (usarMocksPara("locales")) {
      await delay(250);
      const filas = serviciosApi.mockItems().map((s) => ({
        id: s.id,
        nombre: s.nombre,
        categoria: s.categoria,
        habilitado: seOfreceMock(localId, s.id),
        sin_quien_lo_preste: s.reservabilidad.sedes_sin_quien_lo_preste.some((sede) => sede.id === localId),
      }));
      return paginar(filas, params, ["nombre"]);
    }
    const { data } = await api.get<Paginated<LocalServicio>>(`/locales/${localId}/servicios`, {
      params,
    });
    return data;
  },

  actualizar: async (localId: number, servicioId: number, habilitado: boolean): Promise<LocalServicio> => {
    if (usarMocksPara("locales")) {
      await delay();
      const s = serviciosApi.mockItems().find((x) => x.id === servicioId);
      if (!s) throw new Error("Servicio no encontrado");
      serviciosHabilitadosMock[`${localId}:${servicioId}`] = habilitado;
      return {
        id: s.id, nombre: s.nombre, categoria: s.categoria, habilitado,
        sin_quien_lo_preste: serviciosApi.mockItems().some((servicio) =>
          servicio.id === servicioId && servicio.reservabilidad.sedes_sin_quien_lo_preste.some((sede) => sede.id === localId)
        ),
      };
    }
    const { data } = await api.put<{ data: LocalServicio }>(
      `/locales/${localId}/servicios/${servicioId}`,
      { habilitado }
    );
    return data.data;
  },
};

export const localServicioKeys = {
  all: ["locales", "servicios"] as const,
  porLocal: (localId: number, params: ListParams) => [...localServicioKeys.all, localId, params] as const,
};

export function useServiciosDelLocal(localId: number | undefined, params: ListParams) {
  return useQuery({
    queryKey: localServicioKeys.porLocal(localId ?? 0, params),
    queryFn: () => localServicioApi.lista(localId!, params),
    enabled: !!localId,
    // Al pasar de página o buscar se sigue viendo la anterior hasta que llega.
    placeholderData: keepPreviousData,
  });
}

export function useActualizarLocalServicio(localId: number | undefined) {
  const queryClient = useQueryClient();
  const { avisar } = useAvisos();

  return useMutation({
    mutationFn: ({ servicioId, habilitado }: { servicioId: number; habilitado: boolean }) =>
      localServicioApi.actualizar(localId!, servicioId, habilitado),
    onSuccess: (servicio) => {
      queryClient.invalidateQueries({ queryKey: localServicioKeys.all });
      queryClient.invalidateQueries({ queryKey: ["servicios"] });
      // Lo que se ofrece al agendar depende de esto.
      queryClient.invalidateQueries({ queryKey: citasKeys.all });
      avisar(servicio.habilitado ? `«${servicio.nombre}» se ofrece en esta sede` : `«${servicio.nombre}» ya no se ofrece en esta sede`);
    },
  });
}
