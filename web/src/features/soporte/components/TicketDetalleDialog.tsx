"use client";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { dialogoResponsive } from "@/components/shared/estilos-formulario";
import { IconHeadset, IconUser } from "@tabler/icons-react";

import { formatFecha, formatHora } from "@/lib/format";
import { ESTADOS_TICKET, PRIORIDADES_TICKET } from "../constants";
import type { Ticket } from "../types";

interface Props {
  ticket: Ticket | null;
  onCerrar: () => void;
}

interface MensajeProps {
  autor: string;
  fecha: string;
  texto: string;
  deSoporte?: boolean;
}

/** Un turno de la conversación. El de soporte va resaltado. */
const Mensaje = ({ autor, fecha, texto, deSoporte = false }: MensajeProps) => (
  <Box
    sx={{
      p: 2,
      borderRadius: 1,
      // `info.light` y `grey.100` se invierten en modo oscuro; `primary.light`
      // no (sigue siendo #ECF2FF) y dejaría el texto ilegible.
      bgcolor: deSoporte ? "info.light" : "grey.100",
    }}
  >
    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
      <Box
        sx={{
          display: "flex",
          color: deSoporte ? "info.main" : "text.secondary",
        }}
      >
        {deSoporte ? <IconHeadset size={18} /> : <IconUser size={18} />}
      </Box>
      <Typography variant="subtitle2" fontWeight={600}>
        {autor}
      </Typography>
      <Typography variant="caption" color="textSecondary">
        {formatFecha(fecha)} · {formatHora(fecha)}
      </Typography>
    </Stack>
    <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
      {texto}
    </Typography>
  </Box>
);

/**
 * El mensaje y la respuesta no caben en la tabla: aquí se leen completos,
 * como una conversación de dos turnos.
 */
const TicketDetalleDialog = ({ ticket, onCerrar }: Props) => {
  const estado = ticket ? ESTADOS_TICKET[ticket.estado] : null;
  const prioridad = ticket ? PRIORIDADES_TICKET[ticket.prioridad] : null;

  return (
    <Dialog
      sx={dialogoResponsive} open={!!ticket} onClose={onCerrar} fullWidth maxWidth="sm">
      {ticket ? (
        <>
          <DialogTitle component="div">
            <Typography variant="h5" fontWeight={600}>
              {ticket.asunto}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" mt={1}>
              <Chip size="small" color={estado!.color} label={estado!.label} />
              <Chip
                size="small"
                color={prioridad!.color}
                label={`Prioridad ${prioridad!.label.toLowerCase()}`}
              />
              <Typography variant="caption" color="textSecondary">
                Ticket #{ticket.id}
              </Typography>
            </Stack>
          </DialogTitle>

          <Divider />

          <DialogContent>
            <Stack spacing={2}>
              <Mensaje
                autor={ticket.autor}
                fecha={ticket.creado_en}
                texto={ticket.mensaje}
              />

              {ticket.respuesta ? (
                <Mensaje
                  autor={ticket.respondido_por ?? "Soporte"}
                  fecha={ticket.actualizado_en}
                  texto={ticket.respuesta}
                  deSoporte
                />
              ) : (
                <Alert severity="info" variant="outlined">
                  Todavía no hay respuesta. Te avisaremos en cuanto el equipo
                  revise tu ticket.
                </Alert>
              )}
            </Stack>
          </DialogContent>

          <Divider />

          <DialogActions sx={{ p: 3 }}>
            <Button onClick={onCerrar} variant="contained">
              Cerrar
            </Button>
          </DialogActions>
        </>
      ) : null}
    </Dialog>
  );
};

export default TicketDetalleDialog;
