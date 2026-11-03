"use client";

import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { formatFecha, formatHora, formatMoneda } from "@/lib/format";
import { CAMPOS_HISTORIAL, CANALES_CITA, ESTADOS_CITA } from "../constants";
import { useHistorialCita } from "../hooks/useCitas";
import type { Cita, EstadoCita, EventoCita } from "../types";

/** Un valor del historial tal como lo lee una persona: «Confirmada», «S/ 45.00». */
function valorLegible(campo: string, valor: string | number | null) {
  if (valor === null || valor === "") return "—";
  if (campo === "estado") return ESTADOS_CITA[valor as EstadoCita]?.label ?? String(valor);
  if (campo === "monto") return formatMoneda(Number(valor));
  if (campo === "fecha") return formatFecha(String(valor));
  return String(valor);
}

/** «Registrada desde el panel por Ana Torres», o lo que se sepa. */
function origen(cita: Cita) {
  if (cita.canal === "tienda") {
    return `El cliente la reservó desde ${CANALES_CITA.tienda}.`;
  }
  const desde = `Registrada desde ${CANALES_CITA[cita.canal] ?? "el panel"}`;
  if (!cita.creada_por) {
    // Anterior a la Story 1.13: nadie anotó quién fue, y no se inventa.
    return `${desde}.`;
  }
  return cita.creada_por.nombre
    ? `${desde} por ${cita.creada_por.nombre}.`
    : `${desde} por una cuenta que ya no existe.`;
}

function Evento({ evento }: { evento: EventoCita }) {
  const quien = evento.actor.nombre ?? (evento.actor.tipo === "cliente" ? "El cliente" : "El sistema");
  const cambios = Object.entries(evento.cambios);

  return (
    <Box sx={{ pl: 2, borderLeft: "2px solid", borderColor: "divider" }}>
      <Typography variant="caption" color="textSecondary">
        {formatFecha(evento.momento)} · {formatHora(evento.momento)} · {quien}
      </Typography>
      {evento.tipo === "creada" ? (
        <Typography variant="body2">Creó la cita.</Typography>
      ) : (
        cambios.map(([campo, cambio]) => (
          <Typography key={campo} variant="body2">
            {CAMPOS_HISTORIAL[campo] ?? campo}: {valorLegible(campo, cambio!.antes)} →{" "}
            <Box component="span" fontWeight={600}>
              {valorLegible(campo, cambio!.despues)}
            </Box>
          </Typography>
        ))
      )}
    </Box>
  );
}

/**
 * De dónde vino la cita, quién la registró y qué le ha pasado desde entonces
 * (Story 1.13). Va al final de la ficha: es para resolver un «yo no la moví»,
 * no para agendar.
 */
const HistorialCita = ({ cita }: { cita: Cita }) => {
  const { data: eventos, isPending, isError } = useHistorialCita(cita.id);

  return (
    <Stack spacing={1.5}>
      <Box>
        <Typography variant="subtitle1" fontWeight={600}>
          Historial
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {origen(cita)}
        </Typography>
      </Box>

      {isPending ? (
        <Stack spacing={1}>
          <Skeleton height={36} />
          <Skeleton height={36} />
        </Stack>
      ) : isError ? (
        <Typography variant="body2" color="error">
          No se pudo cargar el historial. Cierra la cita y vuelve a abrirla.
        </Typography>
      ) : eventos.length === 0 ? (
        <Typography variant="body2" color="textSecondary">
          Sin cambios anotados todavía.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          {eventos.map((evento) => (
            <Evento key={evento.id} evento={evento} />
          ))}
        </Stack>
      )}
    </Stack>
  );
};

export default HistorialCita;
