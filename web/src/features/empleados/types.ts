import type { RolResumen } from "@/features/roles/types";

/** Enum real de `users.tipo_pago`. */
export type TipoPago = "comision" | "sueldo" | "ambos";

/** Enum real de `users.sueldo_periodo`. */
export type PeriodoPago = "semanal" | "quincenal" | "mensual";

/** Descanso dentro de la jornada de un día. */
export interface BreakHorario {
  desde: string; // "13:00"
  hasta: string; // "14:00"
}

/**
 * Jornada de un día de la semana.
 *
 * `desde` y `hasta` son nulos en los días que nunca se guardaron: el backend
 * devuelve **siempre los 7**, rellenando los que faltan con `activo: false` y
 * las horas vacías. Un día activo los trae siempre (lo valida allá).
 */
export interface DiaHorario {
  /** 1 = lunes … 7 = domingo (ISO-8601). */
  dia: number;
  /** Si es false, ese día no atiende. */
  activo: boolean;
  desde: string | null; // "09:00"
  hasta: string | null; // "18:00"
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
  /**
   * @deprecated Trae el **email**: `users.usuario` se eliminó y la credencial
   * es el correo. La clave sobrevive mientras el contrato la conserve; pedido
   * su retiro en `api-contract.md`. Usar `email`.
   */
  usuario: string;
  email: string;
  /** Id del rol del negocio. Es lo que come el formulario. */
  rol_id: number;
  /** El rol resuelto, para pintar su nombre sin pedir la lista entera. */
  rol: RolResumen;
  /** Texto libre: "doctor cirujano", "DOCTOR", "Recepción"… */
  cargo: string | null;
  telefono: string | null;
  activo: boolean;
  /**
   * Si la persona sale en la agenda y en la tienda pública.
   *
   * Es lo que consume cupo del plan, junto con `activo`: los usuarios del
   * panel son ilimitados, los profesionales no. Una recepcionista con
   * `atiende: false` entra al panel y no ocupa plaza.
   */
  atiende: boolean;

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
  /** La ausencia del archivo significa "déjala como está". */
  foto_eliminar?: boolean;
  /** La credencial de acceso; única **global**, no solo dentro del negocio. */
  email: string;
  /** Obligatoria al crear; al editar, vacía significa "no cambiar". */
  password: string | null;
  rol_id: number;
  cargo: string | null;
  /** Normalizado a `+51` + 9 dígitos, que es lo único que acepta el backend. */
  telefono: string | null;
  activo: boolean;
  atiende: boolean;
  tipo_pago: TipoPago;
  comision_porcentaje: number;
  monto_sueldo: number | null;
  periodo_pago: PeriodoPago | null;
  horario: DiaHorario[];
  excepciones: ExcepcionHorario[];
}

/**
 * Quien sale en la agenda y en la tienda publica.
 *
 * Lo que antes decidia el rol (`rol === "profesional"`) lo decide ahora
 * `atiende`: el cupo del plan cambio de eje y los usuarios del panel son
 * ilimitados. Un rol que invente el negocio —«Barbero senior»— sale en la
 * agenda igual, y una recepcionista no sale aunque su rol se llame como sea.
 */
export function saleEnAgenda(empleado: Empleado): boolean {
  return empleado.activo && empleado.atiende;
}

/** Cupo de profesionales que permite el plan contratado. */
export interface ResumenPlanEmpleados {
  profesionales_activos: number;
  limite_profesionales: number;
}
