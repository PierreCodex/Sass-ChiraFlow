import { useMutation, useQueryClient } from "@tanstack/react-query";
import { crearHooksRecurso } from "@/lib/query/recurso-hooks";
import type { MovimientoPayload, Producto, ProductoPayload } from "../types";
import { productosApi } from "../services/inventario.api";

export const {
  keys: productosKeys,
  useLista: useProductos,
  useTodos: useTodosLosProductos,
  useDetalle: useProducto,
  useCrear: useCrearProducto,
  useActualizar: useActualizarProducto,
  useEliminar: useEliminarProducto,
} = crearHooksRecurso<Producto, ProductoPayload>("productos", productosApi);

/** Entrada o salida de stock de un producto. */
export function useRegistrarMovimiento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productoId,
      payload,
    }: {
      productoId: number;
      payload: MovimientoPayload;
    }) => productosApi.movimiento(productoId, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: productosKeys.all }),
  });
}
