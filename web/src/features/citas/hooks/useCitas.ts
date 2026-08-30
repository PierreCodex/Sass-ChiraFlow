import { useQuery } from "@tanstack/react-query";
import { crearHooksRecurso } from "@/lib/query/recurso-hooks";
import type { Cita, CitaPayload } from "../types";
import { citasApi } from "../services/citas.api";

export const {
  keys: citasKeys,
  useLista: useCitas,
  useTodos: useTodasLasCitas,
  useDetalle: useCita,
  useCrear: useCrearCita,
  useActualizar: useActualizarCita,
  useEliminar: useEliminarCita,
} = crearHooksRecurso<Cita, CitaPayload>("citas", citasApi, {
  singular: "Cita",
  femenino: true,
});

/** Citas de un día concreto, para el calendario. */
export function useCitasDelDia(fecha: string) {
  return useQuery({
    queryKey: [...citasKeys.all, "dia", fecha],
    queryFn: () => citasApi.porFecha(fecha),
    staleTime: 30 * 1000,
  });
}
