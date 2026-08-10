"use client";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";

import DataTable, { type Columna } from "@/components/shared/DataTable";
import { usePaginacion } from "@/hooks/usePaginacion";
import { useLocales } from "../hooks/useLocales";
import type { Local } from "../types";

const columnas: Columna<Local>[] = [
  {
    id: "nombre",
    label: "Local",
    render: (local) => (
      <Typography variant="subtitle2" fontWeight={600}>
        {local.nombre}
      </Typography>
    ),
  },
  {
    id: "direccion",
    label: "Dirección",
    render: (local) => (
      <Typography variant="body2" color="textSecondary">
        {local.direccion}
      </Typography>
    ),
  },
  {
    id: "telefono",
    label: "Teléfono",
    render: (local) => (
      <Typography variant="body2" color="textSecondary">
        {local.telefono}
      </Typography>
    ),
  },
  {
    id: "horario",
    label: "Horario",
    render: (local) => (
      <Typography variant="body2" color="textSecondary">
        {local.horario}
      </Typography>
    ),
  },
  {
    id: "empleados",
    label: "Empleados",
    align: "center",
    render: (local) => (
      <Typography variant="body2">{local.empleados_count}</Typography>
    ),
  },
  {
    id: "estado",
    label: "Estado",
    align: "right",
    render: (local) => (
      <Chip
        size="small"
        label={local.activo ? "Activo" : "Inactivo"}
        color={local.activo ? "success" : "default"}
      />
    ),
  },
];

const LocalesTable = () => {
  const { page, perPage, setPage, setPerPage, params } = usePaginacion();
  const { data, isPending, error } = useLocales(params);

  return (
    <DataTable
      columnas={columnas}
      datos={data}
      cargando={isPending}
      error={error}
      page={page}
      perPage={perPage}
      onPageChange={setPage}
      onPerPageChange={setPerPage}
      mensajeVacio="Todavía no has registrado locales."
      minWidth={860}
    />
  );
};

export default LocalesTable;
