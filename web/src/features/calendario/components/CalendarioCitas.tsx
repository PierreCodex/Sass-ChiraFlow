"use client";
import { useMemo } from "react";
import { Calendar, momentLocalizer, type Event } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";

import type { Cita } from "@/features/citas/types";
import type { Empleado } from "@/features/empleados/types";
import {
  atiendeA,
  desplazarHora,
  jornadaDelDia,
  rangoDelDia,
  type JornadaDia,
} from "../disponibilidad";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./Calendar.css";
import "./calendario.css";

moment.locale("es");
const localizer = momentLocalizer(moment);

/** Un evento del calendario lleva la cita completa dentro. */
interface EventoCita extends Event {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resourceId: number;
  cita: Cita;
}

interface Props {
  fecha: Date;
  citas: Cita[];
  profesionales: Empleado[];
  onSeleccionarCita: (cita: Cita) => void;
  /** Click en un hueco libre: crea una cita ahí. */
  onSeleccionarHueco: (inicio: Date, empleadoId: number | null) => void;
}

/** Id ficticio para agrupar las citas sin profesional asignado. */
const SIN_ASIGNAR = -1;

function aFecha(dia: string, hora: string) {
  return new Date(`${dia}T${hora}:00`);
}

const CalendarioCitas = ({
  fecha,
  citas,
  profesionales,
  onSeleccionarCita,
  onSeleccionarHueco,
}: Props) => {
  const theme = useTheme();

  const hayCitasSinAsignar = citas.some((cita) => !cita.empleado);

  /**
   * Columnas del calendario: un recurso por profesional.
   *
   * Se añaden también los profesionales que tienen citas ese día pero no están
   * en la lista (por ejemplo, uno dado de baja). Sin esto, react-big-calendar
   * descarta en silencio los eventos cuyo recurso no existe, y la cita
   * desaparece de la vista.
   */
  const recursos = useMemo(() => {
    const lista = profesionales.map((empleado) => ({
      id: empleado.id,
      nombre: empleado.nombre,
      foto_url: empleado.foto_url,
    }));

    citas.forEach((cita) => {
      if (!cita.empleado) return;
      if (lista.some((recurso) => recurso.id === cita.empleado!.id)) return;
      lista.push({
        id: cita.empleado.id,
        nombre: cita.empleado.nombre,
        foto_url: null,
      });
    });

    if (hayCitasSinAsignar) {
      lista.push({ id: SIN_ASIGNAR, nombre: "Sin asignar", foto_url: null });
    }
    return lista;
  }, [profesionales, citas, hayCitasSinAsignar]);

  const eventos: EventoCita[] = useMemo(
    () =>
      citas.map((cita) => ({
        id: cita.id,
        title: cita.cliente_nombre,
        start: aFecha(cita.fecha, cita.hora_inicio),
        end: aFecha(cita.fecha, cita.hora_fin),
        resourceId: cita.empleado?.id ?? SIN_ASIGNAR,
        cita,
      })),
    [citas]
  );

  const fechaISO = moment(fecha).format("YYYY-MM-DD");

  /** Jornada de cada profesional ese día, indexada por id. */
  const jornadas = useMemo(() => {
    const mapa = new Map<number, JornadaDia>();
    profesionales.forEach((empleado) =>
      mapa.set(empleado.id, jornadaDelDia(empleado, fechaISO))
    );
    return mapa;
  }, [profesionales, fechaISO]);

  /**
   * Rango visible: el de las jornadas del día, ampliado si alguna cita cae
   * fuera. Sin esa holgura, una cita agendada fuera de horario quedaría
   * cortada o directamente invisible.
   */
  const rango = useMemo(() => {
    const base = rangoDelDia(profesionales, fechaISO);

    let desde = base.desde;
    let hasta = base.hasta;

    citas.forEach((cita) => {
      if (cita.hora_inicio < desde) desde = cita.hora_inicio;
      if (cita.hora_fin > hasta) hasta = cita.hora_fin;
    });

    // Media hora de aire arriba y abajo para que los bloques respiren.
    return {
      desde: desplazarHora(desde, -30),
      hasta: desplazarHora(hasta, 30),
    };
  }, [profesionales, citas, fechaISO]);

  return (
    <Box
      // `darkbg` es la convención de Calendar.css: activa las reglas de modo
      // oscuro de calendario.css. No se puede hacer con `sx` porque el CSS de
      // react-big-calendar va sin capa y gana sobre los estilos de MUI.
      className={theme.palette.mode === "dark" ? "darkbg" : undefined}
      sx={{
        // El grid crece con las columnas; en móvil se scrollea en horizontal.
        "& .rbc-time-view": { minWidth: recursos.length * 220 },
        overflowX: "auto",
      }}
    >
      <Calendar<EventoCita, (typeof recursos)[number]>
        localizer={localizer}
        events={eventos}
        date={fecha}
        view="day"
        views={["day"]}
        toolbar={false}
        selectable
        onNavigate={() => undefined}
        onView={() => undefined}
        resources={recursos}
        resourceIdAccessor={(recurso) => recurso.id}
        resourceTitleAccessor={(recurso) => recurso.nombre}
        step={30}
        timeslots={1}
        min={aFecha(fechaISO, rango.desde)}
        max={aFecha(fechaISO, rango.hasta)}
        // Atenúa las franjas fuera de la jornada del profesional de esa columna.
        slotPropGetter={(fechaSlot, resourceId) => {
          const jornada =
            typeof resourceId === "number" ? jornadas.get(resourceId) : undefined;
          // Sin horario conocido (sin asignar, o alguien fuera de la lista)
          // no se atenúa nada: no hay información que mostrar.
          if (!jornada) return {};

          const hora = moment(fechaSlot).format("HH:mm");
          return atiendeA(jornada, hora)
            ? {}
            : { className: "slot-no-disponible" };
        }}
        // Abre a la altura de la primera cita, no a las 07:00.
        scrollToTime={
          eventos.length
            ? new Date(
                Math.min(...eventos.map((evento) => evento.start.getTime()))
              )
            : aFecha(moment(fecha).format("YYYY-MM-DD"), "08:00")
        }
        style={{ height: 640 }}
        onSelectEvent={(evento) => onSeleccionarCita(evento.cita)}
        onSelectSlot={(hueco) => {
          const idRecurso = hueco.resourceId as number;
          const jornada = jornadas.get(idRecurso);

          // Fuera de la jornada del profesional no se agenda: los horarios ya
          // están definidos en su ficha, así que el hueco ni siquiera existe.
          if (jornada && !atiendeA(jornada, moment(hueco.start).format("HH:mm"))) {
            return;
          }

          onSeleccionarHueco(
            hueco.start as Date,
            idRecurso === SIN_ASIGNAR ? null : idRecurso
          );
        }}
        // Cada bloque toma el color de su servicio; las canceladas se atenúan.
        eventPropGetter={(evento) => {
          const cancelada =
            evento.cita.estado === "cancelada" ||
            evento.cita.estado === "no_asistio";
          return {
            style: {
              backgroundColor: `${evento.cita.servicio.color}${cancelada ? "22" : "33"}`,
              borderLeft: `3px solid ${evento.cita.servicio.color}`,
              color: theme.palette.text.primary,
              opacity: cancelada ? 0.6 : 1,
              textDecoration: cancelada ? "line-through" : "none",
            },
          };
        }}
        components={{
          // Cabecera de columna: avatar + nombre del profesional.
          resourceHeader: ({ label, resource }) => {
            const jornada = jornadas.get(resource.id);

            // Sin jornada conocida no se dice nada (ej. "Sin asignar").
            const detalle = !jornada
              ? null
              : jornada.trabaja
                ? `${jornada.desde} – ${jornada.hasta}`
                : (jornada.nota ?? "No atiende hoy");

            return (
              <Stack alignItems="center" spacing={0.25} py={1}>
                <Avatar
                  src={resource.foto_url ?? undefined}
                  alt={String(label)}
                  sx={{
                    width: 36,
                    height: 36,
                    opacity: jornada && !jornada.trabaja ? 0.5 : 1,
                  }}
                >
                  {String(label).charAt(0)}
                </Avatar>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {label}
                </Typography>
                {detalle ? (
                  <Typography
                    variant="caption"
                    color={
                      jornada?.trabaja ? "textSecondary" : "error"
                    }
                    noWrap
                  >
                    {detalle}
                  </Typography>
                ) : null}
              </Stack>
            );
          },
          event: ({ event }) => (
            <Box sx={{ px: 0.5, py: 0.25, overflow: "hidden" }}>
              <Typography variant="caption" fontWeight={700} display="block" noWrap>
                {event.cita.cliente_nombre}
              </Typography>
              <Typography variant="caption" display="block" noWrap>
                {event.cita.servicio.nombre}
              </Typography>
              <Typography variant="caption" display="block" sx={{ opacity: 0.75 }}>
                {event.cita.hora_inicio} - {event.cita.hora_fin}
              </Typography>
            </Box>
          ),
        }}
      />
    </Box>
  );
};

export default CalendarioCitas;
