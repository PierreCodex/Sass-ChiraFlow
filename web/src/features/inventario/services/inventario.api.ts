import { api } from "@/lib/api/client";
import { env } from "@/config/env";
import { delay } from "@/lib/mock-utils";
import { crearRecurso } from "@/lib/api/recurso";
import type { MovimientoPayload, Producto, ProductoPayload } from "../types";
import { productosMock } from "../mocks";

const recurso = crearRecurso<Producto, ProductoPayload>({
  path: "inventario",
  mocks: productosMock,
  camposBusqueda: ["nombre", "descripcion"],
  valoresPorDefecto: { activo: true },
});

export const productosApi = {
  ...recurso,

  /**
   * Registra una entrada o salida de stock.
   *
   * El backend recalcula `producto.stock` (`InventarioController::movimiento`),
   * así que aquí solo se envía tipo, cantidad y motivo.
   */
  movimiento: async (
    productoId: number,
    payload: MovimientoPayload
  ): Promise<Producto> => {
    if (env.usarMocks) {
      await delay();
      const producto = recurso
        .mockItems()
        .find((p) => p.id === productoId);
      if (!producto) throw new Error("Producto no encontrado");

      const delta =
        payload.tipo === "entrada" ? payload.cantidad : -payload.cantidad;
      return recurso.update(productoId, {
        stock: Math.max(0, producto.stock + delta),
      } as Partial<ProductoPayload>);
    }

    const { data } = await api.post<{ data: Producto }>(
      `/inventario/${productoId}/movimiento`,
      payload
    );
    return data.data;
  },
};
