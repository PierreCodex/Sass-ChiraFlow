import { useQuery } from "@tanstack/react-query";
import { crearHooksRecurso } from "@/lib/query/recurso-hooks";
import type { Empleado, EmpleadoPayload } from "../types";
import { empleadosApi } from "../services/empleados.api";

export const {
  keys: empleadosKeys,
  useLista: useEmpleados,
  useTodos: useTodosLosEmpleados,
  useDetalle: useEmpleado,
  useCrear: useCrearEmpleado,
  useActualizar: useActualizarEmpleado,
  useEliminar: useEliminarEmpleado,
} = crearHooksRecurso<Empleado, EmpleadoPayload>("empleados", empleadosApi, {
  singular: "Empleado",
});

/** Cupo de profesionales del plan contratado. */
export function useResumenPlanEmpleados() {
  return useQuery({
    queryKey: [...empleadosKeys.all, "resumen-plan"],
    queryFn: empleadosApi.resumenPlan,
  });
}
