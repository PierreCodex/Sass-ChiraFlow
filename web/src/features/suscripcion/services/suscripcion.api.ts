import { usarMocksPara } from "@/lib/api/mocks";
import { api } from "@/lib/api/client";
import { delay } from "@/lib/mock-utils";
import type { Plan, SolicitudPlanPayload, Suscripcion } from "../types";
import { almacenPlataforma } from "@/features/plataforma/mocks";
import { planesMock, suscripcionMock } from "../mocks";

// Copia mutable: los extras contratados cambian dentro de la sesión.
let suscripcion: Suscripcion = { ...suscripcionMock };

/*
 * Prototipo: la landing y «Mi plan» leen los planes que edita el super admin
 * en `/plataforma/planes`, no una copia propia. Así un plan creado o
 * cambiado allí se ve aquí. Solo los que «se ofrecen» y no son gratis (la
 * Prueba no se compra). Los precios de los extras no los edita el super
 * admin: salen del mock de siempre, o los de por defecto en un plan nuevo.
 */
function planesDePlataforma(): Plan[] {
  return almacenPlataforma
    .leer()
    .planes.filter((plan) => plan.activo && plan.precio_mensual > 0)
    .map((plan) => {
      const extras = planesMock.find((mock) => mock.slug === plan.slug);
      return {
        id: plan.id,
        nombre: plan.nombre,
        slug: plan.slug,
        descripcion: plan.descripcion,
        precio_mensual: plan.precio_mensual,
        precio_anual: plan.precio_anual ?? plan.precio_mensual * 10,
        precio_promo: plan.precio_promo,
        promo_duracion_meses: plan.promo_duracion_meses,
        promo_activa: plan.promo_activa,
        max_profesionales: plan.max_profesionales,
        max_sucursales: plan.max_sucursales,
        max_whatsapp_mes: plan.max_whatsapp_mes,
        precio_profesional_extra: extras?.precio_profesional_extra ?? 11,
        precio_whatsapp_extra: extras?.precio_whatsapp_extra ?? 17,
        mensajes_whatsapp_extra: extras?.mensajes_whatsapp_extra ?? 50,
        destacado: plan.destacado,
        features: plan.features,
      };
    });
}

export const suscripcionApi = {
  /** Estado de la suscripción del tenant actual. */
  actual: async (): Promise<Suscripcion> => {
    if (usarMocksPara("suscripcion")) {
      await delay(200);
      return suscripcion;
    }
    const { data } = await api.get<{ data: Suscripcion }>("/suscripcion");
    return data.data;
  },

  /** Planes disponibles, ordenados por precio como en Laravel. */
  planes: async (): Promise<Plan[]> => {
    if (usarMocksPara("suscripcion")) {
      await delay(250);
      return planesDePlataforma().sort((a, b) => a.precio_mensual - b.precio_mensual);
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
    if (usarMocksPara("suscripcion")) {
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
