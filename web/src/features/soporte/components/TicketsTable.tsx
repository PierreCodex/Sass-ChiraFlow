"use client";
import { useEffect, useMemo } from "react";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { IconEye } from "@tabler/icons-react";

import DataTable, { type Columna } from "@/components/shared/DataTable";
import BuscadorTabla from "@/components/shared/BuscadorTabla";
import { usePaginacion } from "@/hooks/usePaginacion";
import { formatFecha } from "@/lib/format";
import { ESTADOS_TICKET, PRIORIDADES_TICKET } from "../constants";
import { useTickets } from "../hooks/useTickets";
import type { Ticket } from "../types";

interface Props {
  /** Estado seleccionado en las cajas de arriba; null = todos. */
  filtroEstado: Ticket["estado"] | null;
  onVer: (ticket: Ticket) => void;
}

const TicketsTable = ({ filtroEstado, onVer }: Props) => {
  const { page, perPage, search, setPage, setPerPage, buscar, params } =
    usePaginacion();

  const paramsConFiltro = useMemo(
    () => ({ ...params, estado: filtroEstado ?? undefined }),
    [params, filtroEstado]
  );

  // Al cambiar de estado la página actual puede quedar fuera de rango.
  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroEstado]);

  const { data, isPending, error } = useTickets(paramsConFiltro);

  const columnas: Columna<Ticket>[] = [
    {
      id: "asunto",
      label: "Asunto",
      render: (ticket) => (
        <>
          <Typography variant="subtitle2" fontWeight={600}>
            {ticket.asunto}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {formatFecha(ticket.creado_en)} · {ticket.autor}
          </Typography>
        </>
      ),
    },
    {
      id: "prioridad",
      label: "Prioridad",
      align: "center",
      render: (ticket) => {
        const { label, color } = PRIORIDADES_TICKET[ticket.prioridad];
        return <Chip size="small" color={color} label={label} />;
      },
    },
    {
      id: "estado",
      label: "Estado",
      align: "center",
      render: (ticket) => {
        const { label, color } = ESTADOS_TICKET[ticket.estado];
        return <Chip size="small" color={color} label={label} />;
      },
    },
    {
      id: "respuesta",
      label: "Respuesta",
      // El mensaje completo no cabe en una celda: aquí solo se indica si hay
      // respuesta y el texto se lee en el detalle.
      render: (ticket) =>
        ticket.respuesta ? (
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {ticket.respuesta}
          </Typography>
        ) : (
          <Typography variant="body2" color="textSecondary" fontStyle="italic">
            Sin respuesta
          </Typography>
        ),
    },
    {
      id: "acciones",
      label: "",
      align: "right",
      render: (ticket) => (
        <Tooltip title="Ver conversación">
          <IconButton size="small" color="primary" onClick={() => onVer(ticket)}>
            <IconEye size={18} />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <Stack direction="row" justifyContent="flex-end" mb={2}>
        <BuscadorTabla
          valor={search}
          onChange={buscar}
          placeholder="Buscar ticket…"
        />
      </Stack>

      <DataTable
        columnas={columnas}
        datos={data}
        cargando={isPending}
        error={error}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
        mensajeVacio={
          filtroEstado || search
            ? "Ningún ticket coincide con el filtro."
            : "Todavía no has abierto ningún ticket."
        }
        minWidth={820}
      />
    </>
  );
};

export default TicketsTable;
