"use client";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import DataTable, { type Columna } from "@/components/shared/DataTable";
import BuscadorTabla from "@/components/shared/BuscadorTabla";
import { usePaginacion } from "@/hooks/usePaginacion";
import { ESTADOS_TICKET, PRIORIDADES_TICKET } from "@/features/soporte/constants";
import { useTicketsSuperadmin } from "../hooks/useSoporteSuperadmin";
import SoporteFilaAccion from "./SoporteFilaAccion";
import type { TicketSuperadmin } from "../types";

const columnas: Columna<TicketSuperadmin>[] = [
  {
    id: "negocio",
    label: "Negocio",
    render: (t) => (
      <Typography variant="subtitle2" fontWeight={600} noWrap>
        {t.negocio}
      </Typography>
    ),
  },
  {
    id: "asunto",
    label: "Asunto",
    render: (t) => <Typography variant="body2">{t.asunto}</Typography>,
  },
  {
    id: "prioridad",
    label: "Prioridad",
    align: "center",
    render: (t) => {
      const { label, color } = PRIORIDADES_TICKET[t.prioridad];
      return <Chip label={label} color={color} size="small" />;
    },
  },
  {
    id: "estado",
    label: "Estado",
    align: "center",
    render: (t) => {
      const { label, color } = ESTADOS_TICKET[t.estado];
      return <Chip label={label} color={color} size="small" />;
    },
  },
  {
    id: "asignado",
    label: "Asignado a",
    render: (t) => (
      <Typography variant="body2" color="textSecondary">
        {t.respondido_por ?? "Sin asignar"}
      </Typography>
    ),
  },
  {
    id: "respuesta",
    label: "Respuesta",
    render: (t) => (
      <Typography variant="body2" color="textSecondary" noWrap sx={{ maxWidth: 160 }}>
        {t.respuesta ?? "Sin respuesta"}
      </Typography>
    ),
  },
  {
    id: "accion",
    label: "Acción",
    render: (t) => <SoporteFilaAccion ticket={t} />,
  },
];

const SoporteTable = () => {
  const { page, perPage, search, setPage, setPerPage, buscar, params } =
    usePaginacion();
  const { data, isPending, error } = useTicketsSuperadmin(params);

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="flex-end">
        <BuscadorTabla
          valor={search}
          onChange={buscar}
          placeholder="Buscar por negocio o asunto…"
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
        mensajeVacio="No hay tickets."
        minWidth={1000}
      />
    </Stack>
  );
};

export default SoporteTable;
