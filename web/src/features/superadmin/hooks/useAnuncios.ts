import { crearHooksRecurso } from "@/lib/query/recurso-hooks";
import { anunciosApi } from "../services/anuncios.api";
import type { Anuncio, AnuncioPayload } from "../types";

export const {
  keys: anunciosKeys,
  useLista: useAnuncios,
  useCrear: useCrearAnuncio,
  useEliminar: useEliminarAnuncio,
} = crearHooksRecurso<Anuncio, AnuncioPayload>("superadmin-anuncios", anunciosApi);
