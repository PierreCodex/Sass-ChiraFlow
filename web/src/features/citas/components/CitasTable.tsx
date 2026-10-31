"use client";
import { useMemo, useState } from "react";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { IconBrandWhatsapp, IconFileInvoice, IconPencil, IconTrash } from "@tabler/icons-react";

import DataTable, { type Columna } from "@/components/shared/DataTable";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import { usePaginacion } from "@/hooks/usePaginacion";
import { formatFecha, formatMoneda } from "@/lib/format";
import { ESTADOS_CITA } from "../constants";
import { useNegocio } from "@/features/configuracion/hooks/useConfiguracion";
import { usePermisos } from "@/features/capacidades/hooks/useCapacidades";
import DialogoComprobante from "@/features/comprobantes/components/DialogoComprobante";
import DialogoEmitirComprobante, {
  type BorradorComprobante,
} from "@/features/comprobantes/components/DialogoEmitirComprobante";
import { useComprobantes } from "@/features/comprobantes/hooks/useComprobantes";
import { numeroComprobante, type Comprobante } from "@/features/comprobantes/types";
import { useCitas } from "../hooks/useCitas";
import { admiteComprobante, borradorDesdeCita } from "../comprobante";
import { enlaceRecordatorio } from "../recordatorio";
import { nombreDeServicios, type Cita, type EstadoCita } from "../types";

interface Props {
  onEditar: (cita: Cita) => void;
  onEliminar: (cita: Cita) => void;
}

const CitasTable = ({ onEditar, onEliminar }: Props) => {
  const { page, perPage, setPage, setPerPage, params } = usePaginacion();
  const [estado, setEstado] = useState<EstadoCita | "">("");

  // El filtro viaja como query param (`?estado=`), no se aplica en cliente:
  // filtrar la página ya traída enseñaría «3 de 47» sin decir de dónde salen.
  const consulta = useMemo(
    () => ({ ...params, estado: estado || undefined }),
    [params, estado]
  );
  const { data, isPending, error } = useCitas(consulta);
  const { data: negocio } = useNegocio();

  // Los comprobantes son dinero de la caja (como en el menú): quien solo
  // agenda no los emite.
  const { puedeGestionar: puedeCobrar } = usePermisos("caja");
  const { data: comprobantes } = useComprobantes();
  const [borrador, setBorrador] = useState<BorradorComprobante | null>(null);
  const [comprobanteAbierto, setComprobanteAbierto] = useState<Comprobante | null>(null);

  // Si la cita ya tiene uno vigente, el botón lo abre en vez de emitir otro.
  const comprobanteDe = (cita: Cita) =>
    comprobantes?.find(
      (item) => item.reserva_codigo === cita.codigo && item.estado === "emitido"
    ) ?? null;

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
          <Typography variant="body2">{nombreDeServicios(cita)}</Typography>
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
      // `monto_total`, no `monto`: lo que se cobra incluye los productos.
      render: (cita) => (
        <Typography variant="subtitle2" fontWeight={600} noWrap>
          {formatMoneda(cita.monto_total)}
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
      render: (cita) => {
        const recordatorio = enlaceRecordatorio(cita, negocio);
        return (
          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
            <Tooltip
              title={
                recordatorio
                  ? "Recordar por WhatsApp"
                  : cita.cliente_telefono
                    ? "Esta cita ya no necesita recordatorio"
                    : "El cliente no dejó celular"
              }
            >
              {/* El span deja ver el tooltip aunque el botón esté desactivado. */}
              <span>
                <IconButton
                  size="small"
                  color="success"
                  disabled={!recordatorio}
                  href={recordatorio ?? ""}
                  target="_blank"
                  rel="noreferrer"
                >
                  <IconBrandWhatsapp size={18} />
                </IconButton>
              </span>
            </Tooltip>
            {puedeCobrar ? (
              <Tooltip
                title={
                  comprobanteDe(cita)
                    ? `Ver comprobante ${numeroComprobante(comprobanteDe(cita)!)}`
                    : admiteComprobante(cita)
                      ? "Generar comprobante"
                      : "Una cita cancelada o sin asistencia no se cobra"
                }
              >
                <span>
                  <IconButton
                    size="small"
                    color="secondary"
                    disabled={!comprobanteDe(cita) && !admiteComprobante(cita)}
                    onClick={() => {
                      const existente = comprobanteDe(cita);
                      if (existente) setComprobanteAbierto(existente);
                      else setBorrador(borradorDesdeCita(cita));
                    }}
                  >
                    <IconFileInvoice size={18} />
                  </IconButton>
                </span>
              </Tooltip>
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
        );
      },
    },
  ];

  return (
    <>
      <Stack direction="row" justifyContent="flex-end" mb={2}>
        <CustomTextField
          select
          size="small"
          value={estado}
          onChange={(e: any) => {
            setEstado(e.target.value as EstadoCita | "");
            setPage(0); // el filtro cambia el total: la página 4 puede no existir
          }}
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
        moduloEscritura="citas"
        columnas={columnas}
        datos={data}
        cargando={isPending}
        error={error}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
        mensajeVacio="No hay citas que coincidan con el filtro."
        minWidth={1000}
      />

      <DialogoEmitirComprobante
        borrador={borrador}
        onCerrar={() => setBorrador(null)}
        onEmitido={(comprobante) => {
          setBorrador(null);
          setComprobanteAbierto(comprobante);
        }}
      />
      <DialogoComprobante
        comprobante={comprobanteAbierto}
        onCerrar={() => setComprobanteAbierto(null)}
      />
    </>
  );
};

export default CitasTable;
