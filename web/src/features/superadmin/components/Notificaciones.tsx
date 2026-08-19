"use client";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { toApiError } from "@/lib/api/client";
import { useResumenSuperadmin } from "../hooks/useSuperadmin";

/**
 * Espejo de `superadmin/notificaciones/index.blade.php`. El backend real
 * todavía no tiene notificaciones para el superadmin — igual que en Laravel,
 * lo normal ahora mismo es ver el estado vacío.
 */
const Notificaciones = () => {
  // No hay feature propio de notificaciones todavía: se reutiliza el mismo
  // resumen del dashboard solo para mostrar el estado de carga consistente.
  const { isPending, isError, error } = useResumenSuperadmin();

  if (isPending) return <Skeleton variant="rounded" height={140} />;
  if (isError) return <Alert severity="error">{toApiError(error).message}</Alert>;

  return (
    <Card elevation={9}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={600}>
            Historial de notificaciones
          </Typography>
          <Button variant="text" size="small" disabled>
            Marcar todas como leídas
          </Button>
        </Stack>

        <Typography variant="body2" color="textSecondary">
          No tienes notificaciones.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default Notificaciones;
