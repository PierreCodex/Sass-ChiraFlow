import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toApiError } from "@/lib/api/client";
import { publicoApi } from "../services/publico.api";
import { CUALQUIER_PROFESIONAL, type ReservaPayload } from "../types";

export const publicoKeys = {
  negocio: (slug: string) => ["publico", slug] as const,
  tienda: (slug: string, sede: string) =>
    ["publico", slug, "sucursal", sede] as const,
  horarios: (
    slug: string,
    localId: number,
    servicios: number[],
    profesionalId: number | null,
    fecha: string
  ) =>
    [
      "publico", slug, localId, "horarios",
      servicios.join(","), profesionalId ?? "sin-elegir", fecha,
    ] as const,
  /** Las sedes de un negocio: para refrescar el catálogo (Story 6.5). */
  sedesDe: (slug: string) => ["publico", slug, "sucursal"] as const,
  /** Todas las de una sede: para refrescarlas tras perder una hora. */
  horariosDe: (slug: string, localId: number) =>
    ["publico", slug, localId, "horarios"] as const,
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

/**
 * Una sede por su slug (o uno antiguo, o el id): Story 6.2.
 *
 * Story 6.5: se vuelve a pedir cada minuto y al volver a la pestaña. Si un
 * servicio deja de ser reservable mientras el cliente elige, la página lo
 * quita de su selección y se lo dice.
 */
export function useTienda(slug: string, sede: string) {
  return useQuery({
    queryKey: publicoKeys.tienda(slug, sede),
    queryFn: () => publicoApi.tienda(slug, sede),
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
    retry: false,
    enabled: sede !== "",
  });
}

/**
 * Huecos libres (Story 6.4). A diferencia del catálogo se cachean **solo 30 s**:
 * entre que el cliente elige y confirma, otro puede llevarse la hora. Se
 * vuelven a pedir cada 30 s y al volver a la pestaña.
 *
 * `profesionalId`: `null` = sin elegir (no se pide nada);
 * `CUALQUIER_PROFESIONAL` = las horas de cualquiera que pueda atender.
 */
export function useHorarios(
  slug: string,
  localId: number,
  servicios: number[],
  profesionalId: number | null,
  fecha: string | null
) {
  return useQuery({
    queryKey: publicoKeys.horarios(slug, localId, servicios, profesionalId, fecha ?? ""),
    queryFn: () =>
      publicoApi.horarios(slug, localId, {
        fecha: fecha!,
        servicios,
        profesional_id:
          profesionalId === CUALQUIER_PROFESIONAL ? null : profesionalId,
      }),
    enabled: profesionalId !== null && !!fecha && servicios.length > 0,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
    // Un 404 es «ya no se puede reservar»: reintentar no lo arregla.
    retry: (intentos, error) => toApiError(error).status !== 404 && intentos < 2,
  });
}

export function useReservar(slug: string, localId: number) {
  return useMutation({
    mutationFn: (payload: ReservaPayload) =>
      publicoApi.reservar(slug, localId, payload),
  });
}

/** Story 6.7: confirma al abrir el enlace del correo. Una sola vez por visita. */
export function useConfirmarReserva(slug: string, codigo: string, firma: string) {
  return useQuery({
    queryKey: ["publico", slug, "confirmar", codigo, firma] as const,
    queryFn: () => publicoApi.confirmar(slug, codigo, firma),
    enabled: !!codigo && !!firma,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    retry: (intentos, error) => toApiError(error).status !== 404 && intentos < 2,
  });
}

/** Story 6.8: la cita del enlace «Gestionar mi cita». */
export function useMiCita(slug: string, token: string) {
  return useQuery({
    queryKey: ["publico", slug, "mi-cita", token] as const,
    queryFn: () => publicoApi.miCita(slug, token),
    refetchOnWindowFocus: true,
    retry: (intentos, error) => ![404, 410].includes(toApiError(error).status ?? 0) && intentos < 2,
  });
}

export function useHorariosMiCita(slug: string, token: string, fecha: string | null) {
  return useQuery({
    queryKey: ["publico", slug, "mi-cita", token, "horarios", fecha] as const,
    queryFn: () => publicoApi.horariosMiCita(slug, token, fecha!),
    enabled: !!fecha,
    staleTime: 30 * 1000,
  });
}

export function useCambiarMiCita(slug: string, token: string) {
  const queryClient = useQueryClient();
  const clave = ["publico", slug, "mi-cita", token] as const;
  const alTerminar = (cita: Awaited<ReturnType<typeof publicoApi.miCita>>) => {
    queryClient.setQueryData(clave, cita);
    queryClient.invalidateQueries({ queryKey: [...clave, "horarios"] });
  };

  return {
    reprogramar: useMutation({
      mutationFn: ({ fecha, hora }: { fecha: string; hora: string }) =>
        publicoApi.reprogramarMiCita(slug, token, fecha, hora),
      onSuccess: alTerminar,
    }),
    cancelar: useMutation({
      mutationFn: () => publicoApi.cancelarMiCita(slug, token),
      onSuccess: alTerminar,
    }),
  };
}
