"use client";
import dynamic from "next/dynamic";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

import DashboardCard from "@/components/shared/DashboardCard";
import { RAMPA_OCUPACION } from "../colores";
import type { FilaPorHora } from "../types";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
  horas: string[];
  porHora: FilaPorHora[];
}

/**
 * Mapa de calor día × hora.
 *
 * La app actual dibuja **siete líneas superpuestas** (una por día de la
 * semana) sobre el mismo eje. Con siete series cruzándose no se distingue
 * ninguna, y además obliga a siete colores categóricos que ningún juego de
 * paleta separa de forma segura.
 *
 * Los datos son una matriz (día × hora → conteo), y la forma que le
 * corresponde es un mapa de calor: **un solo tono**, de claro a oscuro, donde
 * el color codifica cantidad. Se lee de un vistazo dónde están los picos, que
 * es justo la pregunta que responde este gráfico.
 */
const ReservasPorHoraChart = ({ horas, porHora }: Props) => {
  const theme = useTheme();
  const modo = theme.palette.mode === "dark" ? "dark" : "light";
  const rampa = RAMPA_OCUPACION[modo];

  const maximo = Math.max(
    1,
    ...porHora.flatMap((fila) => fila.data)
  );
  const paso = Math.ceil(maximo / (rampa.length - 1));

  const opciones: any = {
    chart: {
      type: "heatmap",
      fontFamily: "'Plus Jakarta Sans', sans-serif;",
      foreColor: "#adb0bb",
      toolbar: { show: false },
    },
    dataLabels: { enabled: false },
    // 2px de superficie entre celdas: separa los bloques sin dibujar rejilla.
    stroke: { width: 2, colors: [theme.palette.background.paper] },
    plotOptions: {
      heatmap: {
        radius: 4,
        enableShades: false,
        colorScale: {
          ranges: rampa.map((color, i) => ({
            from: i === 0 ? 0 : (i - 1) * paso + 1,
            to: i === 0 ? 0 : i * paso,
            color,
            name: i === 0 ? "Sin reservas" : undefined,
          })),
        },
      },
    },
    xaxis: {
      categories: horas,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    legend: { show: false },
    tooltip: {
      theme: modo,
      y: {
        formatter: (valor: number) =>
          valor === 1 ? "1 reserva" : `${valor} reservas`,
      },
    },
  };

  // ApexCharts pinta la primera serie abajo: se invierte para que el lunes
  // quede arriba, como se lee un calendario.
  const series = [...porHora]
    .reverse()
    .map((fila) => ({ name: fila.dia, data: fila.data }));

  return (
    <DashboardCard
      title="Reservas por hora"
      subtitle="Franjas con más demanda de la semana"
    >
      <>
        <Chart
          options={opciones}
          series={series}
          type="heatmap"
          height={340}
          width="100%"
        />
        <Typography variant="caption" color="textSecondary">
          Cuanto más oscura la celda, más reservas en esa franja. Máximo del
          período: {maximo}.
        </Typography>
      </>
    </DashboardCard>
  );
};

export default ReservasPorHoraChart;
