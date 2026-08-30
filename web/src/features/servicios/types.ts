/** Una foto de la galería tal como la emite el backend. */
export interface ImagenGaleria {
  id: number;
  url: string;
}

/** Valores reales de `servicios.tipo`. */
export type TipoServicio = "normal" | "sesiones" | "clases" | "paquete";

export interface Servicio {
  id: number;
  nombre: string;
  descripcion: string | null;
  /** Color identificador del servicio (el punto de la primera columna). */
  color: string;
  /** Puede no tener categoría: en la tabla se muestra "-". */
  categoria: { id: number; nombre: string } | null;
  tipo: TipoServicio;
  /** Solo para los tipos `sesiones` y `paquete`. */
  max_sesiones: number | null;
  duracion_min: number;
  precio: number;
  activo: boolean;
  /** URL de la imagen principal. */
  imagen_principal: string | null;
  /**
   * Galería de trabajos. Máximo 4.
   *
   * Objetos `{ id, url }` y no URLs sueltas: al editar, el formulario devuelve
   * los **ids** de las que conserva. Casar por URL obligaba al backend a
   * revertir URL → ruta, y eso se rompe en silencio si cambia `APP_URL` o el
   * disco — y lo que se pierde son las fotos del negocio.
   */
  galeria: ImagenGaleria[];
  /** Profesionales que ofrecen este servicio. */
  empleados: { id: number; nombre: string }[];
}

export interface ServicioPayload {
  nombre: string;
  descripcion: string | null;
  color: string;
  categoria_id: number | null;
  tipo: TipoServicio;
  max_sesiones: number | null;
  duracion_min: number;
  precio: number;
  /** Archivo nuevo, o null para no tocar la imagen actual. */
  imagen_principal: File | null;
  /** Archivos nuevos de la galería. */
  galeria: File[];
  /**
   * Ids de la galería que se conservan (las que el usuario no quitó).
   *
   * **Omitirlo no borra nada**: el backend solo limpia lo que falta en esta
   * lista si el campo viaja. Por eso el switch de la tabla puede guardar sin
   * mandarlo.
   */
  galeria_conservar: number[];
  empleado_ids: number[];
  /**
   * Lo cambia el switch de la tabla, no el formulario. El backend lo acepta
   * opcional en POST y PUT; al crear entra `true` por el default de la
   * columna.
   */
  activo?: boolean;
}

/** Máximo de imágenes de la galería, según la etiqueta del formulario. */
export const MAX_GALERIA = 4;
