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

import { toApiError } from "@/lib/api/client";
import { formatMoneda } from "@/lib/format";
import { useResumenSuperadmin } from "../hooks/useSuperadmin";
import StatTile, { type StatTileProps } from "./StatTile";

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
            <Skeleton variant="rounded" height={148} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (isError) {
    return <Alert severity="error">{toApiError(error).message}</Alert>;
  }

  const tarjetas: StatTileProps[] = [
    { titulo: "Negocios", valor: data.negocios_total, icono: IconBuildingStore, color: "primary" },
    { titulo: "Activos", valor: data.negocios_activos, icono: IconCircleCheck, color: "success" },
    { titulo: "Suspendidos", valor: data.negocios_suspendidos, icono: IconBan, color: "error" },
    { titulo: "En prueba", valor: data.negocios_prueba, icono: IconHourglass, color: "secondary" },
    { titulo: "Ingresos mes", valor: formatMoneda(data.ingresos_mes), icono: IconCurrencyDollar, color: "info" },
    { titulo: "Tickets abiertos", valor: data.tickets_abiertos, icono: IconTicket, color: "warning" },
  ];

  return (
    <Grid container spacing={3}>
      {tarjetas.map((tarjeta) => (
        <Grid key={tarjeta.titulo} size={{ xs: 12, sm: 6, lg: 2 }}>
          <StatTile {...tarjeta} />
        </Grid>
      ))}
    </Grid>
  );
};

export default StatsCards;
