import { crearRecurso } from "@/lib/api/recurso";
import type { Categoria, CategoriaPayload } from "../types";
import { categoriasMock } from "../mocks";

export const categoriasApi = crearRecurso<Categoria, CategoriaPayload>({
  path: "categorias-servicios",
  modulo: "categorias",
  mocks: categoriasMock,
  camposBusqueda: ["nombre", "descripcion"],
  // Sube imagen: no puede ir como JSON.
  enviarComoFormData: true,
  valoresPorDefecto: { servicios_count: 0, imagen_url: null },
  alGuardarMock: (payload: CategoriaPayload) => ({
    imagen_url: payload.imagen ? URL.createObjectURL(payload.imagen) : null,
  }),
});
