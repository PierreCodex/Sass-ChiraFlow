"use client";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { IconPencil, IconTrash } from "@tabler/icons-react";

import DataTable, { type Columna } from "@/components/shared/DataTable";
import BuscadorTabla from "@/components/shared/BuscadorTabla";
import { usePaginacion } from "@/hooks/usePaginacion";
import { useCategorias } from "../hooks/useCategorias";
import type { Categoria } from "../types";

interface Props {
  onEditar: (categoria: Categoria) => void;
  onEliminar: (categoria: Categoria) => void;
}

/**
 * La miniatura de la primera columna.
 *
 * Antes, sin imagen se pintaba aquí el círculo de color. Ya no: el color tiene
 * su propia columna, y repetirlo en dos sitios haría dudar de si son dos cosas
 * distintas. Sin imagen no se muestra nada a la izquierda del nombre.
 */
const Miniatura = ({ categoria }: { categoria: Categoria }) =>
  categoria.imagen_url ? (
    <Avatar
      src={categoria.imagen_url}
      variant="rounded"
      sx={{ width: 40, height: 40 }}
    />
  ) : null;

const CategoriasTable = ({ onEditar, onEliminar }: Props) => {
  const { page, perPage, search, setPage, setPerPage, buscar, params } =
    usePaginacion();
  const { data, isPending, error } = useCategorias(params);

  /*
   * `orden` no tiene columna a propósito: la tabla YA viene ordenada por él,
   * así que el número no dice nada que la propia lista no esté enseñando. Se
   * sigue editando en el formulario, que es donde sirve de algo.
   */
  const columnas: Columna<Categoria>[] = [
    {
      id: "nombre",
      label: "Categoría",
      render: (categoria) => (
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Miniatura categoria={categoria} />
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
          {categoria.descripcion || "—"}
        </Typography>
      ),
    },
    {
      // El hexadecimal al lado del círculo: dos categorías con azules
      // parecidos se distinguen por el código, no por el ojo.
      id: "color",
      label: "Color",
      render: (categoria) =>
        categoria.color ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                bgcolor: categoria.color,
                border: "1px solid",
                borderColor: "divider",
                flexShrink: 0,
              }}
            />
            <Typography variant="body2" color="textSecondary" noWrap>
              {categoria.color.toUpperCase()}
            </Typography>
          </Stack>
        ) : (
          <Typography variant="body2" color="textSecondary">
            —
          </Typography>
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
    <>
      <Stack direction="row" justifyContent="flex-end" mb={2}>
        <BuscadorTabla
          valor={search}
          onChange={buscar}
          placeholder="Buscar por nombre o descripción…"
        />
      </Stack>

      <DataTable
        moduloEscritura="servicios"
        columnas={columnas}
        datos={data}
        cargando={isPending}
        error={error}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
        // Con el buscador puesto, "todavía no has creado" mentiría cuando lo
        // vacío es el resultado de la búsqueda.
        mensajeVacio={
          search
            ? "No se encontraron categorías."
            : "Todavía no has creado categorías."
        }
        minWidth={780}
      />
    </>
  );
};

export default CategoriasTable;
