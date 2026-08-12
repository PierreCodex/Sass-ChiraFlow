export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  /** Se muestra como círculo cuando la categoría no tiene imagen. */
  color: string | null;
  /** Posición en el listado. Menor número, más arriba. */
  orden: number;
  imagen_url: string | null;
  /** Cuántos servicios la usan (`withCount`). */
  servicios_count: number;
}

export interface CategoriaPayload {
  nombre: string;
  descripcion: string | null;
  color: string | null;
  orden: number;
  imagen: File | null;
}
