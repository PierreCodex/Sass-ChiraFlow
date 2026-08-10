"use client";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { IconPencil, IconTrash } from "@tabler/icons-react";

import DataTable, { type Columna } from "@/components/shared/DataTable";
import BuscadorTabla from "@/components/shared/BuscadorTabla";
import { usePaginacion } from "@/hooks/usePaginacion";
import { ROLES_EMPLEADO } from "../constants";
import { useEmpleados } from "../hooks/useEmpleados";
import type { Empleado } from "../types";

interface Props {
  onEditar: (empleado: Empleado) => void;
  onEliminar: (empleado: Empleado) => void;
}

const EmpleadosTable = ({ onEditar, onEliminar }: Props) => {
  const { page, perPage, search, setPage, setPerPage, buscar, params } =
    usePaginacion();
  const { data, isPending, error } = useEmpleados(params);

  const columnas: Columna<Empleado>[] = [
    {
      id: "profesional",
      label: "Profesional",
      render: (empleado) => (
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            src={empleado.foto_url ?? undefined}
            alt={empleado.nombre}
            sx={{ width: 40, height: 40 }}
          >
            {empleado.nombre.charAt(0)}
          </Avatar>
          <Typography variant="subtitle2" fontWeight={600}>
            {empleado.nombre}
          </Typography>
        </Stack>
      ),
    },
    {
      id: "usuario",
      label: "Usuario",
      render: (empleado) => (
        <Typography variant="body2" color="textSecondary">
          {empleado.usuario}
        </Typography>
      ),
    },
    {
      id: "rol",
      label: "Rol",
      render: (empleado) => (
        <Typography variant="body2" color="textSecondary">
          {ROLES_EMPLEADO[empleado.rol] ?? empleado.rol}
        </Typography>
      ),
    },
    {
      id: "cargo",
      label: "Cargo",
      render: (empleado) => (
        <Typography variant="body2" color="textSecondary">
          {empleado.cargo || "-"}
        </Typography>
      ),
    },
    {
      id: "estado",
      label: "Estado",
      render: (empleado) => (
        <Chip
          size="small"
          label={empleado.activo ? "Activo" : "Inactivo"}
          color={empleado.activo ? "success" : "default"}
        />
      ),
    },
    {
      id: "acciones",
      label: "Acciones",
      align: "right",
      render: (empleado) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title="Editar">
            <IconButton
              size="small"
              color="primary"
              onClick={() => onEditar(empleado)}
            >
              <IconPencil size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              color="error"
              onClick={() => onEliminar(empleado)}
            >
              <IconTrash size={18} />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <>
      <Stack direction="row" justifyContent="flex-end" mb={2}>
        <BuscadorTabla
          valor={search}
          onChange={buscar}
          placeholder="Buscar empleado…"
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
        mensajeVacio="No se encontraron empleados."
        minWidth={900}
      />
    </>
  );
};

export default EmpleadosTable;
