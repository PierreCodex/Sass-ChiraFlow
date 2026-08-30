import { crearHooksRecurso } from "@/lib/query/recurso-hooks";
import type { Ticket, TicketPayload } from "../types";
import { ticketsApi } from "../services/soporte.api";

export const {
  keys: ticketsKeys,
  useLista: useTickets,
  useTodos: useTodosLosTickets,
  useDetalle: useTicket,
  useCrear: useCrearTicket,
} = crearHooksRecurso<Ticket, TicketPayload>("tickets", ticketsApi, {
  singular: "Ticket",
});
