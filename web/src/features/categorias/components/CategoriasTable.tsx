"use client";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { IconPencil, IconTrash } from "@tabler/icons-react";

import DataTable, { type Columna } from "@/components/shared/DataTable";
import { usePaginacion } from "@/hooks/usePaginacion";
import { useCategorias } from "../hooks/useCategorias";
import type { Categoria } from "../types";

interface Props {
  onEditar: (categoria: Categoria) => void;
  onEliminar: (categoria: Categoria) => void;
}

/**
 * Igual que el Blade: manda la imagen; si no hay, el círculo de color; y si
 * tampoco hay color, no se muestra nada a la izquierda del nombre.
 */
const Marca = ({ categoria }: { categoria: Categoria }) => {
  if (categoria.imagen_url) {
    return (
      <Avatar
        src={categoria.imagen_url}
        variant="rounded"
        sx={{ width: 40, height: 40 }}
      />
    );
  }

  if (categoria.color) {
    return (
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          bgcolor: categoria.color,
          flexShrink: 0,
        }}
      />
    );
  }

  return null;
};

const CategoriasTable = ({ onEditar, onEliminar }: Props) => {
  const { page, perPage, setPage, setPerPage, params } = usePaginacion();
  const { data, isPending, error } = useCategorias(params);

  const columnas: Columna<Categoria>[] = [
    {
      id: "nombre",
      label: "Categoría",
      render: (categoria) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Marca categoria={categoria} />
          <div>
            <Typography variant="subtitle2" fontWeight={600}>
              {categoria.nombre}
            </Typography>
            {categoria.descripcion ? (
              <Typography variant="body2" color="textSecondary">
                {categoria.descripcion}
              </Typography>
            ) : null}
          </div>
        </Stack>
      ),
    },
    {
      id: "servicios",
      label: "Servicios",
      align: "center",
      render: (categoria) => (
        <Typography variant="subtitle2" fontWeight={600}>
          {categoria.servicios_count}
        </Typography>
      ),
    },
    {
      id: "orden",
      label: "Orden",
      align: "center",
      render: (categoria) => (
        <Typography variant="body2" color="textSecondary">
          {categoria.orden}
        </Typography>
      ),
    },
    {
      id: "acciones",
      label: "Acciones",
      align: "right",
      render: (categoria) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title="Editar">
            <IconButton
              size="small"
              color="primary"
              onClick={() => onEditar(categoria)}
            >
              <IconPencil size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              color="error"
              onClick={() => onEliminar(categoria)}
            >
              <IconTrash size={18} />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

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
      mensajeVacio="Todavía no has creado categorías."
      minWidth={620}
    />
  );
};

export default CategoriasTable;
