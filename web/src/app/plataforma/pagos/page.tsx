"use client";
import { useMemo, useState } from "react";
import Link from "next/link";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
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
import { IconCash, IconClockHour4 } from "@tabler/icons-react";

import DashboardCard from "@/components/shared/DashboardCard";
import StatCard from "@/components/shared/StatCard";
import { formatFecha, formatMoneda } from "@/lib/format";

import {
  useConfirmarPago,
  usePagosPlataforma,
  usePlanesPlataforma,
} from "@/features/plataforma/hooks/usePlataforma";
import { ETIQUETA_METODO } from "@/features/plataforma/types";

type Filtro = "todos" | "por_confirmar";

/** Los cobros de suscripción de todos los negocios. */
export default function PagosPlataformaPage() {
  const { data: pagos, isPending } = usePagosPlataforma();
  const { data: planes } = usePlanesPlataforma();
  const confirmar = useConfirmarPago();
  const [filtro, setFiltro] = useState<Filtro>("todos");

  const mesActual = new Date().toISOString().slice(0, 7);
  const cobradoMes = (pagos ?? [])
    .filter((pago) => pago.periodo === mesActual && pago.confirmado)
    .reduce((suma, pago) => suma + pago.monto, 0);
  const pendientes = (pagos ?? []).filter((pago) => !pago.confirmado);

  const visibles = useMemo(
    () => (filtro === "todos" ? pagos ?? [] : (pagos ?? []).filter((pago) => !pago.confirmado)),
    [pagos, filtro]
  );

  const nombrePlan = (slug: string) => planes?.find((plan) => plan.slug === slug)?.nombre ?? slug;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3" fontWeight={700}>
          Pagos de suscripción
        </Typography>
        <Typography color="textSecondary">
          Lo que pagan los negocios por usar ChiraFlow. No es la caja de ningún negocio.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <StatCard
            titulo="Cobrado este mes"
            valor={formatMoneda(cobradoMes)}
            icono={<IconCash size={24} />}
            color="success"
            detalle={`Periodo ${mesActual}, solo confirmados`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <StatCard
            titulo="Por confirmar"
            valor={pendientes.length}
            icono={<IconClockHour4 size={24} />}
            color="warning"
            detalle={formatMoneda(pendientes.reduce((suma, pago) => suma + pago.monto, 0))}
          />
        </Grid>
      </Grid>

      <DashboardCard>
        <>
          <Tabs
            value={filtro}
            onChange={(_, valor) => setFiltro(valor)}
            sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
          >
            <Tab value="todos" label={`Todos (${pagos?.length ?? 0})`} />
            <Tab value="por_confirmar" label={`Por confirmar (${pendientes.length})`} />
          </Tabs>

          {isPending ? (
            <Skeleton variant="rounded" height={300} />
          ) : visibles.length === 0 ? (
            <Typography color="textSecondary" textAlign="center" py={6}>
              No hay pagos en esta lista.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Negocio</TableCell>
                    <TableCell>Plan</TableCell>
                    <TableCell>Periodo</TableCell>
                    <TableCell>Método</TableCell>
                    <TableCell align="right">Monto</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibles.map((pago) => (
                    <TableRow key={pago.id} hover>
                      <TableCell>{formatFecha(pago.fecha)}</TableCell>
                      <TableCell>
                        <Typography
                          component={Link}
                          href={`/plataforma/negocios/${pago.negocio_id}`}
                          fontWeight={600}
                          sx={{ color: "inherit" }}
                        >
                          {pago.negocio_nombre}
                        </Typography>
                      </TableCell>
                      <TableCell>{nombrePlan(pago.plan_slug)}</TableCell>
                      <TableCell>{pago.periodo}</TableCell>
                      <TableCell>{ETIQUETA_METODO[pago.metodo]}</TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={700}>{formatMoneda(pago.monto)}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        {pago.confirmado ? (
                          <Chip size="small" color="success" label="Confirmado" />
                        ) : (
                          <Button
                            size="small"
                            variant="contained"
                            disabled={confirmar.isPending}
                            onClick={() => confirmar.mutate(pago.id)}
                          >
                            Confirmar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      </DashboardCard>
    </Stack>
  );
}
