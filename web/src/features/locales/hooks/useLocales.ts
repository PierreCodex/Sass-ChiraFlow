import { crearHooksRecurso } from "@/lib/query/recurso-hooks";
import type { Local, LocalPayload } from "../types";
import { localesApi } from "../services/locales.api";

export const {
  keys: localesKeys,
  useLista: useLocales,
  useTodos: useTodosLosLocales,
  useDetalle: useLocal,
  useCrear: useCrearLocal,
  useActualizar: useActualizarLocal,
  useEliminar: useEliminarLocal,
} = crearHooksRecurso<Local, LocalPayload>("locales", localesApi, {
  singular: "Local",
});
