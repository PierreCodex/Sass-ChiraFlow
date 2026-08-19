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
 * Horario de atención del negocio: el **respaldo** cuando un profesional no
 * tiene horario propio.
 */
export interface HorarioNegocio {
  apertura: string; // "09:00"
  cierre: string; // "20:00"
}

/**
 * Ajustes del negocio.
 *
 * Los nombres son los que valida `ConfiguracionController`. En Laravel la
 * mayoría son columnas de `negocios`; `horario_*` y `color_*` se guardan
 * además en el JSON `negocios.configuracion` (`horario.apertura`,
 * `marca.color_primario`…), pero eso lo resuelve el backend: aquí viajan
 * planos.
 */
export interface Configuracion {
  // --- Negocio ---
  nombre: string;
  /**
   * Identificador del negocio en la URL: `clinica-el-rosal`.
   *
   * Es lo que forma su subdominio y su enlace público de reservas. Se genera
   * al registrarse a partir del nombre y **no se edita aquí**: cambiarlo
   * rompería todos los enlaces que el negocio ya repartió.
   */
  slug: string;
  descripcion: string | null;
  email: string | null;
  telefono: string | null;
  whatsapp: string | null;
  direccion: string | null;
  informacion_adicional: string | null;
  latitud: number | null;
  longitud: number | null;
  zona_horaria: string | null;

  // --- Agenda ---
  horario_apertura: string | null;
  horario_cierre: string | null;

  // --- Marca ---
  color_primario: string | null;
  color_secundario: string | null;
  logo_url: string | null;
  cover_url: string | null;

  // --- Sitio público ---
  sitio_publico_activo: boolean;
  mostrar_en_marketplace: boolean;
  terminos_servicio: string | null;

  // --- Pagos QR ---
  /** Si está apagado, la tienda pública solo ofrece "Pagar en el local". */
  pago_qr_activo: boolean;
  /** QR de Yape/Plin/banco que sube el negocio. */
  pago_qr_url: string | null;
  /** Texto libre junto al QR en la tienda pública, ej. "JAIRO ISAEL - YAPE". */
  pago_qr_instrucciones: string | null;

  /**
   * Ajuste propio del panel: todavía **no existe en el backend**. Define cómo
   * se generan los huecos de reserva (ver `disponibilidad.ts`).
   */
  agenda: ConfiguracionAgenda;
}

/** Valores por defecto del controlador cuando el campo llega vacío. */
export const HORARIO_POR_DEFECTO: HorarioNegocio = {
  apertura: "09:00",
  cierre: "20:00",
};

/** Lee el horario del negocio en la forma que espera el cálculo de huecos. */
export function horarioNegocio(config?: Configuracion): HorarioNegocio {
  return {
    apertura: config?.horario_apertura || HORARIO_POR_DEFECTO.apertura,
    cierre: config?.horario_cierre || HORARIO_POR_DEFECTO.cierre,
  };
}
