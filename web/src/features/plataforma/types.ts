/**
 * Panel de plataforma: el super administrador que ve TODOS los negocios.
 *
 * ⚠️ **Prototipo de la Épica 8** (Stories 8.4 y 8.5). En el backend solo
 * existen las tablas `platform_admins` (vacía) y `planes`; no hay rutas ni
 * guard. Todo responde con mocks guardados en el navegador.
 */

export type EstadoNegocio = "prueba" | "activo" | "por_vencer" | "suspendido" | "cancelado";

/** Un plan tal como lo siembra `PlanSeeder` en la base central. */
export interface PlanPlataforma {
  id: number;
  slug: string;
  nombre: string;
  descripcion: string;
  precio_mensual: number;
  precio_anual: number | null;
  precio_promo: number | null;
  promo_duracion_meses: number;
  promo_activa: boolean;
  max_profesionales: number;
  /** 999 = sin límite. */
  max_sucursales: number;
  max_whatsapp_mes: number;
  destacado: boolean;
  features: string[];
  /** `false` = no se ofrece en la landing (el plan Prueba). */
  activo: boolean;
}

export interface NegocioPlataforma {
  /** El id aleatorio del tenant (`uptbej5u`), igual que en `tenants.id`. */
  id: string;
  nombre: string;
  slug: string;
  categoria: string;
  ciudad: string;
  plan_slug: string;
  estado: EstadoNegocio;
  /** YYYY-MM-DD */
  alta_el: string;
  vence_el: string;
  titular: { nombre: string; email: string; telefono: string };
  locales: number;
  profesionales: number;
  citas_mes: number;
  ultimo_acceso: string | null;
}

export type MetodoPagoSuscripcion = "yape" | "plin" | "transferencia" | "tarjeta" | "efectivo";

export interface PagoSuscripcion {
  id: number;
  negocio_id: string;
  negocio_nombre: string;
  plan_slug: string;
  monto: number;
  metodo: MetodoPagoSuscripcion;
  /** El mes que paga, «2026-10». */
  periodo: string;
  fecha: string; // YYYY-MM-DD
  confirmado: boolean;
  nota: string | null;
}

/** Lo que va quedando en la ficha: igual que `soporte_acciones` (8.4). */
export interface AccionPlataforma {
  id: number;
  negocio_id: string;
  fecha: string; // ISO
  autor: string;
  descripcion: string;
}

export interface ResumenPlataforma {
  negocios: number;
  activos: number;
  en_prueba: number;
  por_vencer: number;
  suspendidos: number;
  locales: number;
  profesionales: number;
  citas_mes: number;
  /** Ingreso mensual recurrente: la suma del precio de los planes que pagan. */
  ingreso_mensual: number;
  por_plan: { plan: PlanPlataforma; negocios: number }[];
}

export const ETIQUETA_ESTADO: Record<EstadoNegocio, string> = {
  prueba: "En prueba",
  activo: "Activo",
  por_vencer: "Por vencer",
  suspendido: "Suspendido",
  cancelado: "Cancelado",
};

export const COLOR_ESTADO: Record<
  EstadoNegocio,
  "info" | "success" | "warning" | "error" | "default"
> = {
  prueba: "info",
  activo: "success",
  por_vencer: "warning",
  suspendido: "error",
  cancelado: "default",
};

export const ETIQUETA_METODO: Record<MetodoPagoSuscripcion, string> = {
  yape: "Yape",
  plin: "Plin",
  transferencia: "Transferencia",
  tarjeta: "Tarjeta",
  efectivo: "Efectivo",
};

/** Las claves de `features` con un nombre legible. */
export const ETIQUETA_FEATURE: Record<string, string> = {
  agenda: "Agenda",
  agenda_online: "Agenda online",
  gestion_clientes: "Gestión de clientes",
  recordatorios: "Recordatorios",
  notificaciones_alertas: "Notificaciones",
  dashboard_stats: "Estadísticas",
  caja: "Caja",
  inventario: "Inventario",
  whatsapp: "WhatsApp",
  sitio_publico: "Sitio público",
  subdominio: "Subdominio propio",
  multi_sede: "Varias sedes",
  encuesta_satisfaccion: "Encuesta de satisfacción",
  ficha_personal: "Ficha personal",
  giftcard: "Gift cards",
  presupuestos: "Presupuestos",
  historial_producto: "Historial de productos",
  soporte_prioritario: "Soporte prioritario",
  dominio_personalizado: "Dominio personalizado",
  reportes_avanzados: "Reportes avanzados",
  exportaciones: "Exportaciones",
  backups: "Copias de seguridad",
  api: "API",
  soporte_telefonico: "Soporte telefónico",
  asesoria_personalizada: "Asesoría personalizada",
};

export function limite(valor: number) {
  return valor >= 999 ? "Ilimitadas" : String(valor);
}
