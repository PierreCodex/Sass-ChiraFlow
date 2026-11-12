/**
 * Tipos de la tienda pública de reservas.
 *
 * Es la cara que ve el **cliente final** del negocio, no el dueño. Por eso
 * los datos son un subconjunto: nada de costes, comisiones ni estados
 * internos.
 */

/** Cabecera del negocio en su tienda. */
export interface NegocioPublico {
  // Sin `id` (Story 6.1): el del negocio nombra su base de datos.
  nombre: string;
  slug: string;
  telefono: string | null;
  email: string | null;
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
  /** El enlace de la sede (Story 6.2): `/reservar/{negocio}/{slug}`. */
  slug: string;
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
 * Solo aparecen los que tienen algo que reservar en esta sede (Story 6.3):
 * activos, que atienden, habilitados en ella y que prestan al menos un
 * servicio de su catálogo.
 */
export interface ProfesionalPublico {
  id: number;
  /** `nombre_publico` de la pivote, o el nombre real si no tiene. */
  nombre: string;
  perfil: string | null;
  /** `null` hasta la Story 5.2 (claves opacas). */
  foto_url: string | null;
  /** Los ids de los servicios del catálogo que presta EN esta sede (Story 6.3). */
  servicios: number[];
}

/** Quien puede atender todos estos servicios en la sede. */
export function quienesPrestan(profesionales: ProfesionalPublico[], servicioIds: number[]) {
  return profesionales.filter((profesional) =>
    servicioIds.every((id) => profesional.servicios.includes(id))
  );
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
/**
 * «Cualquier profesional» en el asistente (Story 6.4): las horas de todos los
 * que pueden atender, y la reserva asigna uno concreto. Al servidor viaja como
 * `profesional_id` ausente (horarios) o `null` (reserva).
 */
export const CUALQUIER_PROFESIONAL = 0;

export interface AsignacionServicio {
  id: number;
  cantidad: number;
  /** `null` = sin elegir; `CUALQUIER_PROFESIONAL` = el que esté libre. */
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
  /** Story 6.6 (Ley 29733): sin esto el backend no guarda nada. */
  acepta_privacidad: boolean;
  /** Nace desmarcada; si la marca, los avisos le llegan también por WhatsApp. */
  acepta_whatsapp: boolean;
}

export interface ReservaPayload extends DatosCliente {
  modo: ModoReserva;
  servicios: {
    id: number;
    cantidad: number;
    /** `null` = cualquiera: lo asigna el servidor al reservar (6.6). */
    profesional_id: number | null;
    fecha: string;
    hora_inicio: string;
  }[];
}

/** Lo que devuelve el backend tras reservar, para el comprobante. */
export interface ReservaConfirmada {
  codigo: string;
  modo: ModoReserva;
  /** Story 6.6: la tienda siempre crea `pendiente`; se confirma con la 6.7. */
  estado?: "pendiente";
  /**
   * Story 6.7: hasta cuándo puede confirmar desde su correo, en la hora del
   * negocio («2026-11-16 10:45»). `null` si el negocio no pide confirmar.
   */
  confirmar_hasta?: string | null;
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

/** «A», «A» y «B», «A», «B» y «C». */
function enumerar(nombres: string[]) {
  const citados = nombres.map((nombre) => `«${nombre}»`);
  return citados.length > 1
    ? `${citados.slice(0, -1).join(", ")} y ${citados[citados.length - 1]}`
    : citados[0] ?? "";
}

/**
 * Story 6.5: qué decirle al cliente cuando el catálogo cambió mientras elegía.
 * No se cuenta el motivo exacto (2.2: a un desconocido no se le dice si el
 * profesional está de baja), pero sí que no es culpa suya.
 */
export function avisoDeCambios(cambios: {
  quitados: string[];
  actualizados: string[];
}): string | null {
  const partes: string[] = [];
  if (cambios.quitados.length) {
    const varios = cambios.quitados.length > 1;
    partes.push(
      `Quitamos ${enumerar(cambios.quitados)} de tu selección: ya no ${
        varios ? "se pueden" : "se puede"
      } reservar en esta sede (el negocio ${
        varios ? "los retiró" : "lo retiró"
      } o no tiene quién ${varios ? "los atienda" : "lo atienda"}).`
    );
  }
  if (cambios.actualizados.length) {
    partes.push(
      `${enumerar(cambios.actualizados)} ${
        cambios.actualizados.length > 1 ? "cambiaron" : "cambió"
      } de precio o de duración; el total ya está al día.`
    );
  }
  return partes.length ? partes.join(" ") : null;
}

/**
 * Los servicios como los pide `/horarios` (Story 6.4): un id por unidad, así
 * la cantidad viaja como repetición y el servidor suma la duración.
 */
export function serviciosParaHorarios(lineas: LineaCarrito[]) {
  return lineas.flatMap((linea) =>
    Array.from({ length: linea.cantidad }, () => linea.servicio.id)
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

/** Story 6.7: lo que pasa al abrir el enlace del correo «Confirma tu reserva». */
export type ResultadoConfirmacion = "confirmada" | "ya_confirmada" | "expirada";

export interface ConfirmacionReserva {
  resultado: ResultadoConfirmacion;
  negocio: string;
  cita: {
    codigo: string;
    servicio: string;
    profesional: string | null;
    sede: string | null;
    fecha: string;
    hora_inicio: string;
  };
  /** A dónde ir para reservar de nuevo (la sede de la cita). */
  sede_slug: string | null;
}
