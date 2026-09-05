"use client";
import { useState } from "react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  IconLock,
  IconLockOpen,
  IconPlus,
  IconWallet,
} from "@tabler/icons-react";

import PageContainer from "@/components/container/PageContainer";
import EncabezadoPagina from "@/components/shared/EncabezadoPagina";
import DashboardCard from "@/components/shared/DashboardCard";
import { toApiError } from "@/lib/api/client";
import { formatFechaLarga, formatHora, formatMoneda } from "@/lib/format";

import ResumenCaja from "@/features/caja/components/ResumenCaja";
import MovimientosCajaTable from "@/features/caja/components/MovimientosCajaTable";
import AbrirCajaDialog from "@/features/caja/components/AbrirCajaDialog";
import CerrarCajaDialog from "@/features/caja/components/CerrarCajaDialog";
import MovimientoCajaDialog from "@/features/caja/components/MovimientoCajaDialog";
import { useEstadoCaja } from "@/features/caja/hooks/useCaja";
import { diferenciaArqueo, saldoEsperado } from "@/features/caja/types";
import AvisoError from "@/components/shared/AvisoError";


export default function CajaPage() {
  const [abrirDialog, setAbrirDialog] = useState(false);
  const [cerrarDialog, setCerrarDialog] = useState(false);
  const [movimientoDialog, setMovimientoDialog] = useState(false);

  const { data, isPending, isError, error } = useEstadoCaja();

  const sesion = data?.sesion ?? null;
  const cerrada = !!sesion && sesion.monto_final !== null;
  const abierta = !!sesion && sesion.monto_final === null;
  const diferencia = sesion ? diferenciaArqueo(sesion) : null;

  return (
    <PageContainer title="Caja" description="Apertura, movimientos y arqueo">
      <EncabezadoPagina titulo="Caja" />

      {isPending ? (
        <Stack spacing={3}>
          <Grid container spacing={3}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
                <Skeleton variant="rounded" height={104} />
              </Grid>
            ))}
          </Grid>
          <Skeleton variant="rounded" height={320} />
        </Stack>
      ) : isError ? (
        <AvisoError error={error} />
      ) : !sesion ? (
        // Todavía no se ha abierto caja hoy: no hay nada que mostrar.
        <Card elevation={9}>
          <CardContent sx={{ py: 8, textAlign: "center" }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: "primary.light",
                color: "primary.main",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
              }}
            >
              <IconWallet size={32} />
            </Box>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              La caja de hoy todavía no está abierta
            </Typography>
            <Typography color="textSecondary" sx={{ mb: 3 }}>
              {formatFechaLarga(data.fecha)}. Abre caja con el efectivo inicial
              para empezar a registrar movimientos.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<IconLockOpen size={18} />}
              onClick={() => setAbrirDialog(true)}
            >
              Abrir caja
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={3}>
          {cerrada ? (
            <Alert
              severity={diferencia === 0 ? "success" : "warning"}
              icon={<IconLock size={20} />}
            >
              <AlertTitle>Caja cerrada</AlertTitle>
              Cerrada a las {formatHora(sesion.cerrada_en!)}. Se contaron{" "}
              <strong>{formatMoneda(sesion.monto_final!)}</strong> frente a{" "}
              <strong>{formatMoneda(saldoEsperado(sesion))}</strong> esperados
              {diferencia === 0
                ? ": el arqueo cuadra."
                : diferencia! > 0
                  ? `: sobran ${formatMoneda(diferencia!)}.`
                  : `: faltan ${formatMoneda(Math.abs(diferencia!))}.`}
            </Alert>
          ) : null}

          <ResumenCaja sesion={sesion} />

          <DashboardCard
            title="Movimientos del día"
            subtitle={formatFechaLarga(sesion.fecha)}
            action={
              abierta ? (
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    startIcon={<IconPlus size={18} />}
                    onClick={() => setMovimientoDialog(true)}
                  >
                    Nuevo movimiento
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<IconLock size={18} />}
                    onClick={() => setCerrarDialog(true)}
                  >
                    Cerrar caja
                  </Button>
                </Stack>
              ) : undefined
            }
          >
            <MovimientosCajaTable movimientos={data.movimientos} />
          </DashboardCard>
        </Stack>
      )}

      <AbrirCajaDialog
        abierto={abrirDialog}
        onCerrar={() => setAbrirDialog(false)}
      />

      {sesion ? (
        <>
          <MovimientoCajaDialog
            abierto={movimientoDialog}
            sesion={sesion}
            onCerrar={() => setMovimientoDialog(false)}
          />
          <CerrarCajaDialog
            abierto={cerrarDialog}
            sesion={sesion}
            onCerrar={() => setCerrarDialog(false)}
          />
        </>
      ) : null}
    </PageContainer>
  );
}
