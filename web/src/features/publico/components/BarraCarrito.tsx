"use client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { formatMoneda } from "@/lib/format";

interface Props {
  unidades: number;
  monto: number;
  duracion: number;
  onReservar: () => void;
}

/** "1 h 30 min" */
function formatDuracion(minutos: number) {
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  if (!horas) return `${resto} min`;
  return resto ? `${horas} h ${resto} min` : `${horas} h`;
}

/**
 * Barra fija con el resumen del carrito. Solo aparece con algo seleccionado,
 * igual que en la app actual.
 */
const BarraCarrito = ({ unidades, monto, duracion, onReservar }: Props) => {
  if (unidades === 0) return null;

  return (
    <Paper
      elevation={8}
      square
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        py: 2,
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Box minWidth={0}>
            <Typography variant="body2" color="textSecondary" noWrap>
              {unidades} servicio{unidades === 1 ? "" : "s"} ·{" "}
              {formatDuracion(duracion)}
            </Typography>
            <Typography variant="h5" fontWeight={700} noWrap>
              {formatMoneda(monto)}
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="large"
            onClick={onReservar}
            sx={{ whiteSpace: "nowrap" }}
          >
            Reservar
          </Button>
        </Stack>
      </Container>
    </Paper>
  );
};

export default BarraCarrito;
