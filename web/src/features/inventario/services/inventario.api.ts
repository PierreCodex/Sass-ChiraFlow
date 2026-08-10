import { crearRecurso } from "@/lib/api/recurso";
import type { Producto } from "../types";
import { productosMock } from "../mocks";

export const productosApi = crearRecurso<Producto>({
  path: "productos",
  mocks: productosMock,
  camposBusqueda: ["nombre", "sku"],
});
