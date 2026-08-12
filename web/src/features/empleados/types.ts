/** Enum real de `users.rol`. */
export type RolEmpleado =
  | "superadmin"
  | "dueno"
  | "admin"
  | "profesional"
  | "cliente";

/** Enum real de `users.tipo_pago`. */
export type TipoPago = "comision" | "sueldo" | "ambos";

/** Enum real de `users.sueldo_periodo`. */
export type PeriodoPago = "semanal" | "quincenal" | "mensual";

/** Descanso dentro de la jornada de un día. */
export interface BreakHorario {
  desde: string; // "13:00"
  hasta: string; // "14:00"
}

/** Jornada de un día de la semana. */
export interface DiaHorario {
  /** 1 = lunes … 7 = domingo (ISO-8601). */
  dia: number;
  /** Si es false, ese día no atiende. */
  activo: boolean;
  desde: string; // "09:00"
  hasta: string; // "18:00"
  breaks: BreakHorario[];
}

/**
 * Permisos, emergencias o medio turno en una fecha concreta.
 *
 * Si `disponible` es true, `desde`/`hasta` **reemplazan** el horario habitual
 * de ese día: sirve tanto para quitar disponibilidad como para añadirla con
 * otro horario.
 */
export interface ExcepcionHorario {
  fecha: string; // "2026-08-10"
  disponible: boolean;
  desde: string | null; // "09:00"
  hasta: string | null; // "13:00"
  nota: string | null;
}

export interface Empleado {
  id: number;
  nombre: string;
  /** Foto del profesional. Si falta, se muestran las iniciales. */
  foto_url: string | null;
  /** Usuario con el que inicia sesión. */
  usuario: string;
  rol: RolEmpleado;
  /** Texto libre: "doctor cirujano", "DOCTOR", "Dueño"… */
  cargo: string | null;
  email: string | null;
  telefono: string | null;
  activo: boolean;

  tipo_pago: TipoPago;
  comision_porcentaje: number;
  /** Solo aplica si el tipo de pago incluye sueldo. */
  monto_sueldo: number | null;
  periodo_pago: PeriodoPago | null;

  horario: DiaHorario[];
  excepciones: ExcepcionHorario[];
}

export interface EmpleadoPayload {
  nombre: string;
  foto: File | null;
  usuario: string;
  /** Obligatoria al crear; al editar, vacía significa "no cambiar". */
  password: string | null;
  rol: RolEmpleado;
  cargo: string | null;
  email: string | null;
  telefono: string | null;
  activo: boolean;
  tipo_pago: TipoPago;
  comision_porcentaje: number;
  monto_sueldo: number | null;
  periodo_pago: PeriodoPago | null;
  horario: DiaHorario[];
  excepciones: ExcepcionHorario[];
}

/** Cupo de profesionales que permite el plan contratado. */
export interface ResumenPlanEmpleados {
  profesionales_activos: number;
  limite_profesionales: number;
}
