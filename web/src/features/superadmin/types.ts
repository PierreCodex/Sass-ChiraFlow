import type { EstadoTicket, PrioridadTicket } from "@/features/soporte/types";
import type { VentaDia } from "@/features/dashboard/types";

/** Estado de un negocio/tenant, tal como lo maneja `Negocio::estado` en Laravel. */
export type EstadoNegocio = "prueba" | "activa" | "suspendida" | "cancelada";

/** Fila de "Negocios recientes" / resultado de listar negocios. */
export interface NegocioResumen {
  id: number;
  nombre: string;
  slug: string;
  plan: string | null;
  categoria: string | null;
  estado: EstadoNegocio;
  /** ISO "2026-08-18", o null si no tiene fecha de vencimiento próxima. */
  suscripcion_vence_el: string | null;
}

/** Respuesta de GET /superadmin/dashboard. Mismo shape que arma `DashboardController@index`. */
export interface ResumenSuperadmin {
  negocios_total: number;
  negocios_activos: number;
  negocios_suspendidos: number;
  negocios_prueba: number;
  ingresos_mes: number;
  tickets_abiertos: number;
  /** Ingresos de toda la plataforma día a día, para la gráfica del dashboard. */
  ingresos_ultimos_dias: VentaDia[];
  /** Negocios nuevos registrados por día, mismo rango que `ingresos_ultimos_dias`. */
  negocios_nuevos_ultimos_dias: VentaDia[];
  recientes: NegocioResumen[];
  vencen_pronto: NegocioResumen[];
}

/** Anuncio publicado por el superadmin a todos los negocios. */
export interface Anuncio {
  id: number;
  titulo: string;
  cuerpo: string;
  autor: string;
  creado_en: string; // ISO datetime
}

export interface AnuncioPayload {
  titulo: string;
  cuerpo: string;
}

/**
 * Igual que `Ticket` de `features/soporte/` (la vista del negocio), pero con
 * `negocio` — el superadmin ve tickets de todos los negocios a la vez.
 */
export interface TicketSuperadmin {
  id: number;
  negocio: string;
  asunto: string;
  prioridad: PrioridadTicket;
  estado: EstadoTicket;
  respuesta: string | null;
  respondido_por: string | null;
}
