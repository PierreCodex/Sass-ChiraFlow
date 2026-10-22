"use client";
import { useMemo, useState } from "react";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { IconPlus } from "@tabler/icons-react";

import PageContainer from "@/components/container/PageContainer";
import AvisoError from "@/components/shared/AvisoError";
import BuscadorTabla from "@/components/shared/BuscadorTabla";
import DashboardCard from "@/components/shared/DashboardCard";
import EncabezadoPagina from "@/components/shared/EncabezadoPagina";
import { formatFecha, formatMoneda } from "@/lib/format";

import DialogoComprobante from "@/features/comprobantes/components/DialogoComprobante";
import DialogoEmitirComprobante, {
  type BorradorComprobante,
} from "@/features/comprobantes/components/DialogoEmitirComprobante";
import { useComprobantes } from "@/features/comprobantes/hooks/useComprobantes";
import {
  ETIQUETA_DOCUMENTO,
  numeroComprobante,
  type Comprobante,
} from "@/features/comprobantes/types";

const BORRADOR_VACIO: BorradorComprobante = {
  reserva_codigo: null,
  metodo_pago: null,
  cliente: {},
  lineas: [],
};

/**
 * Comprobantes entregados a los clientes. Prototipo — responde con mocks.
 *
 * Se emiten desde un pago verificado (Pagos → Ver) o a mano, para lo que se
 * cobra en el local.
 */
export default function ComprobantesPage() {
  const { data, isPending, isError, error } = useComprobantes();
  const [busqueda, setBusqueda] = useState("");
  const [borrador, setBorrador] = useState<BorradorComprobante | null>(null);
  const [abierto, setAbierto] = useState<Comprobante | null>(null);

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return data ?? [];
    return (data ?? []).filter((item) =>
      [numeroComprobante(item), item.cliente.nombre, item.cliente.numero_documento, item.reserva_codigo]
        .filter(Boolean)
        .some((valor) => String(valor).toLowerCase().includes(texto))
    );
  }, [data, busqueda]);

  // El que está abierto se lee de la lista, para que se vea anulado al anularlo.
  const abiertoActual = abierto
    ? (data?.find((item) => item.id === abierto.id) ?? abierto)
    : null;

  return (
    <PageContainer title="Comprobantes" description="Comprobantes de pago a clientes">
      <EncabezadoPagina
        titulo="Comprobantes"
        descripcion="Lo que entregas a tus clientes cuando te pagan."
        acciones={
          <Button
            variant="contained"
            startIcon={<IconPlus size={18} />}
            onClick={() => setBorrador(BORRADOR_VACIO)}
          >
            Nuevo comprobante
          </Button>
        }
      />

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Prototipo.</strong> Son notas de venta (no tributarias) y se
        guardan solo en este navegador. La boleta y la factura electrónica de
        SUNAT quedan por decidir.
      </Alert>

      <DashboardCard
        title="Emitidos"
        action={
          <BuscadorTabla
            valor={busqueda}
            onChange={setBusqueda}
            placeholder="Número, cliente o documento"
          />
        }
      >
        {isPending ? (
          <Skeleton variant="rounded" height={240} />
        ) : isError ? (
          <AvisoError error={error} />
        ) : visibles.length === 0 ? (
          <Typography color="textSecondary" textAlign="center" py={6}>
            {busqueda
              ? "Ningún comprobante coincide con la búsqueda."
              : "Todavía no emitiste comprobantes. Aprueba un pago o crea uno nuevo."}
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Número</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Pago</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {visibles.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Typography fontWeight={600}>{numeroComprobante(item)}</Typography>
                      {item.reserva_codigo ? (
                        <Typography variant="caption" color="textSecondary">
                          Reserva {item.reserva_codigo}
                        </Typography>
                      ) : null}
                    </TableCell>
                    <TableCell>{formatFecha(item.emitido_en)}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{item.cliente.nombre}</Typography>
                      {item.cliente.numero_documento ? (
                        <Typography variant="caption" color="textSecondary">
                          {ETIQUETA_DOCUMENTO[item.cliente.tipo_documento]}{" "}
                          {item.cliente.numero_documento}
                        </Typography>
                      ) : null}
                    </TableCell>
                    <TableCell>{item.metodo_pago ?? "—"}</TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600}>{formatMoneda(item.total)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={item.estado === "emitido" ? "Emitido" : "Anulado"}
                        color={item.estado === "emitido" ? "success" : "default"}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => setAbierto(item)}>
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DashboardCard>

      <DialogoEmitirComprobante
        borrador={borrador}
        onCerrar={() => setBorrador(null)}
        onEmitido={(comprobante) => {
          setBorrador(null);
          setAbierto(comprobante);
        }}
      />
      <DialogoComprobante comprobante={abiertoActual} onCerrar={() => setAbierto(null)} />
    </PageContainer>
  );
}
