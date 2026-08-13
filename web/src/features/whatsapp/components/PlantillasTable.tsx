"use client";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { IconPencil, IconTrash } from "@tabler/icons-react";

import DataTable, { type Columna } from "@/components/shared/DataTable";
import BuscadorTabla from "@/components/shared/BuscadorTabla";
import { usePaginacion } from "@/hooks/usePaginacion";
import { EVENTOS_WHATSAPP } from "../constants";
import { usePlantillas } from "../hooks/usePlantillas";
import type { PlantillaWhatsapp } from "../types";

interface Props {
  onEditar: (plantilla: PlantillaWhatsapp) => void;
  onEliminar: (plantilla: PlantillaWhatsapp) => void;
}

const PlantillasTable = ({ onEditar, onEliminar }: Props) => {
  const { page, perPage, search, setPage, setPerPage, buscar, params } =
    usePaginacion();
  const { data, isPending, error } = usePlantillas(params);

  const columnas: Columna<PlantillaWhatsapp>[] = [
    {
      id: "evento",
      label: "Evento",
      render: (plantilla) => (
        <Typography variant="subtitle2" fontWeight={600}>
          {EVENTOS_WHATSAPP[plantilla.evento] ?? plantilla.evento}
        </Typography>
      ),
    },
    {
      id: "nombre",
      label: "Nombre",
      render: (plantilla) => (
        <Typography variant="body2">{plantilla.nombre}</Typography>
      ),
    },
    {
      id: "contenido",
      label: "Vista previa",
      // El contenido llega a 2000 caracteres: en la celda solo caben dos líneas.
      render: (plantilla) => (
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            maxWidth: 380,
          }}
        >
          {plantilla.contenido}
        </Typography>
      ),
    },
    {
      id: "activo",
      label: "Estado",
      align: "center",
      render: (plantilla) => (
        <Chip
          size="small"
          color={plantilla.activo ? "success" : "default"}
          label={plantilla.activo ? "Activa" : "Inactiva"}
        />
      ),
    },
    {
      id: "acciones",
      label: "Acciones",
      align: "right",
      render: (plantilla) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => onEditar(plantilla)}>
              <IconPencil size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              color="error"
              onClick={() => onEliminar(plantilla)}
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
          placeholder="Buscar plantilla…"
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
        mensajeVacio="Todavía no hay plantillas. Empieza por una prediseñada."
        minWidth={900}
      />
    </>
  );
};

export default PlantillasTable;
