"use client";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { IconCircleCheck } from "@tabler/icons-react";

import { formatFechaLarga, formatMoneda } from "@/lib/format";
import type { ReservaConfirmada } from "../types";

interface Props {
  reserva: ReservaConfirmada;
  onVolver: () => void;
}

/** Comprobante posterior a reservar. Equivale a `reservar/confirmacion`. */
const ComprobanteReserva = ({ reserva, onVolver }: Props) => (
  <Card>
    <CardContent sx={{ p: 4, textAlign: "center" }}>
      <Box sx={{ color: "success.main", display: "flex", justifyContent: "center" }}>
        <IconCircleCheck size={56} />
      </Box>

      <Typography variant="h4" fontWeight={700} mt={2}>
        ¡Reserva registrada!
      </Typography>
      <Typography color="textSecondary" mt={1}>
        Código <strong>{reserva.codigo}</strong>
      </Typography>

      <Alert severity="info" sx={{ my: 3, textAlign: "left" }}>
        Tu reserva queda <strong>pendiente de confirmación</strong>. El negocio
        la revisará y te avisará por correo o WhatsApp.
      </Alert>

      <Stack spacing={2} sx={{ textAlign: "left" }}>
        {reserva.citas.map((cita) => (
          <Box key={cita.id}>
            <Typography variant="subtitle1" fontWeight={600}>
              {cita.servicio}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {formatFechaLarga(cita.fecha)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {cita.hora_inicio} – {cita.hora_fin} · {cita.profesional}
            </Typography>
          </Box>
        ))}
      </Stack>

      <Divider sx={{ my: 3 }} />

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle1" fontWeight={600}>
          Total
        </Typography>
        <Typography variant="h5" fontWeight={700}>
          {formatMoneda(reserva.total)}
        </Typography>
      </Stack>

      <Button fullWidth variant="outlined" sx={{ mt: 3 }} onClick={onVolver}>
        Reservar otra cita
      </Button>
    </CardContent>
  </Card>
);

export default ComprobanteReserva;
