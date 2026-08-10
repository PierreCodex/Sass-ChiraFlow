"use client";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import DataTable, { type Columna } from "@/components/shared/DataTable";
import { usePaginacion } from "@/hooks/usePaginacion";
import { useCategorias } from "../hooks/useCategorias";
import type { Categoria } from "../types";

const columnas: Columna<Categoria>[] = [
  {
    id: "nombre",
    label: "Categoría",
    render: (categoria) => (
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            bgcolor: categoria.color,
            flexShrink: 0,
          }}
        />
        <Typography variant="subtitle2" fontWeight={600}>
          {categoria.nombre}
        </Typography>
      </Stack>
    ),
  },
  {
    id: "descripcion",
    label: "Descripción",
    render: (categoria) => (
      <Typography variant="body2" color="textSecondary">
        {categoria.descripcion}
      </Typography>
    ),
  },
  {
    id: "servicios",
    label: "Servicios",
    align: "center",
    render: (categoria) => (
      <Typography variant="body2">{categoria.servicios_count}</Typography>
    ),
  },
  {
    id: "estado",
    label: "Estado",
    align: "right",
    render: (categoria) => (
      <Chip
        size="small"
        label={categoria.activa ? "Activa" : "Inactiva"}
        color={categoria.activa ? "success" : "default"}
      />
    ),
  },
];

const CategoriasTable = () => {
  const { page, perPage, setPage, setPerPage, params } = usePaginacion();
  const { data, isPending, error } = useCategorias(params);

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
    />
  );
};

export default CategoriasTable;
