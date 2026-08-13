"use client";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import { useHorarios } from "../hooks/useTienda";
import type { ProfesionalPublico } from "../types";

interface Props {
  slug: string;
  localId: number;
  profesionales: ProfesionalPublico[];
  duracionMin: number;
  profesionalId: number | null;
  fecha: string | null;
  hora: string | null;
  onProfesional: (id: number) => void;
  onFecha: (fecha: string) => void;
  onHora: (hora: string) => void;
}

function hoy() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Profesional → fecha → hueco, en ese orden.
 *
 * El orden importa y no es el de la app actual, que pone "Fecha y hora" antes
 * que "Profesional": los huecos **dependen** del profesional
 * (`/horarios` recibe `profesional_id`), así que no se pueden calcular antes
 * de elegirlo.
 *
 * Las horas son chips, no un campo libre: si un hueco no está en la lista, no
 * se puede reservar. Así el cliente nunca elige una hora que el negocio va a
 * tener que rechazar.
 */
const SelectorHueco = ({
  slug,
  localId,
  profesionales,
  duracionMin,
  profesionalId,
  fecha,
  hora,
  onProfesional,
  onFecha,
  onHora,
}: Props) => {
  const { data: huecos, isPending } = useHorarios(
    slug,
    localId,
    profesionalId,
    fecha,
    duracionMin
  );

  return (
    <Stack spacing={1}>
      <Box>
        <CustomFormLabel sx={{ mt: 0 }}>Profesional</CustomFormLabel>
        <CustomTextField
          select
          fullWidth
          value={profesionalId ?? ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onProfesional(Number(e.target.value))
          }
        >
          {profesionales.map((profesional) => (
            <MenuItem key={profesional.id} value={profesional.id}>
              {profesional.nombre}
            </MenuItem>
          ))}
        </CustomTextField>
      </Box>

      <Box>
        <CustomFormLabel>Fecha</CustomFormLabel>
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

        {!profesionalId || !fecha ? (
          <Typography variant="body2" color="textSecondary">
            Elige profesional y fecha para ver las horas libres.
          </Typography>
        ) : isPending ? (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" width={72} height={32} />
            ))}
          </Stack>
        ) : !huecos?.length ? (
          <Alert severity="warning">
            No hay horas libres ese día. Prueba con otra fecha u otro
            profesional.
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

export default SelectorHueco;
