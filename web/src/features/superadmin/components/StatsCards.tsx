"use client";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import {
  IconBan,
  IconBuildingStore,
  IconCircleCheck,
  IconCurrencyDollar,
  IconHourglass,
  IconTicket,
} from "@tabler/icons-react";

import StatCard, { type StatCardProps } from "@/components/shared/StatCard";
import { toApiError } from "@/lib/api/client";
import { formatMoneda } from "@/lib/format";
import { useResumenSuperadmin } from "../hooks/useSuperadmin";

/**
 * Las 6 tarjetas de `superadmin.dashboard` (Blade): Negocios, Activos,
 * Suspendidos, En prueba, Ingresos mes, Tickets abiertos.
 */
const StatsCards = () => {
  const { data, isPending, isError, error } = useResumenSuperadmin();

  if (isPending) {
    return (
      <Grid container spacing={3}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, lg: 2 }}>
            <Skeleton variant="rounded" height={104} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (isError) {
    return <Alert severity="error">{toApiError(error).message}</Alert>;
  }

  const tarjetas: StatCardProps[] = [
    {
      titulo: "Negocios",
      valor: data.negocios_total,
      icono: <IconBuildingStore size={24} />,
      color: "primary",
    },
    {
      titulo: "Activos",
      valor: data.negocios_activos,
      icono: <IconCircleCheck size={24} />,
      color: "success",
    },
    {
      titulo: "Suspendidos",
      valor: data.negocios_suspendidos,
      icono: <IconBan size={24} />,
      color: "error",
    },
    {
      titulo: "En prueba",
      valor: data.negocios_prueba,
      icono: <IconHourglass size={24} />,
      color: "secondary",
    },
    {
      titulo: "Ingresos mes",
      valor: formatMoneda(data.ingresos_mes),
      icono: <IconCurrencyDollar size={24} />,
      color: "primary",
    },
    {
      titulo: "Tickets abiertos",
      valor: data.tickets_abiertos,
      icono: <IconTicket size={24} />,
      color: "warning",
    },
  ];

  return (
    <Grid container spacing={3}>
      {tarjetas.map((tarjeta) => (
        <Grid key={tarjeta.titulo} size={{ xs: 12, sm: 6, lg: 2 }}>
          <StatCard {...tarjeta} />
        </Grid>
      ))}
    </Grid>
  );
};

export default StatsCards;
