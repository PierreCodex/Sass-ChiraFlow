import { crearRecurso } from "@/lib/api/recurso";
import type { Local } from "../types";
import { localesMock } from "../mocks";

export const localesApi = crearRecurso<Local>({
  path: "locales",
  mocks: localesMock,
  camposBusqueda: ["nombre", "direccion"],
});
