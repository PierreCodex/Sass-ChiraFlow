import { crearRecurso } from "@/lib/api/recurso";
import type { Categoria } from "../types";
import { categoriasMock } from "../mocks";

export const categoriasApi = crearRecurso<Categoria>({
  path: "categorias",
  mocks: categoriasMock,
  camposBusqueda: ["nombre", "descripcion"],
});
