import { crearHooksRecurso } from "@/lib/query/recurso-hooks";
import { negociosApi } from "../services/negocios.api";
import type { NegocioResumen } from "../types";

export const {
  keys: negociosKeys,
  useLista: useNegocios,
  useDetalle: useNegocio,
  useActualizar: useActualizarNegocio,
} = crearHooksRecurso<NegocioResumen>("superadmin-negocios", negociosApi);
