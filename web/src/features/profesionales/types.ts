import type { RolResumen } from "@/features/roles/types";

/** Enum real de `profesionales.tipo_pago`. */
export type TipoPago = "comision" | "sueldo" | "ambos";

/** Enum real de `profesionales.sueldo_periodo`. */
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

/**
 * La cuenta del panel de un profesional, o `null` si no entra al sistema.
 *
 * Es lo normal en un barbero: presta servicios, cobra su comisión y nunca
 * abre el panel. Que esto pueda ser `null` es toda la separación resumida en
 * un campo.
 */
export interface CuentaDelProfesional {
  id: number;
  email: string;
  activo: boolean;
  rol_id: number;
  rol: RolResumen | null;
}

/**
 * Quien presta los servicios.
 *
 * **No confundir con `features/usuarios/types.ts › Usuario`**, que es quien
 * entra al panel. Desde el 2026-09-04 son dos módulos distintos y ninguno
 * implica al otro: `/api/empleados` dejó de existir porque obligaba a
 * declararle un tipo de pago a la recepcionista y a inventarle un correo al
 * barbero que no usa el sistema.
 *
 * El `id` es el de `profesionales`: el que usan las citas,
 * `servicio_profesional` y `local_profesional`.
 */
export interface Profesional {
  id: number;
  nombre: string;
  /** Foto del profesional. Si falta, se muestran las iniciales. */
  foto_url: string | null;

  /** Su cuenta del panel, o `null` si no entra al sistema. */
  usuario: CuentaDelProfesional | null;

  /** Texto libre: "doctor cirujano", "DOCTOR", "Recepción"… */
  cargo: string | null;
  telefono: string | null;
  /**
   * Si la ficha está de alta.
   *
   * **Es lo que consume cupo del plan**, y nada más: una fila activa aquí es
   * una plaza. No mira roles ni `atiende` — quien está en esta tabla presta
   * servicios, y punto. Por eso el 422 del tope cae en este campo.
   */
  activo: boolean;
  /**
   * Si aparece en la tienda pública.
   *
   * Y **solo** eso. Dejó de decidir el cupo del plan (lo decide `activo`) y
   * dejó de significar "es staff" (lo dice tener cuenta). Un barbero que solo
   * recibe reservas por teléfono cuesta lo mismo que uno que las recibe por
   * la web.
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

/**
 * La casilla «darle acceso al panel».
 *
 * Viaja solo cuando se marca, y **solo sirve para crear** la cuenta de quien
 * no la tiene: a quien ya la tiene se le edita en `/usuarios`, que es su
 * sitio. Funciona igual al crear la ficha que al editarla — un barbero lleva
 * meses sin cuenta y un día la necesita.
 */
export interface AccesoAlPanel {
  email: string;
  rol_id: number;
}

export interface ProfesionalPayload {
  nombre: string;
  foto: File | null;
  /** La ausencia del archivo significa "déjala como está". */
  foto_eliminar?: boolean;
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

  /** Sin email ni rol ni contraseña sueltos: si acaso, aquí dentro. */
  usuario?: AccesoAlPanel;
}

/** Quien sale en la tienda pública: hay que estar de alta y aceptar reservas. */
export function saleEnAgenda(profesional: Profesional): boolean {
  return profesional.activo && profesional.atiende;
}

/** Cupo de profesionales que permite el plan contratado. */
export interface ResumenPlanProfesionales {
  profesionales_activos: number;
  limite_profesionales: number;
}
