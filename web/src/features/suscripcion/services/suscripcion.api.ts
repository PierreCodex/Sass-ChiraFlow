import { api } from "@/lib/api/client";
import { env } from "@/config/env";
import { delay } from "@/lib/mock-utils";
import type { Plan, Suscripcion } from "../types";

const suscripcionMock: Suscripcion = {
  estado: "prueba",
  plan: null,
  dias_restantes: 5,
  renueva_el: null,
};

const planesMock: Plan[] = [
  { id: 1, nombre: "Básico", precio: 49, periodo: "mensual" },
  { id: 2, nombre: "Profesional", precio: 89, periodo: "mensual" },
  { id: 3, nombre: "Empresarial", precio: 149, periodo: "mensual" },
];

export const suscripcionApi = {
  /** Estado de la suscripción del tenant actual. */
  actual: async (): Promise<Suscripcion> => {
    if (env.usarMocks) {
      await delay(200);
      return suscripcionMock;
    }
    const { data } = await api.get<{ data: Suscripcion }>("/suscripcion");
    return data.data;
  },

  /** Planes disponibles para la pantalla "Mi Plan". */
  planes: async (): Promise<Plan[]> => {
    if (env.usarMocks) {
      await delay(200);
      return planesMock;
    }
    const { data } = await api.get<{ data: Plan[] }>("/planes");
    return data.data;
  },
};
