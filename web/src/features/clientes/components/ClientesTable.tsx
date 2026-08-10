"use client";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import DataTable, { type Columna } from "@/components/shared/DataTable";
import BuscadorTabla from "@/components/shared/BuscadorTabla";
import { usePaginacion } from "@/hooks/usePaginacion";
import { formatFecha } from "@/lib/format";
import { useClientes } from "../hooks/useClientes";
import type { Cliente } from "../types";

const columnas: Columna<Cliente>[] = [
  {
    id: "nombre",
    label: "Nombre",
    render: (cliente) => (
      <Typography variant="subtitle2" fontWeight={600}>
        {cliente.nombre}
      </Typography>
    ),
  },
  {
    id: "telefono",
    label: "Teléfono",
    render: (cliente) => (
      <Typography variant="body2" color="textSecondary" noWrap>
        {cliente.telefono || "—"}
      </Typography>
    ),
  },
  {
    id: "email",
    label: "Email",
    render: (cliente) => (
      <Typography variant="body2" color="textSecondary">
        {cliente.email || "—"}
      </Typography>
    ),
  },
  {
    id: "total_citas",
    label: "Citas",
    align: "center",
    render: (cliente) => (
      <Typography variant="subtitle2" fontWeight={600}>
        {cliente.total_citas}
      </Typography>
    ),
  },
  {
    id: "ultima_cita",
    label: "Última cita",
    render: (cliente) => (
      <Typography variant="body2" color="textSecondary" noWrap>
        {cliente.ultima_cita ? formatFecha(cliente.ultima_cita) : "—"}
      </Typography>
    ),
  },
];

const ClientesTable = () => {
  const { page, perPage, search, setPage, setPerPage, buscar, params } =
    usePaginacion();
  const { data, isPending, error } = useClientes(params);

  return (
    <>
      <Stack direction="row" justifyContent="flex-end" mb={2}>
        <BuscadorTabla
          valor={search}
          onChange={buscar}
          placeholder="Buscar por nombre, teléfono o email…"
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
        mensajeVacio="No se encontraron clientes."
        minWidth={720}
      />
    </>
  );
};

export default ClientesTable;
