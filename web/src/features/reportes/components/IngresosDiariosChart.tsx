"use client";
import dynamic from "next/dynamic";
import { useTheme } from "@mui/material/styles";

import DashboardCard from "@/components/shared/DashboardCard";
import { formatMoneda } from "@/lib/format";
import { COLORES_PERIODO } from "../colores";
import type { DiaIngresos } from "../types";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
  diario: DiaIngresos[];
}

const IngresosDiariosChart = ({ diario }: Props) => {
  const theme = useTheme();
  const modo = theme.palette.mode === "dark" ? "dark" : "light";
  const colores = COLORES_PERIODO[modo];

  const opciones: any = {
    chart: {
      type: "area",
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: "#adb0bb",
      toolbar: { show: false },
    },
    colors: [colores.actual, colores.anterior],
    // El período anterior va punteado: la identidad no queda solo en el color.
    //
    // Curva recta, no `smooth`: con los domingos a cero el suavizado hace que
    // la curva se hunda por debajo del eje e insinúe ingresos negativos que
    // nunca existieron.
    stroke: { curve: "straight", width: 2, dashArray: [0, 5] },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.35, opacityTo: 0.02, stops: [0, 100] },
    },
    dataLabels: { enabled: false },
    markers: { size: 0, hover: { size: 5 } },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
    },
    xaxis: {
      categories: diario.map((dia) => dia.etiqueta),
      axisBorder: { show: false },
      axisTicks: { show: false },
      // Con rangos largos no caben todas las fechas.
      tickAmount: Math.min(12, diario.length),
    },
    yaxis: { labels: { formatter: (valor: number) => formatMoneda(valor) } },
    legend: { position: "bottom", markers: { radius: 4 } },
    tooltip: {
      theme: modo,
      // Cruceta: compara los dos períodos en el mismo día del rango.
      shared: true,
      intersect: false,
      y: { formatter: (valor: number) => formatMoneda(valor ?? 0) },
    },
  };

  const series = [
    { name: "Período actual", data: diario.map((dia) => dia.actual) },
    { name: "Período anterior", data: diario.map((dia) => dia.anterior) },
  ];

  return (
    <DashboardCard
      title="Ingresos diarios"
      subtitle="Solo citas completadas"
    >
      <Chart
        options={opciones}
        series={series}
        type="area"
        height={320}
        width="100%"
      />
    </DashboardCard>
  );
};

export default IngresosDiariosChart;
