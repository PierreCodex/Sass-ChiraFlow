import { crearHooksRecurso } from "@/lib/query/recurso-hooks";
import { soporteSuperadminApi } from "../services/soporte.api";
import type { TicketSuperadmin } from "../types";

export const {
  keys: soporteSuperadminKeys,
  useLista: useTicketsSuperadmin,
  useActualizar: useResponderTicket,
} = crearHooksRecurso<TicketSuperadmin>("superadmin-soporte", soporteSuperadminApi);
