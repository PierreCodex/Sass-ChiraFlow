"use client";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

interface Props {
  huecos: string[];
  valor: string;
  onChange: (hora: string) => void;
  cargando?: boolean;
  /** Motivo por el que no hay huecos (día libre, permiso, agenda llena…). */
  motivoVacio?: string | null;
  /** Hora que ya tenía la cita al editarla: se muestra aunque no esté libre. */
  horaActual?: string | null;
  duracionMin?: number;
}

/**
 * Chips con las horas de inicio disponibles.
 *
 * Reemplaza al input de hora libre: al ofrecer solo huecos válidos, agendar
 * fuera del horario del profesional deja de ser posible desde el panel.
 */
const SelectorHuecos = ({
  huecos,
  valor,
  onChange,
  cargando = false,
  motivoVacio,
  horaActual,
  duracionMin,
}: Props) => {
  if (cargando) {
    return (
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" width={64} height={32} />
        ))}
      </Stack>
    );
  }

  // Al editar, la hora que ya tenía la cita sigue siendo elegible aunque el
  // hueco esté ocupado por ella misma.
  const opciones =
    horaActual && !huecos.includes(horaActual)
      ? [horaActual, ...huecos].sort()
      : huecos;

  if (opciones.length === 0) {
    return (
      <Alert severity="info" variant="outlined">
        {motivoVacio ?? "No hay horarios disponibles para este día."}
      </Alert>
    );
  }

  return (
    <Box>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {opciones.map((hora) => (
          <Chip
            key={hora}
            label={hora}
            clickable
            color={valor === hora ? "primary" : "default"}
            variant={valor === hora ? "filled" : "outlined"}
            onClick={() => onChange(hora)}
          />
        ))}
      </Stack>

      {duracionMin ? (
        <Typography variant="caption" color="textSecondary" display="block" mt={1}>
          Cada cita ocupa {duracionMin} min.
        </Typography>
      ) : null}
    </Box>
  );
};

export default SelectorHuecos;
