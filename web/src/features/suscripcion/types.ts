export type EstadoSuscripcion = "prueba" | "activa" | "vencida" | "cancelada";

/**
 * Fila de la tabla `planes`.
 *
 * `max_sucursales` usa **999 como "ilimitadas"**, no null. Es un valor
 * centinela del backend; la UI lo traduce.
 */
export interface Plan {
  id: number;
  nombre: string;
  slug: string;
  /** Texto comercial. No está en la BD: lo pone el Blade según el slug. */
  descripcion: string;
  precio_mensual: number;
  precio_anual: number;
  /** Precio de lanzamiento, null si el plan no tiene promo. */
  precio_promo: number | null;
  promo_duracion_meses: number;
  promo_activa: boolean;
  max_profesionales: number;
  max_sucursales: number;
  max_whatsapp_mes: number;
  precio_profesional_extra: number;
  /** Precio de UN paquete de `mensajes_whatsapp_extra` mensajes. */
  precio_whatsapp_extra: number;
  mensajes_whatsapp_extra: number;
  /** Marca "Popular" en la tarjeta. */
  destacado: boolean;
  /** Claves de funcionalidad; las etiquetas están en `constants.ts`. */
  features: string[];
}

/** Respuesta de GET /api/suscripcion */
export interface Suscripcion {
  estado: EstadoSuscripcion;
  plan: Pick<Plan, "id" | "nombre" | "slug"> | null;
  /** Días que faltan para que termine la prueba o el periodo pagado. */
  dias_restantes: number;
  renueva_el: string | null;
  /** Extras ya contratados, guardados en `negocios`. */
  extra_profesionales: number;
  extra_whatsapp: number;
  /**
   * Si el negocio puede acceder al precio promocional.
   * En Laravel es `Negocio::elegiblePromo()`: hoy, solo estando en prueba.
   */
  elegible_promo: boolean;
}

export interface SolicitudPlanPayload {
  plan_id: number;
  extra_profesionales: number;
  extra_whatsapp: number;
}

/** Precio que se le cobra al negocio por este plan, promo incluida. */
export function precioAplicado(plan: Plan, elegiblePromo: boolean) {
  const conPromo =
    elegiblePromo && plan.promo_activa && plan.precio_promo !== null;
  return {
    conPromo,
    precio: conPromo ? plan.precio_promo! : plan.precio_mensual,
  };
}

/** 999 es el centinela de "ilimitadas" en `max_sucursales`. */
export function esIlimitado(valor: number) {
  return valor >= 999;
}
