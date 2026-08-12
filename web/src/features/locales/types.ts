export interface Local {
  id: number;
  nombre: string;
  direccion: string | null;
  /** Se muestra en la página pública de reservas. */
  descripcion_publica: string | null;
  telefono: string | null;
  email: string | null;
  /** Coordenadas para el mapa de la página pública. */
  latitud: number | null;
  longitud: number | null;
  color: string;
  /** Horario de atención del local: un solo rango, no por día. */
  horario_desde: string | null; // "09:00"
  horario_hasta: string | null; // "22:30"
  banner_url: string | null;
  logo_url: string | null;
  /**
   * El local principal es el del negocio: no se elimina y sus datos se editan
   * desde Configuración, no desde aquí.
   */
  es_principal: boolean;
}

/**
 * Fila de la tabla pivote `local_profesional`: cómo trabaja un profesional
 * **en un local concreto**.
 *
 * El listado devuelve una fila por cada profesional del negocio, tenga o no
 * fila en la pivote. Si no la tiene, llega `habilitado: false` y el resto en
 * null (es lo que hace `RecursoController::index`).
 */
export interface LocalProfesional {
  /** Id del profesional (`users.id`), no de la fila pivote. */
  id: number;
  nombre: string;
  foto_url: string | null;
  habilitado: boolean;
  /** Cómo aparece en la página pública, si difiere de su nombre real. */
  nombre_publico: string | null;
  /** Biografía para la página pública. */
  perfil: string | null;
  /** Rango de atención en este local. Un solo tramo, no por día. */
  horario_apertura: string | null; // "09:00"
  horario_cierre: string | null; // "18:00"
}

export interface LocalProfesionalPayload {
  habilitado: boolean;
  nombre_publico: string | null;
  perfil: string | null;
  horario_apertura: string | null;
  horario_cierre: string | null;
}

/** Agrupación libre de locales, profesionales y servicios. */
export interface Grupo {
  id: number;
  nombre: string;
  locales: { id: number; nombre: string }[];
  profesionales: { id: number; nombre: string }[];
  servicios: { id: number; nombre: string }[];
}

export interface GrupoPayload {
  nombre: string;
  locales: number[];
  profesionales: number[];
  servicios: number[];
}

export interface LocalPayload {
  nombre: string;
  direccion: string | null;
  descripcion_publica: string | null;
  telefono: string | null;
  email: string | null;
  latitud: number | null;
  longitud: number | null;
  color: string;
  horario_desde: string | null;
  horario_hasta: string | null;
  banner: File | null;
  logo: File | null;
}
