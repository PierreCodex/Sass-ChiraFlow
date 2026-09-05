import { api } from "@/lib/api/client";
import { usarMocksPara } from "@/lib/api/mocks";
import { delay } from "@/lib/mock-utils";
import { MODULOS, type Capacidades } from "../types";

/**
 * Con mocks, todo abierto.
 *
 * Es lo correcto mientras no hay backend: un panel de desarrollo con módulos
 * escondidos por una matriz inventada haría perder tiempo buscando pantallas
 * que sí existen. La restricción de verdad la trae el servidor.
 */
const capacidadesMock: Capacidades = {
  permisos: Object.fromEntries(MODULOS.map((m) => [m, "gestionar"])),
  solo_propios: false,
  locales: null,
};

export const capacidadesApi = {
  obtener: async (): Promise<Capacidades> => {
    if (usarMocksPara("capacidades")) {
      await delay(100);
      return capacidadesMock;
    }
    const { data } = await api.get<{ data: Capacidades }>("/capacidades");
    return data.data;
  },
};
