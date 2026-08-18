"use client";
import dynamic from "next/dynamic";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import { useTheme } from "@mui/material/styles";

import DashboardCard from "@/components/shared/DashboardCard";
import { toApiError } from "@/lib/api/client";
import { formatDiaMes } from "@/lib/format";
import { useResumenSuperadmin } from "../hooks/useSuperadmin";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

/** Cuántos negocios nuevos se registraron cada día — el "cuál día más/menos" de altas. */
const NegociosNuevosChart = () => {
  const theme = useTheme();
  const { data, isPending, isError, error } = useResumenSuperadmin();

  const opciones: any = {
    chart: {
      type: "line",
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: "#adb0bb",
      toolbar: { show: false },
      height: 300,
    },
    colors: [theme.palette.secondary.main],
    stroke: { curve: "smooth", width: 3 },
    markers: { size: 4 },
    dataLabels: { enabled: false },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
    },
    xaxis: {
      categories:
        data?.negocios_nuevos_ultimos_dias?.map((v) => formatDiaMes(v.fecha)) ?? [],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { formatter: (valor: number) => String(Math.round(valor)) } },
    tooltip: { theme: theme.palette.mode === "dark" ? "dark" : "light" },
  };

  const series = [
    {
      name: "Negocios nuevos",
      data: data?.negocios_nuevos_ultimos_dias?.map((v) => v.total) ?? [],
    },
  ];

  return (
    <DashboardCard title="Negocios nuevos" subtitle="Últimos 7 días">
      {isPending ? (
        <Skeleton variant="rounded" height={300} />
      ) : isError ? (
        <Alert severity="error">{toApiError(error).message}</Alert>
      ) : (
        <Chart options={opciones} series={series} type="line" height={300} width="100%" />
      )}
    </DashboardCard>
  );
};

export default NegociosNuevosChart;
