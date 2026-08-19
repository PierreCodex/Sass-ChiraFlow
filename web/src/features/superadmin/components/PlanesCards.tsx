"use client";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Link from "next/link";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { IconCheck, IconMinus } from "@tabler/icons-react";

import { toApiError } from "@/lib/api/client";
import { formatMoneda } from "@/lib/format";
import { usePlanes } from "@/features/suscripcion/hooks/useSuscripcion";
import { ETIQUETAS_FEATURE } from "@/features/suscripcion/constants";
import type { Plan } from "@/features/suscripcion/types";
import { useNegocios } from "../hooks/useNegocios";

/**
 * Lista de features a mostrar en cada tarjeta: la unión de las de todos los
 * planes, en el orden del plan más completo — igual criterio que usa
 * `superadmin/planes/index.blade.php` (todas las filas, tache o check).
 */
function todasLasFeatures(planes: Plan[]): string[] {
  const masCompleto = [...planes].sort((a, b) => b.features.length - a.features.length)[0];
  return masCompleto?.features ?? [];
}

const PlanesCards = () => {
  const { data: planes, isPending, isError, error } = usePlanes();
  const { data: negocios } = useNegocios({ per_page: 200 });
  const theme = useTheme();

  if (isPending) {
    return (
      <Grid container spacing={3}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Grid key={i} size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rounded" height={480} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (isError) return <Alert severity="error">{toApiError(error).message}</Alert>;

  const features = todasLasFeatures(planes);

  return (
    <Grid container spacing={3}>
      {planes.map((plan) => {
        const cantidadNegocios =
          negocios?.data.filter((n) => n.plan === plan.nombre).length ?? 0;

        return (
          <Grid key={plan.id} size={{ xs: 12, md: 4 }}>
            <Card elevation={9} sx={{ height: "100%" }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Typography variant="h6" fontWeight={700}>
                    {plan.nombre}
                  </Typography>
                  <Link href={`/superadmin/planes/${plan.id}/editar`}>
                    <Typography variant="body2" color="primary.main" fontWeight={500}>
                      Editar
                    </Typography>
                  </Link>
                </Stack>

                <Typography variant="h4" fontWeight={700} color="primary.main" mb={2}>
                  {formatMoneda(plan.precio_mensual)}
                  <Typography component="span" variant="body2" color="textSecondary">
                    {" "}/mes
                  </Typography>
                </Typography>

                <Stack spacing={1} mb={2}>
                  {features.map((clave) => {
                    const incluida = plan.features.includes(clave);
                    return (
                      <Stack key={clave} direction="row" spacing={1} alignItems="center">
                        {incluida ? (
                          <IconCheck size={16} color={theme.palette.success.main} />
                        ) : (
                          <IconMinus size={16} color={theme.palette.text.disabled} />
                        )}
                        <Typography
                          variant="body2"
                          color={incluida ? "text.primary" : "text.disabled"}
                        >
                          {ETIQUETAS_FEATURE[clave] ?? clave}
                        </Typography>
                      </Stack>
                    );
                  })}
                </Stack>

                <Typography variant="caption" color="textSecondary">
                  {cantidadNegocios} negocio{cantidadNegocios === 1 ? "" : "s"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default PlanesCards;
