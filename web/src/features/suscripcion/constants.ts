/**
 * Etiquetas de cada `feature` de un plan.
 *
 * Copiadas tal cual del array `$featureLabels` de
 * `resources/views/admin/plan/index.blade.php`.
 *
 * Viven en el frontend a propósito: son texto de marketing, no datos. El
 * backend solo guarda las claves.
 */
export const ETIQUETAS_FEATURE: Record<string, string> = {
  agenda: "Agenda",
  agenda_online: "Agenda online de citas",
  gestion_clientes: "Gestión de clientes",
  recordatorios: "Recordatorios automáticos por correo",
  notificaciones_alertas: "Notificaciones y alertas diarias",
  dashboard_stats: "Panel de control",
  caja: "Caja e ingresos",
  inventario: "Inventario básico",
  sitio_publico: "Sitio web público",
  subdominio: "Subdominio personalizado",
  multi_sede: "Múltiples locaciones",
  whatsapp: "Recordatorios por WhatsApp",
  encuesta_satisfaccion: "Encuesta de satisfacción",
  ficha_personal: "Ficha personal",
  giftcard: "Gift cards",
  presupuestos: "Presupuestos",
  historial_producto: "Historial de producto",
  soporte_prioritario: "Soporte prioritario",
  dominio_personalizado: "Dominio propio",
  reportes_avanzados: "Reportes avanzados",
  exportaciones: "Exportar datos",
  backups: "Backups automáticos",
  api: "Acceso a API",
  soporte_telefonico: "Soporte personalizado por teléfono",
  asesoria_personalizada: "Asesoría personalizada",
};

/** Igual que el fallback del Blade: "multi_sede" -> "Multi sede". */
export function etiquetaFeature(clave: string) {
  return (
    ETIQUETAS_FEATURE[clave] ??
    clave.replace(/_/g, " ").replace(/^\w/, (letra) => letra.toUpperCase())
  );
}

/** Tope de la validación de `PlanController::extras`. */
export const MAX_EXTRAS = 100;
