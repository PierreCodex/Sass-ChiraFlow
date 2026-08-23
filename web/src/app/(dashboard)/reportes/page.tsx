"use client";
import { useState } from "react";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

import PageContainer from "@/components/container/PageContainer";
import EncabezadoPagina from "@/components/shared/EncabezadoPagina";
import { toApiError } from "@/lib/api/client";

import FiltroRango, {
  rangoPorDefecto,
} from "@/features/reportes/components/FiltroRango";
import MetricasReporte from "@/features/reportes/components/MetricasReporte";
import ReservasPorHoraChart from "@/features/reportes/components/ReservasPorHoraChart";
import OrigenChart from "@/features/reportes/components/OrigenChart";
import IngresosDiariosChart from "@/features/reportes/components/IngresosDiariosChart";
import DesgloseLista from "@/features/reportes/components/DesgloseLista";
import {
  useExportarReporte,
  useReporte,
} from "@/features/reportes/hooks/useReporte";


export default function ReportesPage() {
  const [rango, setRango] = useState(rangoPorDefecto);

  const { data, isPending, isError, error } = useReporte(rango);
  const exportar = useExportarReporte();

  return (
    <PageContainer title="Reportes" description="Reporte de reservas">
      <EncabezadoPagina titulo="Reporte de reservas" />

      <Stack spacing={3}>
        <FiltroRango
          valor={rango}
          onChange={setRango}
          onExportar={() => exportar.mutate(rango)}
          exportando={exportar.isPending}
        />

        {exportar.isError ? (
          <Alert severity="error">{toApiError(exportar.error).message}</Alert>
        ) : null}

        {isError ? (
          <Alert severity="error">{toApiError(error).message}</Alert>
        ) : isPending || !data ? (
          <>
            <Grid container spacing={3}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Skeleton variant="rounded" height={170} />
                </Grid>
              ))}
            </Grid>
            <Skeleton variant="rounded" height={420} />
            <Skeleton variant="rounded" height={400} />
          </>
        ) : (
          <>
            <MetricasReporte actual={data.actual} anterior={data.anterior} />

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, lg: 8 }}>
                <ReservasPorHoraChart
                  horas={data.horas}
                  porHora={data.por_hora}
                />
              </Grid>
              <Grid size={{ xs: 12, lg: 4 }}>
                <OrigenChart fuentes={data.fuentes} />
              </Grid>
            </Grid>

            <IngresosDiariosChart diario={data.diario} />

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <DesgloseLista
                  titulo="Por servicio"
                  filas={data.por_servicio}
                  vacio="No hay datos para este período."
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <DesgloseLista
                  titulo="Por profesional"
                  filas={data.por_profesional}
                  vacio="No hay datos para este período."
                />
              </Grid>
            </Grid>
          </>
        )}
      </Stack>
    </PageContainer>
  );
}
