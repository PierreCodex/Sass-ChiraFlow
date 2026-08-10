"use client";
import dynamic from "next/dynamic";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import { useTheme } from "@mui/material/styles";

import DashboardCard from "@/components/shared/DashboardCard";
import { toApiError } from "@/lib/api/client";
import { formatDiaMes, formatMoneda } from "@/lib/format";
import { useResumenDashboard } from "../hooks/useDashboard";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const VentasChart = () => {
  const theme = useTheme();
  const { data, isPending, isError, error } = useResumenDashboard();

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
      bar: {
        borderRadius: 6,
        columnWidth: "45%",
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
    },
    xaxis: {
      categories: data?.ventas_ultimos_dias.map((v) => formatDiaMes(v.fecha)) ?? [],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (valor: number) => formatMoneda(valor),
      },
    },
    tooltip: {
      theme: theme.palette.mode === "dark" ? "dark" : "light",
      y: { formatter: (valor: number) => formatMoneda(valor) },
    },
  };

  const series = [
    {
      name: "Ventas",
      data: data?.ventas_ultimos_dias.map((v) => v.total) ?? [],
    },
  ];

  return (
    <DashboardCard title="Ventas últimos 7 días">
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

export default VentasChart;
