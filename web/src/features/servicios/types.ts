/**
 * Solo tengo evidencia del valor "Normal". Pendiente confirmar la lista
 * completa — ver docs/vistas/servicios.md
 */
export type TipoServicio = "normal";

export interface Servicio {
  id: number;
  nombre: string;
  descripcion: string | null;
  /** Color identificador del servicio (el punto de la primera columna). */
  color: string;
  /** Puede no tener categoría: en la tabla se muestra "-". */
  categoria: { id: number; nombre: string } | null;
  tipo: TipoServicio;
  duracion_min: number;
  precio: number;
  activo: boolean;
  /** URL de la imagen principal. */
  imagen_principal: string | null;
  /** URLs de la galería de trabajos. Máximo 4. */
  galeria: string[];
  /** Profesionales que ofrecen este servicio. */
  empleados: { id: number; nombre: string }[];
}

export interface ServicioPayload {
  nombre: string;
  descripcion: string | null;
  color: string;
  categoria_id: number | null;
  tipo: TipoServicio;
  duracion_min: number;
  precio: number;
  /** Archivo nuevo, o null para no tocar la imagen actual. */
  imagen_principal: File | null;
  /** Archivos nuevos de la galería. */
  galeria: File[];
  /** URLs de la galería que se conservan (las que el usuario no quitó). */
  galeria_conservar: string[];
  empleado_ids: number[];
}

/** Máximo de imágenes de la galería, según la etiqueta del formulario. */
export const MAX_GALERIA = 4;
