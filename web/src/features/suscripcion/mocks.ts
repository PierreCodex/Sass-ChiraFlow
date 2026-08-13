import type { Plan, Suscripcion } from "./types";

/**
 * Los tres planes reales, con los valores de la última migración de datos
 * (`2026_08_09_212457_add_promociones_a_planes`).
 *
 * Las descripciones no están en la BD: el Blade las decide por slug.
 */

const FEATURES_BASICO = [
  "agenda",
  "agenda_online",
  "gestion_clientes",
  "recordatorios",
  "notificaciones_alertas",
  "dashboard_stats",
  "caja",
  "inventario",
  "whatsapp",
  "sitio_publico",
  "subdominio",
];

const FEATURES_PREMIUM = [
  ...FEATURES_BASICO,
  "multi_sede",
  "encuesta_satisfaccion",
  "ficha_personal",
  "giftcard",
  "presupuestos",
  "historial_producto",
  "soporte_prioritario",
];

const FEATURES_PRO = [
  ...FEATURES_PREMIUM,
  "dominio_personalizado",
  "reportes_avanzados",
  "exportaciones",
  "backups",
  "api",
  "soporte_telefonico",
  "asesoria_personalizada",
];

export const planesMock: Plan[] = [
  {
    id: 1,
    nombre: "Básico",
    slug: "basico",
    descripcion: "Toma el control de tu negocio",
    precio_mensual: 99,
    precio_anual: 990,
    precio_promo: 9,
    promo_duracion_meses: 3,
    promo_activa: true,
    max_profesionales: 2,
    max_sucursales: 1,
    max_whatsapp_mes: 0,
    precio_profesional_extra: 11,
    precio_whatsapp_extra: 17,
    mensajes_whatsapp_extra: 50,
    destacado: false,
    features: FEATURES_BASICO,
  },
  {
    id: 2,
    nombre: "Premium",
    slug: "premium",
    descripcion:
      "Más seguimiento, mejor atención, mayor control, personalización de tu sitio",
    precio_mensual: 149,
    precio_anual: 1490,
    precio_promo: 9,
    promo_duracion_meses: 3,
    promo_activa: true,
    max_profesionales: 5,
    max_sucursales: 999,
    max_whatsapp_mes: 100,
    precio_profesional_extra: 11,
    precio_whatsapp_extra: 17,
    mensajes_whatsapp_extra: 50,
    destacado: true,
    features: FEATURES_PREMIUM,
  },
  {
    id: 3,
    nombre: "Pro",
    slug: "pro",
    descripcion: "Integraciones y gestión avanzada",
    precio_mensual: 449,
    precio_anual: 4490,
    precio_promo: null,
    promo_duracion_meses: 3,
    promo_activa: false,
    max_profesionales: 15,
    max_sucursales: 999,
    max_whatsapp_mes: 500,
    precio_profesional_extra: 11,
    precio_whatsapp_extra: 17,
    mensajes_whatsapp_extra: 50,
    destacado: false,
    features: FEATURES_PRO,
  },
];

/** El negocio de la maqueta sigue en prueba, así que ve el precio promo. */
export const suscripcionMock: Suscripcion = {
  estado: "prueba",
  plan: null,
  dias_restantes: 5,
  renueva_el: null,
  extra_profesionales: 0,
  extra_whatsapp: 0,
  elegible_promo: true,
};
