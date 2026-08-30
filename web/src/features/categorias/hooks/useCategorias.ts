import { crearHooksRecurso } from "@/lib/query/recurso-hooks";
import type { Categoria, CategoriaPayload } from "../types";
import { categoriasApi } from "../services/categorias.api";

export const {
  keys: categoriasKeys,
  useLista: useCategorias,
  useTodos: useTodasLasCategorias,
  useDetalle: useCategoria,
  useCrear: useCrearCategoria,
  useActualizar: useActualizarCategoria,
  useEliminar: useEliminarCategoria,
} = crearHooksRecurso<Categoria, CategoriaPayload>("categorias", categoriasApi, {
  singular: "Categoría",
  femenino: true,
});
