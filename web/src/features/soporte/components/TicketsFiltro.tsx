"use client";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

import { ESTADOS_TICKET } from "../constants";
import { useTodosLosTickets } from "../hooks/useTickets";
import type { EstadoTicket } from "../types";

/**
 * Caja de conteo clicable, tal cual el `TicketFilter` de la plantilla
 * (`app/components/apps/tickets/TicketFilter.tsx`).
 */
const CajaFiltro = styled(Box, {
  shouldForwardProp: (prop) => prop !== "activa",
})<{ activa: boolean }>(({ theme, activa }) => ({
  padding: "24px",
  borderRadius: theme.shape.borderRadius,
  transition: "0.1s ease-in",
  cursor: "pointer",
  textAlign: "center",
  outline: activa ? `2px solid ${theme.palette.text.primary}` : "none",
  outlineOffset: -2,
  "&:hover": {
    transform: "scale(1.03)",
  },
}));

/** Estado seleccionado; `null` = todos. */
export type FiltroEstado = EstadoTicket | null;

interface Props {
  valor: FiltroEstado;
  onChange: (estado: FiltroEstado) => void;
}

const TicketsFiltro = ({ valor, onChange }: Props) => {
  const { data: tickets, isPending } = useTodosLosTickets();

  // El renombrado rompe el estrechado del union de React Query: hay que
  // comprobar `tickets` a mano.
  if (isPending || !tickets) {
    return (
      <Grid container spacing={3}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Grid key={i} size={{ xs: 6, lg: 3 }}>
            <Skeleton variant="rounded" height={104} />
          </Grid>
        ))}
      </Grid>
    );
  }

  const cajas: {
    estado: FiltroEstado;
    titulo: string;
    total: number;
    bg: string;
    fg: string;
  }[] = [
    {
      estado: null,
      titulo: "Todos",
      total: tickets.length,
      // Neutro a propósito: "Todos" no es un estado. Además `primary.light`
      // no se invierte en modo oscuro y quedaría un bloque casi blanco.
      bg: "grey.100",
      fg: "text.primary",
    },
    ...(Object.keys(ESTADOS_TICKET) as EstadoTicket[]).map((estado) => ({
      estado,
      titulo: ESTADOS_TICKET[estado].label,
      total: tickets.filter((ticket) => ticket.estado === estado).length,
      bg: `${ESTADOS_TICKET[estado].color}.light`,
      fg: `${ESTADOS_TICKET[estado].color}.main`,
    })),
  ];

  return (
    <Grid container spacing={3}>
      {cajas.map((caja) => (
        <Grid key={caja.titulo} size={{ xs: 6, lg: 3 }}>
          <CajaFiltro
            activa={valor === caja.estado}
            onClick={() => onChange(caja.estado)}
            sx={{ backgroundColor: caja.bg, color: caja.fg }}
          >
            <Typography variant="h3">{caja.total}</Typography>
            <Typography variant="h6">{caja.titulo}</Typography>
          </CajaFiltro>
        </Grid>
      ))}
    </Grid>
  );
};

export default TicketsFiltro;
