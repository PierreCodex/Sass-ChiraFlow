import { usarMocksPara } from "@/lib/api/mocks";
import { api } from "@/lib/api/client";
import { delay } from "@/lib/mock-utils";
import { almacenComprobantes } from "../mocks";
import { totalLineas, type Comprobante, type NuevoComprobante } from "../types";

const SERIE = "NV01";

/**
 * API de comprobantes.
 *
 * ⚠️ **Prototipo**: ninguna de estas rutas existe en Laravel ni en
 * `api-contract.md`. Mientras `comprobantes` no esté en
 * `NEXT_PUBLIC_MODULOS_CONECTADOS`, todo responde desde `localStorage`.
 */
export const comprobantesApi = {
  /** Los más recientes primero. */
  listar: async (): Promise<Comprobante[]> => {
    if (usarMocksPara("comprobantes")) {
      await delay(250);
      return [...almacenComprobantes.lista()].sort((a, b) => b.numero - a.numero);
    }
    const { data } = await api.get<{ data: Comprobante[] }>("/comprobantes");
    return data.data;
  },

  /**
   * El total lo calcula quien emite, nunca el que llama: en el backend real
   * se recalcula igual desde las líneas.
   */
  emitir: async (nuevo: NuevoComprobante): Promise<Comprobante> => {
    if (usarMocksPara("comprobantes")) {
      await delay(500);
      const lista = almacenComprobantes.lista();

      if (
        nuevo.reserva_codigo &&
        lista.some(
          (item) => item.reserva_codigo === nuevo.reserva_codigo && item.estado === "emitido"
        )
      ) {
        throw new Error("Esa reserva ya tiene un comprobante emitido.");
      }

      const ultimo = lista.reduce((max, item) => Math.max(max, item.numero), 0);
      const comprobante: Comprobante = {
        ...nuevo,
        id: Date.now(),
        serie: SERIE,
        numero: ultimo + 1,
        emitido_en: new Date().toISOString(),
        estado: "emitido",
        motivo_anulacion: null,
        total: totalLineas(nuevo.lineas),
      };
      almacenComprobantes.guardarLista([comprobante, ...lista]);
      almacenComprobantes.guardarRuc(nuevo.emisor.ruc);
      return comprobante;
    }
    const { data } = await api.post<{ data: Comprobante }>("/comprobantes", nuevo);
    return data.data;
  },

  /** Anular no borra: el número queda usado y el comprobante, marcado. */
  anular: async (id: number, motivo: string): Promise<Comprobante> => {
    if (usarMocksPara("comprobantes")) {
      await delay(400);
      const lista = almacenComprobantes.lista();
      const actual = lista.find((item) => item.id === id);
      if (!actual) throw new Error("No encontramos ese comprobante.");
      const anulado: Comprobante = {
        ...actual,
        estado: "anulado",
        motivo_anulacion: motivo,
      };
      almacenComprobantes.guardarLista(
        lista.map((item) => (item.id === id ? anulado : item))
      );
      return anulado;
    }
    const { data } = await api.post<{ data: Comprobante }>(
      `/comprobantes/${id}/anular`,
      { motivo }
    );
    return data.data;
  },

  /** El RUC con el que se emitió la última vez, para no volver a pedirlo. */
  rucRecordado: (): string | null => almacenComprobantes.ruc(),
};
