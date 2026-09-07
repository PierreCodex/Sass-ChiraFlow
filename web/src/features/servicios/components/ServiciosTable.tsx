"use client";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Switch from "@mui/material/Switch";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { IconPencil, IconTrash } from "@tabler/icons-react";

import DataTable, { type Columna } from "@/components/shared/DataTable";
import BuscadorTabla from "@/components/shared/BuscadorTabla";
import { usePaginacion } from "@/hooks/usePaginacion";
import { toApiError } from "@/lib/api/client";
import { formatMoneda } from "@/lib/format";
import { TIPOS_SERVICIO } from "../constants";
import { useActualizarServicio, useServicios } from "../hooks/useServicios";
import type { Servicio, ServicioPayload } from "../types";

/**
 * Lo que hay que reenviar para cambiar solo `activo`.
 *
 * `PUT /servicios/{id}` valida el servicio entero (nombre, color, tipo,
 * precio y duración son obligatorios), así que un payload con únicamente
 * `activo` daría 422. Lo que **no** se manda no se toca: sin `empleado_ids`
 * no se desasigna a nadie, sin `galeria_conservar` no se borra ninguna foto y
 * sin archivo la imagen principal se queda donde está.
 */
const payloadDeEstado = (
  servicio: Servicio,
  activo: boolean
): Partial<ServicioPayload> => ({
  nombre: servicio.nombre,
  descripcion: servicio.descripcion,
  color: servicio.color,
  categoria_id: servicio.categoria?.id ?? null,
  tipo: servicio.tipo,
  max_sesiones: servicio.max_sesiones,
  precio: servicio.precio,
  duracion_min: servicio.duracion_min,
  activo,
});

interface Props {
  onEditar: (servicio: Servicio) => void;
  onEliminar: (servicio: Servicio) => void;
}

const ServiciosTable = ({ onEditar, onEliminar }: Props) => {
  const { page, perPage, search, setPage, setPerPage, buscar, params } =
    usePaginacion();
  const { data, isPending, error } = useServicios(params);
  const actualizar = useActualizarServicio();

  const cambiarEstado = (servicio: Servicio, activo: boolean) =>
    actualizar.mutate({
      id: servicio.id,
      payload: payloadDeEstado(servicio, activo),
    });

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
      // El formulario no trae `activo`: se enciende y se apaga aquí, que es
      // donde se ve el catálogo entero de un vistazo.
      render: (servicio) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Switch
            size="small"
            checked={servicio.activo}
            onChange={(e) => cambiarEstado(servicio, e.target.checked)}
            disabled={actualizar.isPending}
            slotProps={{
              input: {
                "aria-label": servicio.activo
                  ? `Desactivar ${servicio.nombre}`
                  : `Activar ${servicio.nombre}`,
              },
            }}
          />
          <Typography variant="body2" color="textSecondary">
            {servicio.activo ? "Activo" : "Inactivo"}
          </Typography>
        </Stack>
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
      {/* El switch guarda sin diálogo: si el guardado falla hay que decirlo,
          o la fila vuelve sola a su estado anterior sin explicación. */}
      {actualizar.isError ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => actualizar.reset()}>
          {toApiError(actualizar.error).message}
        </Alert>
      ) : null}

      <Stack direction="row" justifyContent="flex-end" mb={2}>
        <BuscadorTabla
          valor={search}
          onChange={buscar}
          placeholder="Buscar servicio…"
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
        mensajeVacio="No se encontraron servicios."
        minWidth={900}
      />
    </>
  );
};

export default ServiciosTable;
