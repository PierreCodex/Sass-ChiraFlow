import { api } from "@/lib/api/client";
import { env } from "@/config/env";
import { delay } from "@/lib/mock-utils";
import type { Plan, SolicitudPlanPayload, Suscripcion } from "../types";
import { planesMock, suscripcionMock } from "../mocks";

// Copia mutable: los extras contratados cambian dentro de la sesión.
let suscripcion: Suscripcion = { ...suscripcionMock };

export const suscripcionApi = {
  /** Estado de la suscripción del tenant actual. */
  actual: async (): Promise<Suscripcion> => {
    if (env.usarMocks) {
      await delay(200);
      return suscripcion;
    }
    const { data } = await api.get<{ data: Suscripcion }>("/suscripcion");
    return data.data;
  },

  /** Planes disponibles, ordenados por precio como en Laravel. */
  planes: async (): Promise<Plan[]> => {
    if (env.usarMocks) {
      await delay(250);
      return [...planesMock].sort(
        (a, b) => a.precio_mensual - b.precio_mensual
      );
    }
    const { data } = await api.get<{ data: Plan[] }>("/planes");
    return data.data;
  },

  /**
   * Pide el cambio de plan.
   *
   * ⚠️ **No cobra nada.** `PlanController::solicitar` solo abre un ticket de
   * soporte con el desglose para que el equipo contacte al negocio. Ver
   * `docs/vistas/mi-plan.md`.
   */
  solicitar: async (payload: SolicitudPlanPayload): Promise<void> => {
    if (env.usarMocks) {
      await delay(600);
      suscripcion = {
        ...suscripcion,
        extra_profesionales: payload.extra_profesionales,
        extra_whatsapp: payload.extra_whatsapp,
      };
      return;
    }
    await api.post(`/plan/${payload.plan_id}/solicitar`, {
      extra_profesionales: payload.extra_profesionales,
      extra_whatsapp: payload.extra_whatsapp,
    });
  },
};
