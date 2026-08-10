/**
 * Cómo se generan los huecos de reserva de cada profesional.
 *
 * - `duracion_servicio`: los inicios se encadenan con la duración del servicio
 *   elegido (09:00, 09:45, 10:30… para un servicio de 45 min). Agenda compacta,
 *   sin huecos muertos.
 * - `fijo`: rejilla cada N minutos, independientemente del servicio. Más
 *   flexible para el cliente, pero fragmenta la agenda.
 */
export type ModoIntervalo = "duracion_servicio" | "fijo";

export interface ConfiguracionAgenda {
  modo_intervalo: ModoIntervalo;
  /** Solo aplica con `modo_intervalo: "fijo"`. */
  intervalo_min: number;
}

/**
 * Ajustes del negocio. Por ahora solo los de agenda, que son los que necesita
 * el cálculo de huecos. El resto se añadirá al maquetar Configuración.
 */
export interface Configuracion {
  agenda: ConfiguracionAgenda;
}
