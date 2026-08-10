import { crearHooksRecurso } from "@/lib/query/recurso-hooks";
import type { Producto } from "../types";
import { productosApi } from "../services/inventario.api";

export const {
  keys: productosKeys,
  useLista: useProductos,
  useTodos: useTodosLosProductos,
  useDetalle: useProducto,
  useCrear: useCrearProducto,
  useActualizar: useActualizarProducto,
  useEliminar: useEliminarProducto,
} = crearHooksRecurso<Producto>("productos", productosApi);
