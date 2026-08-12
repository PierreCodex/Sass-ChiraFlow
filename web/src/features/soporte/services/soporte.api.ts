import { crearRecurso } from "@/lib/api/recurso";
import type { Ticket, TicketPayload } from "../types";
import { ticketsMock } from "../mocks";

/**
 * Tickets del negocio.
 *
 * El negocio solo **lista y crea**: responder, cambiar el estado o asignar un
 * agente es cosa del panel de soporte, que es otra aplicación
 * (`SuperAdmin/SoporteController`). Por eso aquí no se usan `update` ni
 * `remove` aunque la fábrica los genere.
 */
const recurso = crearRecurso<Ticket, TicketPayload>({
  path: "soporte/tickets",
  mocks: ticketsMock,
  camposBusqueda: ["asunto", "mensaje"],
  // Las cajas de conteo de arriba filtran por estado.
  filtrosMock: (ticket, params) =>
    !params.estado || ticket.estado === params.estado,
  // Lo que el backend rellena solo al crear el ticket.
  valoresPorDefecto: {
    estado: "abierto",
    respuesta: null,
    respondido_por: null,
    autor: "Ana Torres",
  },
  alGuardarMock: () => {
    const ahora = new Date().toISOString();
    return { creado_en: ahora, actualizado_en: ahora };
  },
});

export const ticketsApi = recurso;
