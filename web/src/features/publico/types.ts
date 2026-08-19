/**
 * Tipos de la tienda pública de reservas.
 *
 * Es la cara que ve el **cliente final** del negocio, no el dueño. Por eso
 * los datos son un subconjunto: nada de costes, comisiones ni estados
 * internos.
 */

/** Cabecera del negocio en su tienda. */
export interface NegocioPublico {
  id: number;
  nombre: string;
  slug: string;
  telefono: string | null;
  email: string | null;
  /** Mismos 3 campos que configura el negocio en Configuración → Pagos QR. */
  pago_qr_activo: boolean;
  pago_qr_url: string | null;
  pago_qr_instrucciones: string | null;
}

/**
 * Reseña de un cliente.
 *
 * ⚠️ **No existe en el backend todavía**: no hay tabla ni campo. Se maqueta
 * porque es lo que más convierte en una tienda de reservas, y porque el plan
 * Premium ya vende `encuesta_satisfaccion`. El esquema propuesto está en
 * `docs/vistas/tienda-publica.md`.
 */
export interface Resena {
  id: number;
  cliente: string;
  /** 1 a 5. */
  puntuacion: number;
  comentario: string | null;
  fecha: string; // YYYY-MM-DD
  /** Servicio por el que vino, si se guarda la cita de origen. */
  servicio: string | null;
  /** Respuesta pública del negocio. */
  respuesta: string | null;
}

/** Resumen de valoraciones de una sede. */
export interface ResumenResenas {
  /** Media redondeada a un decimal. */
  promedio: number;
  total: number;
  /** Cuántas reseñas por estrella, de 5 a 1. */
  distribucion: Record<1 | 2 | 3 | 4 | 5, number>;
}

/** Sede donde se puede reservar. */
export interface LocalPublico {
  id: number;
  nombre: string;
  direccion: string | null;
  descripcion: string | null;
  telefono: string | null;
  banner_url: string | null;
  logo_url: string | null;
  latitud: number | null;
  longitud: number | null;
  /** Color de marca del local: tiñe el primario de la tienda. */
  color: string | null;
  horario_desde: string | null;
  horario_hasta: string | null;
}

/**
 * Profesional visible en la tienda.
 *
 * Solo aparecen los que están `activo` **y** con `habilitado = true` en la
 * pivote `local_profesional` de esta sede.
 */
export interface ProfesionalPublico {
  id: number;
  /** `nombre_publico` de la pivote, o el nombre real si no tiene. */
  nombre: string;
  perfil: string | null;
  foto_url: string | null;
}

export interface ServicioPublico {
  id: number;
  nombre: string;
  descripcion: string | null;
  duracion_min: number;
  precio: number;
  color: string;
  imagen_principal: string | null;
  galeria: string[];
}

export interface CategoriaPublica {
  id: number | null; // null = "Otros servicios"
  nombre: string;
  servicios: ServicioPublico[];
}

/** Todo lo que necesita la página de una sede. */
export interface TiendaLocal {
  negocio: NegocioPublico;
  local: LocalPublico;
  categorias: CategoriaPublica[];
  profesionales: ProfesionalPublico[];
  /** null mientras el negocio no tenga ninguna reseña. */
  resenas: ResumenResenas | null;
  /** Las más recientes; el listado completo iría paginado aparte. */
  ultimas_resenas: Resena[];
}

/** Una línea del carrito. */
export interface LineaCarrito {
  servicio: ServicioPublico;
  cantidad: number;
}

/**
 * Cómo se agendan varios servicios.
 *
 * - `unica`: una sola cita seguida, con el mismo profesional. La duración es
 *   la suma y se cobra todo junto.
 * - `separada`: una cita por servicio, cada una con su profesional, fecha y
 *   hora.
 */
export type ModoReserva = "unica" | "separada";

/** Asignación de un servicio dentro de la reserva. */
export interface AsignacionServicio {
  id: number;
  cantidad: number;
  profesional_id: number | null;
  fecha: string | null; // YYYY-MM-DD
  hora_inicio: string | null; // "HH:MM"
}

export interface DatosCliente {
  cliente_nombre: string;
  cliente_apellido: string | null;
  cliente_telefono: string;
  cliente_email: string;
  cliente_documento: string | null;
  notas: string | null;
}

export interface ReservaPayload extends DatosCliente {
  modo: ModoReserva;
  servicios: {
    id: number;
    cantidad: number;
    profesional_id: number;
    fecha: string;
    hora_inicio: string;
  }[];
  /** Solo van informados si el cliente eligió "Pagar ahora" con QR. */
  metodo_pago?: "ahora" | "local" | null;
  comprobante_pago_url?: string | null;
}

/** Lo que devuelve el backend tras reservar, para el comprobante. */
export interface ReservaConfirmada {
  codigo: string;
  modo: ModoReserva;
  total: number;
  citas: {
    id: number;
    servicio: string;
    profesional: string;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
  }[];
}

export function totalCarrito(lineas: LineaCarrito[]) {
  return lineas.reduce(
    (suma, linea) => suma + linea.servicio.precio * linea.cantidad,
    0
  );
}

export function duracionCarrito(lineas: LineaCarrito[]) {
  return lineas.reduce(
    (suma, linea) => suma + linea.servicio.duracion_min * linea.cantidad,
    0
  );
}

export function unidadesCarrito(lineas: LineaCarrito[]) {
  return lineas.reduce((suma, linea) => suma + linea.cantidad, 0);
}
