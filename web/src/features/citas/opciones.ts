import type { DiaHorario, ExcepcionHorario } from "@/features/profesionales/types";

/**
 * Las proyecciones de `GET /citas/opciones` (Story 1.7, ampliada en la 1.10).
 *
 * Es lo que el formulario de citas necesita de cada colección y nada más,
 * recortado por el alcance y los permisos de quien agenda. Los selectores
 * buscan aquí en vez de traer los índices completos.
 */

export interface OpcionProfesional {
  id: number;
  nombre: string;
  color: string | null;
  /** Lo que usa el cálculo de huecos. */
  horario: DiaHorario[];
  excepciones: ExcepcionHorario[];
  servicios: { id: number; nombre: string }[];
}

export interface OpcionServicio {
  id: number;
  nombre: string;
  duracion_min: number;
  precio: number;
}

export interface OpcionLocal {
  id: number;
  nombre: string;
  es_principal: boolean;
}

export interface OpcionProducto {
  id: number;
  nombre: string;
  precio_venta: number;
  stock: number;
}

export interface OpcionCliente {
  id: number;
  nombre: string;
  telefono: string | null;
  email: string | null;
}

export interface OpcionesPorColeccion {
  profesionales: OpcionProfesional;
  servicios: OpcionServicio;
  locales: OpcionLocal;
  productos: OpcionProducto;
  clientes: OpcionCliente;
}

export type ColeccionOpciones = keyof OpcionesPorColeccion;

export interface PaginaOpciones<T> {
  data: T[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

/** Qué pedir de una colección: un texto a buscar o unos ids ya elegidos. */
export interface FiltroOpciones {
  search?: string;
  ids?: number[];
}

/** Cuántas opciones trae cada búsqueda. El backend acepta hasta 50. */
export const OPCIONES_POR_PAGINA = 20;
