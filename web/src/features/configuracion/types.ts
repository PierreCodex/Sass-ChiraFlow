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
   * Es lo que forma su subdominio y su enlace público de reservas. **No se
   * edita aquí**: cambiarlo rompería todos los enlaces que el negocio ya
   * repartió.
   *
   * Es `null` mientras el negocio no tenga nombre. El registro lo deja sin
   * poner y nace la primera vez que se guarda uno, venga del onboarding o de
   * Configuración. Hasta entonces no hay enlace que repartir, y construirlo
   * igualmente daba `https://null.midominio.com`.
   */
  slug: string | null;
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

  /** Cómo se generan los huecos de reserva (ver `disponibilidad.ts`). */
  agenda: ConfiguracionAgenda;
}

/**
 * Lo que devuelve `GET /configuracion`: el negocio **y la lista de zonas**.
 *
 * `zonas_horarias` viaja FUERA de `data`, junto al recurso, con las 419 zonas
 * IANA. Es el mismo criterio que `modulos` en el listado de roles: la pantalla
 * necesita el valor y las opciones para pintar un select, y pedirlas aparte
 * serían dos peticiones para un campo.
 */
export interface RespuestaConfiguracion {
  configuracion: Configuracion;
  zonasHorarias: string[];
}

/**
 * Lo que viaja en el `PUT`. **Es un parche**: llega lo que llega y se toca solo
 * eso.
 *
 * La distinción que importa es entre **clave ausente** y **clave presente con
 * valor vacío**: la primera significa «no lo toques», la segunda sí escribe.
 * Así `sitio_publico_activo: false` se guarda y `email: ""` vacía el campo. Por
 * eso los campos son opcionales y no nullables a secas — `undefined` y `null`
 * significan cosas distintas, y `aFormData` ya omite el primero.
 *
 * `slug` no está: lo fija el paso 1 del onboarding y el backend lo ignora.
 */
export type ConfiguracionPayload = Partial<
  Omit<Configuracion, "slug" | "logo_url" | "cover_url">
> & {
  logo?: File | null;
  cover?: File | null;
  /** No mandar el archivo significa «déjalo como está»; esto lo quita. */
  logo_eliminar?: boolean;
  cover_eliminar?: boolean;
};

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
