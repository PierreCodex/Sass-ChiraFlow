import { useMutation, useQuery } from "@tanstack/react-query";
import { publicoApi } from "../services/publico.api";
import type { ReservaPayload } from "../types";

export const publicoKeys = {
  negocio: (slug: string) => ["publico", slug] as const,
  tienda: (slug: string, localId: number) =>
    ["publico", slug, "sucursal", localId] as const,
  horarios: (
    slug: string,
    localId: number,
    profesionalId: number,
    fecha: string,
    duracion: number
  ) =>
    ["publico", slug, localId, "horarios", profesionalId, fecha, duracion] as const,
};

/** Negocio + sedes. El catálogo no cambia mientras el cliente reserva. */
export function useNegocioPublico(slug: string) {
  return useQuery({
    queryKey: publicoKeys.negocio(slug),
    queryFn: () => publicoApi.negocio(slug),
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
}

export function useTienda(slug: string, localId: number) {
  return useQuery({
    queryKey: publicoKeys.tienda(slug, localId),
    queryFn: () => publicoApi.tienda(slug, localId),
    staleTime: 10 * 60 * 1000,
    retry: false,
    enabled: Number.isFinite(localId),
  });
}

/**
 * Huecos libres. A diferencia del catálogo **no se cachea mucho**: entre que
 * el cliente elige y confirma, otro puede haber tomado la hora.
 */
export function useHorarios(
  slug: string,
  localId: number,
  profesionalId: number | null,
  fecha: string | null,
  duracionMin: number
) {
  return useQuery({
    queryKey: publicoKeys.horarios(
      slug,
      localId,
      profesionalId ?? 0,
      fecha ?? "",
      duracionMin
    ),
    queryFn: () =>
      publicoApi.horarios(slug, localId, {
        profesional_id: profesionalId!,
        fecha: fecha!,
        duracion_min: duracionMin,
      }),
    enabled: !!profesionalId && !!fecha && duracionMin > 0,
    staleTime: 30 * 1000,
  });
}

export function useReservar(slug: string, localId: number) {
  return useMutation({
    mutationFn: (payload: ReservaPayload) =>
      publicoApi.reservar(slug, localId, payload),
  });
}
