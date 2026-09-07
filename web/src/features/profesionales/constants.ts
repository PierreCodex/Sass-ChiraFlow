import type { BreakHorario, DiaHorario, PeriodoPago, TipoPago } from "./types";

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

/** Jornada que se propone en los días sin horas guardadas. */
const JORNADA_POR_DEFECTO = { desde: "09:00", hasta: "18:00" };

/**
 * El día tal como lo maneja el formulario: con hora siempre, aunque el día
 * esté apagado. `DiaHorario` las admite nulas porque así llegan de la API.
 */
export interface DiaHorarioFormulario {
  dia: number;
  activo: boolean;
  desde: string;
  hasta: string;
  breaks: BreakHorario[];
}

/** Horario por defecto de un empleado nuevo: lunes a sábado, 09:00 a 18:00. */
export function horarioPorDefecto(): DiaHorarioFormulario[] {
  return DIAS_SEMANA.map(({ dia }) => ({
    dia,
    activo: dia <= 6,
    ...JORNADA_POR_DEFECTO,
    breaks: [],
  }));
}

/**
 * El horario que llega de la API, con la forma que necesita el formulario.
 *
 * El backend manda **siempre los 7 días**, pero los que nunca se guardaron
 * vienen con `activo: false` y las horas en `null` — la fila del dueño nace
 * así, porque la crea el provisioning. Los `input[type=time]` necesitan una
 * cadena, y dejarlos vacíos obligaría a teclear las dos horas justo al
 * encender un día.
 */
export function horarioParaFormulario(
  horario: DiaHorario[]
): DiaHorarioFormulario[] {
  const guardados = new Map(horario.map((dia) => [dia.dia, dia]));

  return DIAS_SEMANA.map(({ dia }) => {
    const guardado = guardados.get(dia);
    return {
      dia,
      activo: guardado?.activo ?? false,
      desde: guardado?.desde ?? JORNADA_POR_DEFECTO.desde,
      hasta: guardado?.hasta ?? JORNADA_POR_DEFECTO.hasta,
      breaks: guardado?.breaks ?? [],
    };
  });
}
