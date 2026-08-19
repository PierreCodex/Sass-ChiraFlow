"use client";
import dynamic from "next/dynamic";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import { useTheme } from "@mui/material/styles";

import DashboardCard from "@/components/shared/DashboardCard";
import { toApiError } from "@/lib/api/client";
import { formatDiaMes, formatMoneda } from "@/lib/format";
import { useResumenSuperadmin } from "../hooks/useSuperadmin";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

/**
 * Mismo estilo que `features/dashboard/components/VentasChart.tsx`, pero con
 * los ingresos de TODA la plataforma en vez de un solo negocio — para ver de
 * un vistazo qué día vendió más o menos.
 */
const IngresosPlataformaChart = () => {
  const theme = useTheme();
  const { data, isPending, isError, error } = useResumenSuperadmin();

  const opciones: any = {
    chart: {
      type: "bar",
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: "#adb0bb",
      toolbar: { show: false },
      height: 300,
    },
    colors: [theme.palette.primary.main],
    plotOptions: {
      bar: { borderRadius: 6, columnWidth: "45%", borderRadiusApplication: "end" },
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
    },
    xaxis: {
      categories: data?.ingresos_ultimos_dias?.map((v) => formatDiaMes(v.fecha)) ?? [],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { formatter: (valor: number) => formatMoneda(valor) } },
    tooltip: {
      theme: theme.palette.mode === "dark" ? "dark" : "light",
      y: { formatter: (valor: number) => formatMoneda(valor) },
    },
  };

  const series = [
    { name: "Ingresos", data: data?.ingresos_ultimos_dias?.map((v) => v.total) ?? [] },
  ];

  return (
    <DashboardCard title="Ingresos de la plataforma" subtitle="Últimos 7 días">
      {isPending ? (
        <Skeleton variant="rounded" height={300} />
      ) : isError ? (
        <Alert severity="error">{toApiError(error).message}</Alert>
      ) : (
        <Chart options={opciones} series={series} type="bar" height={300} width="100%" />
      )}
    </DashboardCard>
  );
};

export default IngresosPlataformaChart;
