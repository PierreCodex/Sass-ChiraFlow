import { useQuery } from "@tanstack/react-query";
import { crearHooksRecurso } from "@/lib/query/recurso-hooks";
import type { Profesional, ProfesionalPayload } from "../types";
import { profesionalesApi } from "../services/profesionales.api";

export const {
  keys: profesionalesKeys,
  useLista: useProfesionales,
  useTodos: useTodosLosProfesionales,
  useDetalle: useProfesional,
  useCrear: useCrearProfesional,
  useActualizar: useActualizarProfesional,
  useEliminar: useEliminarProfesional,
} = crearHooksRecurso<Profesional, ProfesionalPayload>(
  "profesionales",
  profesionalesApi,
  { singular: "Profesional" }
);

/** Cupo de profesionales del plan contratado. */
export function useResumenPlanProfesionales() {
  return useQuery({
    queryKey: [...profesionalesKeys.all, "resumen-plan"],
    queryFn: profesionalesApi.resumenPlan,
  });
}
