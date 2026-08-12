"use client";
import dynamic from "next/dynamic";
import { useTheme } from "@mui/material/styles";

import DashboardCard from "@/components/shared/DashboardCard";
import { COLORES_PERIODO } from "../colores";
import type { FuenteReporte } from "../types";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
  fuentes: FuenteReporte[];
}

/** De dónde salieron las reservas, comparando los dos períodos. */
const OrigenChart = ({ fuentes }: Props) => {
  const theme = useTheme();
  const modo = theme.palette.mode === "dark" ? "dark" : "light";
  const colores = COLORES_PERIODO[modo];

  const opciones: any = {
    chart: {
      type: "bar",
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: "#adb0bb",
      toolbar: { show: false },
      stacked: false,
    },
    colors: [colores.actual, colores.anterior],
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "60%",
        borderRadiusApplication: "end",
      },
    },
    dataLabels: { enabled: false },
    // Separación de 2px entre las barras del mismo grupo.
    stroke: { show: true, width: 2, colors: ["transparent"] },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
    },
    xaxis: {
      categories: fuentes.map((fuente) => fuente.label),
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { formatter: (valor: number) => String(Math.round(valor)) } },
    legend: { position: "bottom", markers: { radius: 4 } },
    tooltip: {
      theme: modo,
      y: {
        formatter: (valor: number) =>
          valor === 1 ? "1 reserva" : `${valor} reservas`,
      },
    },
  };

  const series = [
    { name: "Período actual", data: fuentes.map((fuente) => fuente.actual) },
    { name: "Período anterior", data: fuentes.map((fuente) => fuente.anterior) },
  ];

  return (
    <DashboardCard
      title="Origen de las reservas"
      subtitle="Por dónde reservaron los clientes"
    >
      <Chart
        options={opciones}
        series={series}
        type="bar"
        height={340}
        width="100%"
      />
    </DashboardCard>
  );
};

export default OrigenChart;
