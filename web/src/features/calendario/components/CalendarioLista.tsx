"use client";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { formatMoneda } from "@/lib/format";
import { ESTADOS_CITA } from "@/features/citas/constants";
import {
  colorDeCita,
  nombreDeServicios,
  type Cita,
} from "@/features/citas/types";

interface Props {
  citas: Cita[];
  onSeleccionarCita: (cita: Cita) => void;
}

/** Vista "Lista": las citas del día en orden de hora. */
const CalendarioLista = ({ citas, onSeleccionarCita }: Props) => {
  if (citas.length === 0) {
    return (
      <Box py={6} textAlign="center">
        <Typography color="textSecondary">
          No hay citas para este día.
        </Typography>
      </Box>
    );
  }

  const ordenadas = [...citas].sort((a, b) =>
    a.hora_inicio.localeCompare(b.hora_inicio)
  );

  return (
    <Stack divider={<Divider flexItem />}>
      {ordenadas.map((cita) => {
        const estado = ESTADOS_CITA[cita.estado];

        return (
          <Stack
            key={cita.id}
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", sm: "center" }}
            py={2}
            onClick={() => onSeleccionarCita(cita)}
            sx={{
              cursor: "pointer",
              "&:hover": { bgcolor: "action.hover" },
              px: 1,
              borderRadius: 1,
            }}
          >
            <Box
              sx={{
                width: 4,
                alignSelf: "stretch",
                minHeight: 40,
                borderRadius: 2,
                bgcolor: colorDeCita(cita),
                display: { xs: "none", sm: "block" },
              }}
            />

            <Typography variant="subtitle2" fontWeight={700} sx={{ minWidth: 110 }}>
              {cita.hora_inicio} – {cita.hora_fin}
            </Typography>

            <Box flexGrow={1} minWidth={0}>
              <Typography variant="subtitle2" fontWeight={600} noWrap>
                {cita.cliente_nombre}
              </Typography>
              <Typography variant="body2" color="textSecondary" noWrap>
                {nombreDeServicios(cita)}
                {` · ${cita.empleado.nombre}`}
              </Typography>
            </Box>

            <Typography variant="subtitle2" fontWeight={600}>
              {formatMoneda(cita.monto_total)}
            </Typography>

            <Chip size="small" label={estado.label} color={estado.color} />
          </Stack>
        );
      })}
    </Stack>
  );
};

export default CalendarioLista;
