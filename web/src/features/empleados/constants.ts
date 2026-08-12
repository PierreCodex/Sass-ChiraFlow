import type {
  DiaHorario,
  PeriodoPago,
  RolEmpleado,
  TipoPago,
} from "./types";

/**
 * Roles del enum real de `users.rol`:
 *   enum('superadmin', 'dueno', 'admin', 'profesional', 'cliente')
 */
export const ROLES_EMPLEADO: Record<RolEmpleado, string> = {
  superadmin: "Superadmin",
  dueno: "Dueño",
  admin: "Administrador",
  profesional: "Profesional",
  cliente: "Cliente",
};

/**
 * Roles que se ofrecen al dar de alta personal.
 *
 * `superadmin` es de la plataforma, no del negocio; `cliente` se crea al
 * reservar, no desde aquí.
 */
export const ROLES_ASIGNABLES: RolEmpleado[] = ["dueno", "admin", "profesional"];

/** `users.tipo_pago`: enum('comision', 'sueldo', 'ambos') */
export const TIPOS_PAGO: Record<TipoPago, string> = {
  comision: "Por comisión",
  sueldo: "Sueldo fijo",
  ambos: "Sueldo + comisión",
};

/** `users.sueldo_periodo`: enum('mensual', 'quincenal', 'semanal') */
export const PERIODOS_PAGO: Record<PeriodoPago, string> = {
  semanal: "Semanal",
  quincenal: "Quincenal",
  mensual: "Mensual",
};

/** Qué campos de pago se muestran según el tipo elegido. */
export const PAGO_INCLUYE_COMISION: TipoPago[] = ["comision", "ambos"];
export const PAGO_INCLUYE_SUELDO: TipoPago[] = ["sueldo", "ambos"];

/** Solo los profesionales consumen cupo del plan. */
export const ROL_QUE_CONSUME_PLAN: RolEmpleado = "profesional";

/** Lunes a domingo, en formato ISO-8601 (1 = lunes). */
export const DIAS_SEMANA: { dia: number; nombre: string }[] = [
  { dia: 1, nombre: "Lunes" },
  { dia: 2, nombre: "Martes" },
  { dia: 3, nombre: "Miércoles" },
  { dia: 4, nombre: "Jueves" },
  { dia: 5, nombre: "Viernes" },
  { dia: 6, nombre: "Sábado" },
  { dia: 7, nombre: "Domingo" },
];

/** Horario por defecto de un empleado nuevo: lunes a sábado, 09:00 a 18:00. */
export function horarioPorDefecto(): DiaHorario[] {
  return DIAS_SEMANA.map(({ dia }) => ({
    dia,
    activo: dia <= 6,
    desde: "09:00",
    hasta: "18:00",
    breaks: [],
  }));
}
