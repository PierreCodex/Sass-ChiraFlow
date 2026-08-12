import type { BreakHorario, Empleado } from "@/features/empleados/types";
import type {
  ConfiguracionAgenda,
  HorarioNegocio,
} from "@/features/configuracion/types";

/** JS usa 0 = domingo; el horario del empleado usa ISO-8601 (1 = lunes). */
export function diaIso(fechaISO: string) {
  const dia = new Date(`${fechaISO}T00:00:00`).getDay();
  return dia === 0 ? 7 : dia;
}

/** De dónde salió el horario que se está aplicando ese día. */
export type OrigenJornada =
  | "personalizado"
  | "excepcion"
  | "excepcion_inactiva"
  | "no_laborable"
  | "negocio";

export interface JornadaDia {
  trabaja: boolean;
  desde: string | null;
  hasta: string | null;
  breaks: BreakHorario[];
  /** Nota de la excepción de ese día, si la hay. */
  nota: string | null;
  origen: OrigenJornada;
}

function noTrabaja(origen: OrigenJornada, nota: string | null = null): JornadaDia {
  return { trabaja: false, desde: null, hasta: null, breaks: [], nota, origen };
}

/**
 * Jornada de un profesional en una fecha concreta.
 *
 * Replica la precedencia de `ReservaController::generarHorarios` en Laravel:
 *
 * 1. Excepción con `disponible: false` → no atiende ese día.
 * 2. Excepción con `disponible: true` → **manda su propio horario**, que puede
 *    diferir del habitual (medio turno, refuerzo, cubrir a un compañero).
 * 3. Horario propio y el día está activo → ese horario, con sus breaks.
 * 4. Horario propio pero el día no está activo → no laborable.
 * 5. **Sin horario propio → se usa el horario del negocio.** Un profesional
 *    recién creado atiende en el horario general, no queda sin agenda.
 */
export function jornadaDelDia(
  empleado: Empleado,
  fechaISO: string,
  horarioNegocio?: HorarioNegocio
): JornadaDia {
  const excepcion = empleado.excepciones?.find((e) => e.fecha === fechaISO);

  if (excepcion && !excepcion.disponible) {
    return noTrabaja("excepcion_inactiva", excepcion.nota ?? "No disponible");
  }

  // Una excepción disponible reemplaza el horario del día.
  if (excepcion?.disponible) {
    return {
      trabaja: true,
      desde: excepcion.desde ?? "09:00",
      hasta: excepcion.hasta ?? "18:00",
      breaks: [],
      nota: excepcion.nota ?? null,
      origen: "excepcion",
    };
  }

  const tieneHorarioPropio = !!empleado.horario?.length;
  const dia = empleado.horario?.find((h) => h.dia === diaIso(fechaISO));

  if (tieneHorarioPropio && dia?.activo) {
    return {
      trabaja: true,
      desde: dia.desde,
      hasta: dia.hasta,
      breaks: dia.breaks ?? [],
      nota: null,
      origen: "personalizado",
    };
  }

  if (tieneHorarioPropio) return noTrabaja("no_laborable");

  // Sin horario propio: rige el del negocio.
  return {
    trabaja: true,
    desde: horarioNegocio?.apertura ?? "09:00",
    hasta: horarioNegocio?.cierre ?? "20:00",
    breaks: [],
    nota: null,
    origen: "negocio",
  };
}

/** ¿El profesional atiende a esa hora (`"HH:mm"`)? */
export function atiendeA(jornada: JornadaDia, hora: string) {
  if (!jornada.trabaja || !jornada.desde || !jornada.hasta) return false;
  if (hora < jornada.desde || hora >= jornada.hasta) return false;
  return !jornada.breaks.some(
    (descanso) => hora >= descanso.desde && hora < descanso.hasta
  );
}

/**
 * Rango horario que debe mostrar el calendario: el que cubre las jornadas de
 * todos los profesionales del día.
 */
