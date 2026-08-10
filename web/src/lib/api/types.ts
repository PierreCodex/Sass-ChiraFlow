/** Tipos que devuelven las respuestas estándar de Laravel. */

/** Respuesta de un API Resource simple: { data: T } */
export interface ApiResource<T> {
  data: T;
}

/** Respuesta de ->paginate() envuelto en un ResourceCollection. */
export interface Paginated<T> {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    path: string;
    per_page: number;
    to: number | null;
    total: number;
  };
}

/** Parámetros de listado que comparten casi todos los índices. */
export interface ListParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort?: string;
}
