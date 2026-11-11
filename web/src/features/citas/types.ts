/**
 * Los seis del ENUM de la tabla `citas`. El backend los emite todos y no los
 * recorta: recortarlos sería mentir sobre el estado real de una cita, y el
 * bloque de inasistencias de Reportes es imposible sin `no_asistio`.
 */
export type EstadoCita =
  | "pendiente"
  | "confirmada"
  | "en_curso"
  | "completada"
  | "cancelada"
  | "no_asistio";

/**
 * Una línea de `cita_servicio`.
 *
 * `duracion_min` y `precio` salen de la PIVOTE, no del servicio: son los que
 * tenía el día que se reservó. Subir la tarifa del catálogo no reescribe lo ya
 * agendado.
 */
export interface LineaServicio {
  id: number;
  nombre: string;
  duracion_min: number;
  precio: number;
  cantidad: number;
  /** Color del servicio: pinta el bloque en el calendario. */
  color: string;
}

/** Producto vendido durante la cita. */
export interface ProductoCita {
  producto_id: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
}

export interface Cita {
  id: number;
  /**
   * Público, y el único identificador que viaja por WhatsApp: por él pregunta
   * por su cita quien no tiene cuenta.
   */
  codigo: string;
  fecha: string; // "2026-08-10"
  hora_inicio: string; // "20:00"
  /** Lo calcula el backend: hora_inicio + duración del servicio. */
  hora_fin: string;
  estado: EstadoCita;

  /**
   * Suma de las líneas de SERVICIO, y solo eso.
   *
   * Es el campo que el formulario deja editar, y editarlo reescribe el precio
   * congelado de la línea. Para MOSTRAR lo que se cobra está `monto_total`:
   * pintar el total aquí y reenviarlo al guardar subiría el precio del
   * servicio con el importe de lo vendido.
   */
  monto: number;
  /** Servicios + productos. Es «lo que se cobra». */
  monto_total: number;

  notas: string | null;

  /**
   * El formulario captura el cliente como texto libre. `cliente_id` viene
   * informado solo si la cita quedó vinculada a un cliente registrado.
   */
  cliente_id: number | null;
  cliente_nombre: string;
  cliente_telefono: string | null;
  cliente_email: string | null;
  /** La casilla de WhatsApp del cliente (Story 4.8c): es suya, no de la cita. */
  cliente_acepta_whatsapp: boolean;

  /**
   * La fuente de verdad: no existe `citas.servicio_id`, los servicios viven en
   * `cita_servicio`. El panel manda uno hoy; la tienda pública encadenará
   * varios en el Sprint 5.
   */
  servicios: LineaServicio[];
  /**
   * La primera línea, **como puente** mientras el panel mande un solo
   * servicio. Puede ser `null`. No leerlo directamente: usar `servicioPrincipal`
   * o `nombreDeServicios`, que ya miran el array.
   */
  servicio: LineaServicio | null;

  /** Toda cita tiene profesional: `citas.profesional_id` no es nullable. */
  empleado: { id: number; nombre: string };
  /** La sede. Con un solo local lo pone el backend. */
  local_id: number | null;
  productos: ProductoCita[];

  /** De dónde vino (Story 1.13). Lo pone el backend: el panel no lo manda. */
  canal: CanalCita;
  /**
   * La cuenta del negocio que la registró. `null` si la puso el cliente desde
   * la tienda, o si es anterior a que se anotara. `nombre` puede venir `null`
   * si la cuenta ya no existe.
   */
  creada_por: { id: number; nombre: string | null } | null;
}

export type CanalCita = "panel" | "tienda";

/** Los campos que el historial vigila, y solo esos (contrato § Historial). */
export type CampoHistorial =
  | "estado"
  | "fecha"
  | "hora_inicio"
  | "empleado"
  | "servicio"
  | "local"
  | "monto";

/** Un evento de `GET /citas/{id}/historial` (Story 1.13). */
export interface EventoCita {
  id: number;
  tipo: "creada" | "modificada";
  /** ISO 8601. */
  momento: string;
  actor: {
    tipo: "usuario" | "cliente" | "sistema" | "plataforma";
    /** El nombre de ese momento. `null` si no hay a quién nombrar. */
    nombre: string | null;
  };
  /** Solo en `modificada`; vacío en `creada`. */
  cambios: Partial<
    Record<CampoHistorial, { antes: string | number | null; despues: string | number | null }>
  >;
}

export interface CitaPayload {
  empleado_id: number;
  servicio_id: number;
  fecha: string;
  hora_inicio: string;
  /** Opcional: con una sola sede lo resuelve el backend. */
  local_id: number | null;
  cliente_id: number | null;
  cliente_nombre: string;
  cliente_telefono: string | null;
  cliente_email: string | null;
  /** «Recibir avisos por WhatsApp», marcada de palabra por el cliente (4.8c). */
  acepta_whatsapp?: boolean;
  monto: number;
  estado: EstadoCita;
  notas: string | null;
  /** La clave es `id`, como la espera el backend: productos[i][id]. */
  productos: { id: number; cantidad: number }[];
}

/** Gris neutro para una cita sin servicio: el calendario le añade opacidad. */
const SIN_COLOR = "#9E9E9E";

/** Las líneas de servicio, mirando el array primero y el puente después. */
export function lineasDeServicio(cita: Cita): LineaServicio[] {
  if (cita.servicios?.length) return cita.servicios;
  return cita.servicio ? [cita.servicio] : [];
}

/**
 * El servicio con el que se pinta y se calcula: el primero.
 *
 * Es `null` cuando la cita no tiene ninguno — el backend lo admite, así que
 * quien lo use tiene que contar con ello.
 */
export function servicioPrincipal(cita: Cita): LineaServicio | null {
  return lineasDeServicio(cita)[0] ?? null;
}

/** Todos los nombres, para pintar la celda. Con uno solo, ese. */
export function nombreDeServicios(cita: Cita): string {
  const nombres = lineasDeServicio(cita).map((linea) => linea.nombre);
  return nombres.length ? nombres.join(" · ") : "Sin servicio";
}

/** El color del bloque en el calendario: el del primer servicio. */
export function colorDeCita(cita: Cita): string {
  return servicioPrincipal(cita)?.color ?? SIN_COLOR;
}

/**
 * ¿Esta cita ocupa su hueco?
 *
 * Solo `cancelada` lo libera. `no_asistio` NO: el profesional estuvo esperando
 * igual, y liberarlo reescribiría el pasado. Es la misma regla que aplica
 * `App\Services\Disponibilidad`, y las dos tienen que decir lo mismo.
 */
export function ocupaSuHueco(cita: Cita): boolean {
  return cita.estado !== "cancelada";
}
