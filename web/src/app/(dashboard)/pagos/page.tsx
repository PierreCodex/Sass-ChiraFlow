"use client";
import { useMemo, useState } from "react";
import Link from "next/link";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { IconSettings } from "@tabler/icons-react";

import PageContainer from "@/components/container/PageContainer";
import AvisoError from "@/components/shared/AvisoError";
import DashboardCard from "@/components/shared/DashboardCard";
import EncabezadoPagina from "@/components/shared/EncabezadoPagina";
import { formatDiaMes, formatMoneda } from "@/lib/format";

import DialogoVerificarPago from "@/features/pagos/components/DialogoVerificarPago";
import { usePagos } from "@/features/pagos/hooks/usePagos";
import {
  COLOR_ESTADO_PAGO,
  ETIQUETA_ESTADO_PAGO,
  type EstadoPago,
  type PagoReserva,
} from "@/features/pagos/types";

type Filtro = "por_verificar" | "esperando" | "todos";

const FILTROS: { valor: Filtro; titulo: string; estados: EstadoPago[] | null }[] = [
  { valor: "por_verificar", titulo: "Por verificar", estados: ["comprobante_subido"] },
  { valor: "esperando", titulo: "Esperando pago", estados: ["pendiente"] },
  { valor: "todos", titulo: "Todos", estados: null },
];

/**
 * Pagos por verificar: las capturas que suben los clientes al reservar con
 * «Pagar ahora». Prototipo de la Story 7.4 — responde con mocks.
 */
export default function PagosPage() {
  const { data, isPending, isError, error } = usePagos();
  const [filtro, setFiltro] = useState<Filtro>("por_verificar");
  const [abierto, setAbierto] = useState<PagoReserva | null>(null);

  const conteo = (estados: EstadoPago[] | null) =>
    (data ?? []).filter((pago) => !estados || estados.includes(pago.estado)).length;

  const visibles = useMemo(() => {
    const estados = FILTROS.find((item) => item.valor === filtro)!.estados;
    return (data ?? []).filter((pago) => !estados || estados.includes(pago.estado));
  }, [data, filtro]);

  return (
    <PageContainer title="Pagos" description="Pagos por verificar">
      <EncabezadoPagina titulo="Pagos por verificar" />

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Prototipo.</strong> Los pagos salen de las reservas hechas en tu
        tienda con «Pagar ahora» desde este mismo navegador.
      </Alert>

      <DashboardCard
        title="Capturas de tus clientes"
        action={
          <Button
            component={Link}
            href="/administracion/general/cobros"
            variant="outlined"
            size="small"
            startIcon={<IconSettings size={16} />}
          >
            Métodos de pago
          </Button>
        }
      >
        <>
          <Tabs
            value={filtro}
            onChange={(_, valor) => setFiltro(valor)}
            sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
          >
            {FILTROS.map((item) => (
              <Tab
                key={item.valor}
                value={item.valor}
                label={`${item.titulo} (${conteo(item.estados)})`}
              />
            ))}
          </Tabs>

          {isPending ? (
            <Skeleton variant="rounded" height={240} />
          ) : isError ? (
            <AvisoError error={error} />
          ) : visibles.length === 0 ? (
            <Typography color="textSecondary" textAlign="center" py={6}>
              {filtro === "por_verificar"
                ? "No hay capturas pendientes de revisar."
                : "No hay pagos en esta lista."}
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Reserva</TableCell>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Cita</TableCell>
                    <TableCell>Método</TableCell>
                    <TableCell align="right">Monto</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibles.map((pago) => (
                    <TableRow key={pago.codigo} hover>
                      <TableCell>
                        <Typography fontWeight={600}>{pago.codigo}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{pago.cliente_nombre}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {pago.cliente_telefono}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{pago.servicios}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatDiaMes(pago.fecha)} · {pago.hora_inicio}
                        </Typography>
                      </TableCell>
                      <TableCell>{pago.metodo_nombre ?? "—"}</TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={600}>{formatMoneda(pago.total)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={ETIQUETA_ESTADO_PAGO[pago.estado]}
                          color={COLOR_ESTADO_PAGO[pago.estado]}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" justifyContent="flex-end">
                          <Button
                            size="small"
                            variant={
                              pago.estado === "comprobante_subido" ? "contained" : "text"
                            }
                            onClick={() => setAbierto(pago)}
                          >
                            {pago.estado === "comprobante_subido" ? "Revisar" : "Ver"}
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      </DashboardCard>

      <DialogoVerificarPago pago={abierto} onCerrar={() => setAbierto(null)} />
    </PageContainer>
  );
}
