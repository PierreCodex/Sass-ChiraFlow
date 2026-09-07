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

/**
 * Lo que viaja al `PUT` del pivote. **Es un parche**: llega lo que llega y se
 * toca solo eso.
 *
 * Aquí importa más que en ningún otro sitio del panel: el interruptor de
 * «habilitado» guarda al momento y manda su campo casi solo. Si el resto se
 * interpretara como vacío, encender a alguien le borraría el nombre público y
 * el perfil que el negocio escribió a mano.
 *
 * Por eso los campos son opcionales y no nullables a secas: `undefined` es «no
 * lo toques» y `null` es «bórralo», y son cosas distintas.
 */
export interface LocalProfesionalPayload {
  habilitado?: boolean;
  nombre_publico?: string | null;
  perfil?: string | null;
  horario_apertura?: string | null;
  horario_cierre?: string | null;
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
  /**
   * No mandar el archivo significa «déjalo como está», así que quitarlo
   * necesita bandera propia. Misma convención que categorías, servicios y la
   * configuración del negocio.
   */
  banner_eliminar?: boolean;
  logo_eliminar?: boolean;
}

/*
 * `es_principal` NO está en el payload, y es a propósito: lo decide el
 * backend, que hace principal al primer local que se crea. Si lo eligiera el
 * formulario, un negocio podría quedarse sin ninguno en dos peticiones — y el
 * principal es del que cuelga la tienda pública y el único que no se borra.
 * Sale resuelto en la respuesta solo para pintar el chip y esconder el botón.
 */
