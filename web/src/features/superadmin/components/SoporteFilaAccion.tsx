"use client";
import { useState } from "react";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";

import { useResponderTicket } from "../hooks/useSoporteSuperadmin";
import type { TicketSuperadmin } from "../types";
import type { EstadoTicket } from "@/features/soporte/types";

interface Props {
  ticket: TicketSuperadmin;
}

/**
 * Celda "Acción" de la tabla de soporte: responder + cambiar estado + Guardar,
 * cada fila con su propio estado local — igual que el form por fila del Blade.
 */
const SoporteFilaAccion = ({ ticket }: Props) => {
  const responder = useResponderTicket();
  const [respuesta, setRespuesta] = useState("");
  const [estado, setEstado] = useState<EstadoTicket>(ticket.estado);

  return (
    <Stack spacing={1} minWidth={220}>
      <TextField
        size="small"
        placeholder="Responder"
        value={respuesta}
        onChange={(e) => setRespuesta(e.target.value)}
      />
      <Stack direction="row" spacing={1}>
        <TextField
          select
          size="small"
          value={estado}
          onChange={(e) => setEstado(e.target.value as EstadoTicket)}
          sx={{ minWidth: 130 }}
        >
          <MenuItem value="abierto">Abierto</MenuItem>
          <MenuItem value="en_proceso">En proceso</MenuItem>
          <MenuItem value="cerrado">Cerrado</MenuItem>
        </TextField>
        <Button
          size="small"
          variant="contained"
          disabled={responder.isPending}
          onClick={() =>
            responder.mutate({
              id: ticket.id,
              payload: {
                estado,
                respuesta: respuesta.trim() || ticket.respuesta,
                respondido_por: "Super Administrador",
              },
            })
          }
        >
          Guardar
        </Button>
      </Stack>
    </Stack>
  );
};

export default SoporteFilaAccion;
