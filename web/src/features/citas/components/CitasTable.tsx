"use client";
import { useState } from "react";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { IconPencil, IconTrash } from "@tabler/icons-react";

import DataTable, { type Columna } from "@/components/shared/DataTable";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import { usePaginacion } from "@/hooks/usePaginacion";
import { formatFecha, formatMoneda } from "@/lib/format";
import { ESTADOS_CITA } from "../constants";
import { useCitas } from "../hooks/useCitas";
import type { Cita, EstadoCita } from "../types";

interface Props {
  onEditar: (cita: Cita) => void;
  onEliminar: (cita: Cita) => void;
}

const CitasTable = ({ onEditar, onEliminar }: Props) => {
  const { page, perPage, setPage, setPerPage, params } = usePaginacion();
  const [estado, setEstado] = useState<EstadoCita | "">("");
  const { data, isPending, error } = useCitas(params);

  // El filtro por estado se aplica en cliente mientras usamos datos ficticios.
  // Con el backend real pasa a ser un query param más de `params`.
  const datosFiltrados =
    data && estado
      ? { ...data, data: data.data.filter((cita) => cita.estado === estado) }
      : data;

  const columnas: Columna<Cita>[] = [
    {
      id: "fecha",
      label: "Fecha y hora",
      render: (cita) => (
        <>
          <Typography variant="subtitle2" fontWeight={600}>
            {formatFecha(cita.fecha)}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {cita.hora_inicio} – {cita.hora_fin}
          </Typography>
        </>
      ),
    },
    {
      id: "cliente",
      label: "Cliente",
      render: (cita) => (
        <>
          <Typography variant="subtitle2" fontWeight={600}>
            {cita.cliente_nombre}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {cita.cliente_telefono ?? "—"}
          </Typography>
        </>
      ),
    },
    {
      id: "servicio",
      label: "Servicio",
      render: (cita) => (
        <>
          <Typography variant="body2">{cita.servicio.nombre}</Typography>
          {cita.productos.length ? (
            <Typography variant="body2" color="textSecondary">
              +{cita.productos.length} producto
              {cita.productos.length > 1 ? "s" : ""}
            </Typography>
          ) : null}
        </>
      ),
    },
    {
      id: "empleado",
      label: "Atiende",
      render: (cita) => (
        <Typography variant="body2" color="textSecondary">
          {cita.empleado.nombre}
        </Typography>
      ),
    },
    {
      id: "monto",
      label: "Monto",
      align: "right",
      render: (cita) => (
        <Typography variant="subtitle2" fontWeight={600} noWrap>
          {formatMoneda(cita.monto)}
        </Typography>
      ),
    },
    {
      id: "estado",
      label: "Estado",
      render: (cita) => {
        const config = ESTADOS_CITA[cita.estado];
        return <Chip size="small" label={config.label} color={config.color} />;
      },
    },
    {
      id: "acciones",
      label: "Acciones",
      align: "right",
      render: (cita) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title="Editar">
            <IconButton size="small" color="primary" onClick={() => onEditar(cita)}>
              <IconPencil size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton size="small" color="error" onClick={() => onEliminar(cita)}>
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
        <CustomTextField
          select
          size="small"
          value={estado}
          onChange={(e: any) => setEstado(e.target.value as EstadoCita | "")}
          sx={{ minWidth: 200 }}
          slotProps={{ select: { displayEmpty: true } }}
        >
          <MenuItem value="">Todos los estados</MenuItem>
          {Object.entries(ESTADOS_CITA).map(([valor, config]) => (
            <MenuItem key={valor} value={valor}>
              {config.label}
            </MenuItem>
          ))}
        </CustomTextField>
      </Stack>

      <DataTable
        columnas={columnas}
        datos={datosFiltrados}
        cargando={isPending}
        error={error}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
        mensajeVacio="No hay citas que coincidan con el filtro."
        minWidth={1000}
      />
    </>
  );
};

export default CitasTable;