export function rangoDelDia(
  empleados: Empleado[],
  fechaISO: string,
  horarioNegocio?: HorarioNegocio,
  porDefecto = { desde: "08:00", hasta: "20:00" }
) {
  const jornadas = empleados
    .map((empleado) => jornadaDelDia(empleado, fechaISO, horarioNegocio))
    .filter((jornada) => jornada.trabaja);

  if (jornadas.length === 0) return porDefecto;

  return {
    desde: jornadas.reduce(
      (min, j) => (j.desde! < min ? j.desde! : min),
      "23:59"
    ),
    hasta: jornadas.reduce((max, j) => (j.hasta! > max ? j.hasta! : max), "00:00"),
  };
}

export function horaAMinutos(hora: string) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

export function minutosAHora(minutos: number) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Dos intervalos [aIni,aFin) y [bIni,bFin) se pisan. */
function seSolapan(aIni: number, aFin: number, bIni: number, bFin: number) {
  return aIni < bFin && bIni < aFin;
}

export interface Ocupado {
  inicio: string;
  fin: string;
}

/** Paso de la rejilla si aún no se cargó la configuración del negocio. */
export const PASO_AGENDA_POR_DEFECTO = 15;

/**
 * Cada cuántos minutos se ofrece un inicio de cita.
 *
 * Lo decide el dueño en Configuración: encadenar con la duración del servicio
 * (agenda compacta) o una rejilla fija cada N minutos (más flexible, pero
 * fragmenta).
 */
export function pasoDeAgenda(
  agenda: ConfiguracionAgenda | undefined,
  duracionServicioMin: number
) {
  if (!agenda) return PASO_AGENDA_POR_DEFECTO;
  return agenda.modo_intervalo === "duracion_servicio"
    ? Math.max(1, duracionServicioMin)
    : Math.max(1, agenda.intervalo_min);
}

/**
 * Horas de inicio en las que cabe una cita de `duracionMin`, respetando la
 * jornada del profesional, sus breaks y las citas que ya tiene.
 *
 * Es lo que alimenta el selector del formulario: si el hueco no está en esta
 * lista, no se puede elegir. Así agendar fuera de horario deja de ser
 * posible, en vez de ser algo que hay que validar después.
 *
 * Los candidatos son la rejilla del paso **más los bordes**: el instante en
 * que termina cada cita y cada break. Sin esos bordes, un servicio cuya
 * duración no sea múltiplo del paso deja huecos muertos — una cita de 50 min
 * a las 09:00 termina a las 09:50, y la rejilla no volvería a ofrecer nada
 * hasta las 10:00.
 */
export function huecosDisponibles(
  jornada: JornadaDia,
  ocupados: Ocupado[],
  duracionMin: number,
  pasoMin = PASO_AGENDA_POR_DEFECTO
): string[] {
  if (!jornada.trabaja || !jornada.desde || !jornada.hasta) return [];

  const apertura = horaAMinutos(jornada.desde);
  const cierre = horaAMinutos(jornada.hasta);

  const bloqueados = [
    ...jornada.breaks.map((b) => ({
      ini: horaAMinutos(b.desde),
      fin: horaAMinutos(b.hasta),
    })),
    ...ocupados.map((o) => ({
      ini: horaAMinutos(o.inicio),
      fin: horaAMinutos(o.fin),
    })),
  ];

  const candidatos = new Set<number>();

  // Rejilla regular.
  for (let inicio = apertura; inicio + duracionMin <= cierre; inicio += pasoMin) {
    candidatos.add(inicio);
  }

  // Bordes: justo cuando se libera el profesional.
  bloqueados.forEach(({ fin }) => {
    if (fin >= apertura && fin + duracionMin <= cierre) candidatos.add(fin);
  });

  return [...candidatos]
    .sort((a, b) => a - b)
    .filter(
      (inicio) =>
        !bloqueados.some((b) =>
          seSolapan(inicio, inicio + duracionMin, b.ini, b.fin)
        )
    )
    .map(minutosAHora);
}

/** Resta o suma minutos a una hora "HH:mm", con tope en 00:00 y 23:59. */
export function desplazarHora(hora: string, minutos: number) {
  const [h, m] = hora.split(":").map(Number);
  const total = Math.max(0, Math.min(23 * 60 + 59, h * 60 + m + minutos));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(
    total % 60
  ).padStart(2, "0")}`;
}
