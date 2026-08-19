"use client";
import { useState } from "react";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { IconCheck, IconPencil, IconPhoto, IconTrash, IconX } from "@tabler/icons-react";

import DataTable, { type Columna } from "@/components/shared/DataTable";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import { usePaginacion } from "@/hooks/usePaginacion";
import { formatFecha, formatMoneda } from "@/lib/format";
import { ESTADOS_CITA, ESTADOS_PAGO } from "../constants";
import { useActualizarCita, useCitas } from "../hooks/useCitas";
import type { Cita, EstadoCita } from "../types";

interface Props {
  onEditar: (cita: Cita) => void;
  onEliminar: (cita: Cita) => void;
}

const CitasTable = ({ onEditar, onEliminar }: Props) => {
  const { page, perPage, setPage, setPerPage, params } = usePaginacion();
  const [estado, setEstado] = useState<EstadoCita | "">("");
  const { data, isPending, error } = useCitas(params);
  const actualizarPago = useActualizarCita();

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
        const configPago = cita.estado_pago ? ESTADOS_PAGO[cita.estado_pago] : null;
        return (
          <Stack spacing={0.5} alignItems="flex-start">
            <Chip size="small" label={config.label} color={config.color} />
            {/* Solo las citas reservadas con "Pagar ahora" traen esto. */}
            {configPago ? (
              <Chip size="small" variant="outlined" label={configPago.label} color={configPago.color} />
            ) : null}
          </Stack>
        );
      },
    },
    {
      id: "acciones",
      label: "Acciones",
      align: "right",
      render: (cita) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
          {cita.estado_pago === "pendiente" ? (
            <>
              {cita.comprobante_pago_url ? (
                <Tooltip title="Ver comprobante">
                  <IconButton
                    size="small"
                    color="inherit"
                    component="a"
                    href={cita.comprobante_pago_url}
                    target="_blank"
                    rel="noopener"
                  >
                    <IconPhoto size={18} />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="El cliente no adjuntó captura de pago">
                  <span>
                    <IconButton size="small" disabled>
                      <IconPhoto size={18} />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
              <Tooltip title="Aceptar pago">
                <IconButton
                  size="small"
                  color="success"
                  disabled={actualizarPago.isPending}
                  onClick={() =>
                    actualizarPago.mutate({ id: cita.id, payload: { estado_pago: "confirmado" } })
                  }
                >
                  <IconCheck size={18} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Rechazar pago">
                <IconButton
                  size="small"
                  color="error"
                  disabled={actualizarPago.isPending}
                  onClick={() =>
                    actualizarPago.mutate({ id: cita.id, payload: { estado_pago: "rechazado" } })
                  }
                >
                  <IconX size={18} />
                </IconButton>
              </Tooltip>
            </>
          ) : null}
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
