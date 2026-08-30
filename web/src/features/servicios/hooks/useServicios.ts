import { crearHooksRecurso } from "@/lib/query/recurso-hooks";
import type { Servicio, ServicioPayload } from "../types";
import { serviciosApi } from "../services/servicios.api";

export const {
  keys: serviciosKeys,
  useLista: useServicios,
  useTodos: useTodosLosServicios,
  useDetalle: useServicio,
  useCrear: useCrearServicio,
  useActualizar: useActualizarServicio,
  useEliminar: useEliminarServicio,
} = crearHooksRecurso<Servicio, ServicioPayload>("servicios", serviciosApi, {
  singular: "Servicio",
});
