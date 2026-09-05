"use client";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { IconPencil, IconTrash } from "@tabler/icons-react";

import DataTable, { type Columna } from "@/components/shared/DataTable";
import { usePaginacion } from "@/hooks/usePaginacion";
import { useGrupos } from "../hooks/useRecursos";
import type { Grupo } from "../types";

interface Props {
  onEditar: (grupo: Grupo) => void;
  onEliminar: (grupo: Grupo) => void;
}

/** Lista de nombres separados por coma, o "—" si está vacía. */
function nombres(items: { nombre: string }[]) {
  return items.length ? items.map((item) => item.nombre).join(", ") : "—";
}

const GruposTable = ({ onEditar, onEliminar }: Props) => {
  const { page, perPage, setPage, setPerPage, params } = usePaginacion();
  const { data, isPending, error } = useGrupos(params);

  const columnas: Columna<Grupo>[] = [
    {
      id: "nombre",
      label: "Nombre",
      render: (grupo) => (
        <Typography variant="subtitle2" fontWeight={600}>
          {grupo.nombre}
        </Typography>
      ),
    },
    {
      id: "locales",
      label: "Locales",
      render: (grupo) =>
        grupo.locales.length ? (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {grupo.locales.map((local) => (
              <Chip key={local.id} size="small" label={local.nombre} />
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="textSecondary">
            —
          </Typography>
        ),
    },
    {
      // El Blade solo lista los locales, pero el grupo también agrupa
      // profesionales y servicios: sin verlos no se sabe qué contiene.
      id: "profesionales",
      label: "Profesionales",
      render: (grupo) => (
        <Typography variant="body2" color="textSecondary">
          {nombres(grupo.profesionales)}
        </Typography>
      ),
    },
    {
      id: "servicios",
      label: "Servicios",
      align: "center",
      render: (grupo) => (
        <Typography variant="body2" color="textSecondary">
          {grupo.servicios.length || "—"}
        </Typography>
      ),
    },
    {
      id: "acciones",
      label: "Acciones",
      align: "right",
      render: (grupo) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => onEditar(grupo)}>
              <IconPencil size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              color="error"
              onClick={() => onEliminar(grupo)}
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
        moduloEscritura="locales"
      columnas={columnas}
      datos={data}
      cargando={isPending}
      error={error}
      page={page}
      perPage={perPage}
      onPageChange={setPage}
      onPerPageChange={setPerPage}
      mensajeVacio="Aún no hay grupos."
      minWidth={820}
    />
  );
};

export default GruposTable;
