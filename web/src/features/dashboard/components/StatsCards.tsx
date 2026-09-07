"use client";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import {
  IconCalendarEvent,
  IconClockHour4,
  IconCurrencyDollar,
  IconUsers,
} from "@tabler/icons-react";

import StatCard, { type StatCardProps } from "@/components/shared/StatCard";
import { toApiError } from "@/lib/api/client";
import { formatMoneda } from "@/lib/format";
import { useResumenDashboard } from "../hooks/useDashboard";
import AvisoError from "@/components/shared/AvisoError";

const StatsCards = () => {
  const { data, isPending, isError, error } = useResumenDashboard();

  if (isPending) {
    return (
      <Grid container spacing={3}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Skeleton variant="rounded" height={104} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (isError) {
    return <AvisoError error={error} />;
  }

  const tarjetas: StatCardProps[] = [
    {
      titulo: "Citas hoy",
      valor: data.citas_hoy,
      icono: <IconCalendarEvent size={24} />,
      color: "primary",
    },
    {
      titulo: "Pendientes",
      valor: data.citas_pendientes,
      icono: <IconClockHour4 size={24} />,
      color: "warning",
    },
    {
      titulo: "Clientes",
      valor: data.total_clientes,
      icono: <IconUsers size={24} />,
      color: "secondary",
    },
    {
      titulo: "Ingresos hoy",
      valor: formatMoneda(data.ingresos_hoy),
      icono: <IconCurrencyDollar size={24} />,
      color: "success",
    },
  ];

  return (
    <Grid container spacing={3}>
      {tarjetas.map((tarjeta) => (
        <Grid key={tarjeta.titulo} size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard {...tarjeta} />
        </Grid>
      ))}
    </Grid>
  );
};

export default StatsCards;
