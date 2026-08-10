"use client";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  IconCalendarEvent,
  IconClockHour4,
  IconCurrencyDollar,
  IconUsers,
} from "@tabler/icons-react";

import { toApiError } from "@/lib/api/client";
import { formatMoneda } from "@/lib/format";
import { useResumenDashboard } from "../hooks/useDashboard";

interface StatCardProps {
  titulo: string;
  valor: string | number;
  icono: React.ReactNode;
  color: "primary" | "secondary" | "success" | "warning";
}

const StatCard = ({ titulo, valor, icono, color }: StatCardProps) => (
  <Card elevation={9}>
    <CardContent sx={{ p: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar
          sx={{
            bgcolor: `${color}.light`,
            color: `${color}.main`,
            width: 48,
            height: 48,
          }}
        >
          {icono}
        </Avatar>
        <Stack spacing={0.5}>
          <Typography variant="subtitle2" color="textSecondary">
            {titulo}
          </Typography>
          <Typography variant="h4" fontWeight={700}>
            {valor}
          </Typography>
        </Stack>
      </Stack>
    </CardContent>
  </Card>
);

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
    return <Alert severity="error">{toApiError(error).message}</Alert>;
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
