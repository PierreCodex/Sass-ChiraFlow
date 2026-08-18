import { crearRecurso } from "@/lib/api/recurso";
import { ticketsSuperadminMock } from "../mocks";
import type { TicketSuperadmin } from "../types";

/**
 * Espejo de `SuperAdmin\SoporteController`: el superadmin ve tickets de
 * todos los negocios y solo los actualiza (respuesta + estado) — no crea ni
 * borra, igual que el Blade real.
 */
export const soporteSuperadminApi = crearRecurso<TicketSuperadmin>({
  path: "superadmin/soporte",
  mocks: ticketsSuperadminMock,
  camposBusqueda: ["negocio", "asunto"],
});
