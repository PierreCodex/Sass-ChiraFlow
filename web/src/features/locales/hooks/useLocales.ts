import { crearHooksRecurso } from "@/lib/query/recurso-hooks";
import type { Local } from "../types";
import { localesApi } from "../services/locales.api";

export const {
  keys: localesKeys,
  useLista: useLocales,
  useTodos: useTodosLosLocales,
  useDetalle: useLocal,
  useCrear: useCrearLocal,
  useActualizar: useActualizarLocal,
  useEliminar: useEliminarLocal,
} = crearHooksRecurso<Local>("locales", localesApi);
