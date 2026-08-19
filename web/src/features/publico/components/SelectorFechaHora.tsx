"use client";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import { useHorariosAgregados } from "../hooks/useTienda";

interface Props {
  slug: string;
  localId: number;
  duracionMin: number;
  /** Todos los profesionales candidatos: la hora es libre si alguno la tiene. */
  profesionalIds: number[];
  fecha: string | null;
  hora: string | null;
  onFecha: (fecha: string) => void;
  onHora: (hora: string) => void;
}

function hoy() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Paso "Fecha y hora" del wizard, ANTES de elegir profesional: la hora que
 * se ofrece es la unión de huecos de todos los profesionales dados (basta
 * con que uno esté libre). El paso "Profesional" que sigue filtra a quién
 * realmente le queda esa hora.
 */
const SelectorFechaHora = ({
  slug,
  localId,
  duracionMin,
  profesionalIds,
  fecha,
  hora,
  onFecha,
  onHora,
}: Props) => {
  const { data: huecos, isPending } = useHorariosAgregados(
    slug,
    localId,
    profesionalIds,
    fecha,
    duracionMin
  );

  return (
    <Stack spacing={1}>
      <Box>
        <CustomFormLabel sx={{ mt: 0 }}>Fecha</CustomFormLabel>
        <CustomTextField
          type="date"
          fullWidth
          value={fecha ?? ""}
          slotProps={{ htmlInput: { min: hoy() } }}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onFecha(e.target.value)
          }
        />
      </Box>

      <Box>
        <CustomFormLabel>Hora</CustomFormLabel>

        {!fecha ? (
          <Typography variant="body2" color="textSecondary">
            Elige una fecha para ver las horas libres.
          </Typography>
        ) : isPending ? (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" width={72} height={32} />
            ))}
          </Stack>
        ) : !huecos?.length ? (
          <Alert severity="warning">
            No hay horas libres ese día. Prueba con otra fecha.
          </Alert>
        ) : (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {huecos.map((libre) => (
              <Chip
                key={libre}
                label={libre}
                color={libre === hora ? "primary" : "default"}
                variant={libre === hora ? "filled" : "outlined"}
                onClick={() => onHora(libre)}
              />
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  );
};

export default SelectorFechaHora;
