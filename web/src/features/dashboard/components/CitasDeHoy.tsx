"use client";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import DashboardCard from "@/components/shared/DashboardCard";
import { toApiError } from "@/lib/api/client";
import { formatHora } from "@/lib/format";
import { ESTADOS_CITA } from "@/features/citas/constants";
import { useResumenDashboard } from "../hooks/useDashboard";

const CitasDeHoy = () => {
  const { data, isPending, isError, error } = useResumenDashboard();

  return (
    <DashboardCard
      title="Citas de hoy"
      action={
        <Button component={Link} href="/citas" size="small" variant="text">
          Ver todas
        </Button>
      }
    >
      <Box sx={{ minHeight: 300 }}>
        {isPending ? (
          <Stack spacing={2}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={56} />
            ))}
          </Stack>
        ) : isError ? (
          <Alert severity="error">{toApiError(error).message}</Alert>
        ) : data.citas_del_dia.length === 0 ? (
          <Typography color="textSecondary">No hay citas hoy.</Typography>
        ) : (
          <Stack divider={<Divider flexItem />} spacing={0}>
            {data.citas_del_dia.map((cita) => {
              const estado = ESTADOS_CITA[cita.estado];

              return (
                <Stack
                  key={cita.id}
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  py={1.5}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    sx={{ minWidth: 52 }}
                  >
                    {formatHora(cita.hora)}
                  </Typography>

                  <Box flexGrow={1} minWidth={0}>
                    <Typography variant="subtitle2" fontWeight={600} noWrap>
                      {cita.cliente}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" noWrap>
                      {cita.servicio}
                      {cita.empleado ? ` · ${cita.empleado}` : ""}
                    </Typography>
                  </Box>

                  <Chip size="small" label={estado.label} color={estado.color} />
                </Stack>
              );
            })}
          </Stack>
        )}
      </Box>
    </DashboardCard>
  );
};

export default CitasDeHoy;
