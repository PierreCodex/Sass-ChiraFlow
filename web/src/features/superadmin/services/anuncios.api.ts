import { crearRecurso } from "@/lib/api/recurso";
import { anunciosMock } from "../mocks";
import type { Anuncio, AnuncioPayload } from "../types";

/** Espejo de `SuperAdmin\AnuncioController`: solo lista, crea y borra. */
export const anunciosApi = crearRecurso<Anuncio, AnuncioPayload>({
  path: "superadmin/anuncios",
  mocks: anunciosMock,
  camposBusqueda: ["titulo", "cuerpo"],
  valoresPorDefecto: { autor: "Super Administrador" },
  alGuardarMock: () => ({ creado_en: new Date().toISOString() }),
});
