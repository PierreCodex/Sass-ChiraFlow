import { crearRecurso } from "@/lib/api/recurso";
import type { Cliente, ClientePayload } from "../types";
import { clientesMock } from "../mocks";

export const clientesApi = crearRecurso<Cliente, ClientePayload>({
  path: "clientes",
  mocks: clientesMock,
  camposBusqueda: ["nombre", "telefono", "email"],
  // Los calcula el backend; en modo mock arrancan en cero.
  valoresPorDefecto: { total_citas: 0, ultima_cita: null },
});
