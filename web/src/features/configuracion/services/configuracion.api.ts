import { usarMocksPara } from "@/lib/api/mocks";
import { api } from "@/lib/api/client";
import { delay } from "@/lib/mock-utils";
import { configuracionMock } from "../mocks";
import type { Configuracion } from "../types";

let memoria: Configuracion = configuracionMock;

export const configuracionApi = {
  obtener: async (): Promise<Configuracion> => {
    if (usarMocksPara("configuracion")) {
      await delay(150);
      return memoria;
    }
    const { data } = await api.get<{ data: Configuracion }>("/configuracion");
    return data.data;
  },

  guardar: async (payload: Configuracion): Promise<Configuracion> => {
    if (usarMocksPara("configuracion")) {
      await delay();
      memoria = payload;
      return memoria;
    }
    const { data } = await api.put<{ data: Configuracion }>(
      "/configuracion",
      payload
    );
    return data.data;
  },
};
