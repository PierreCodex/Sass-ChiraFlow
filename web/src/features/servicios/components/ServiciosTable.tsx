"use client";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { IconPencil, IconTrash } from "@tabler/icons-react";

import DataTable, { type Columna } from "@/components/shared/DataTable";
import BuscadorTabla from "@/components/shared/BuscadorTabla";
import { usePaginacion } from "@/hooks/usePaginacion";
import { formatMoneda } from "@/lib/format";
import { TIPOS_SERVICIO } from "../constants";
import { useServicios } from "../hooks/useServicios";
import type { Servicio } from "../types";

interface Props {
  onEditar: (servicio: Servicio) => void;
  onEliminar: (servicio: Servicio) => void;
}

const ServiciosTable = ({ onEditar, onEliminar }: Props) => {
  const { page, perPage, search, setPage, setPerPage, buscar, params } =
    usePaginacion();
  const { data, isPending, error } = useServicios(params);

  const columnas: Columna<Servicio>[] = [
    {
      id: "nombre",
      label: "Nombre",
      render: (servicio) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: servicio.color,
              flexShrink: 0,
            }}
          />
          <Typography variant="subtitle2" fontWeight={600}>
            {servicio.nombre}
          </Typography>
        </Stack>
      ),
    },
    {
      id: "categoria",
      label: "Categoría",
      render: (servicio) => (
        <Typography variant="body2" color="textSecondary">
          {servicio.categoria?.nombre ?? "-"}
        </Typography>
      ),
    },
    {
      id: "tipo",
      label: "Tipo",
      render: (servicio) => (
        <Typography variant="body2" color="textSecondary">
          {TIPOS_SERVICIO[servicio.tipo] ?? servicio.tipo}
        </Typography>
      ),
    },
    {
      id: "duracion",
      label: "Duración",
      render: (servicio) => (
        <Typography variant="body2" color="textSecondary" noWrap>
          {servicio.duracion_min} min
        </Typography>
      ),
    },
    {
      id: "precio",
      label: "Precio",
      align: "right",
      render: (servicio) => (
        <Typography variant="subtitle2" fontWeight={600} noWrap>
          {formatMoneda(servicio.precio)}
        </Typography>
      ),
    },
    {
      id: "estado",
      label: "Estado",
      render: (servicio) => (
        <Chip
          size="small"
          label={servicio.activo ? "Activo" : "Inactivo"}
          color={servicio.activo ? "success" : "default"}
        />
      ),
    },
    {
      id: "acciones",
      label: "Acciones",
      align: "right",
      render: (servicio) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title="Editar">
            <IconButton
              size="small"
              color="primary"
              onClick={() => onEditar(servicio)}
            >
              <IconPencil size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              color="error"
              onClick={() => onEliminar(servicio)}
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
          placeholder="Buscar servicio…"
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
        mensajeVacio="No se encontraron servicios."
        minWidth={900}
      />
    </>
  );
};

export default ServiciosTable;
