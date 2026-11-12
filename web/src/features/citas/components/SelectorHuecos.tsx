"use client";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

interface Props {
  huecos: string[];
  /** Horas que chocan con otra cita: se ven en gris y no se pueden elegir. */
  ocupadas?: string[];
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
  ocupadas = [],
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

  // Las libres y las ocupadas, en orden: el día se ve entero.
  const libres = new Set(opciones);
  const todas = [...new Set([...opciones, ...ocupadas])].sort();

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
        {todas.map((hora) =>
          libres.has(hora) ? (
            <Chip
              key={hora}
              label={hora}
              clickable
              color={valor === hora ? "primary" : "default"}
              variant={valor === hora ? "filled" : "outlined"}
              onClick={() => onChange(hora)}
            />
          ) : (
            // El span deja que el tooltip funcione sobre un chip deshabilitado.
            <Tooltip key={hora} title="Ocupado: ya hay una cita a esta hora">
              <span>
                <Chip
                  label={hora}
                  disabled
                  variant="outlined"
                  sx={{ textDecoration: "line-through" }}
                />
              </span>
            </Tooltip>
          )
        )}
      </Stack>

      {duracionMin ? (
        <Typography variant="caption" color="textSecondary" display="block" mt={1}>
          Cada cita ocupa {duracionMin} min.
          {ocupadas.length ? " Las tachadas ya están ocupadas." : ""}
        </Typography>
      ) : null}
    </Box>
  );
};

export default SelectorHuecos;
