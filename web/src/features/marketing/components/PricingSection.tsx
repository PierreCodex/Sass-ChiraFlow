"use client";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Link from "next/link";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { toApiError } from "@/lib/api/client";
import { formatMoneda } from "@/lib/format";
import { usePlanes } from "@/features/suscripcion/hooks/useSuscripcion";
import { precioAplicado } from "@/features/suscripcion/types";

/**
 * Teaser de precios para visitantes nuevos: siempre elegibles a la promo
 * (todavía no tienen negocio en prueba), mismos 3 planes que `/mi-plan`.
 */
const PricingSection = () => {
  const { data: planes, isPending, isError, error } = usePlanes();

  return (
    <Box id="planes" sx={{ py: { xs: 8, md: 12 }, bgcolor: "background.default" }}>
      <Container maxWidth="lg">
        <Typography variant="h3" fontWeight={700} textAlign="center" mb={1} sx={{ fontSize: { xs: 26, md: 34 } }}>
          Elige tu plan
        </Typography>
        <Typography variant="body1" color="textSecondary" textAlign="center" mb={6}>
          Cancela cuando quieras. Sin permanencia.
        </Typography>

        {isPending ? (
          <Grid container spacing={3}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Grid key={i} size={{ xs: 12, md: 4 }}>
                <Skeleton variant="rounded" height={360} />
              </Grid>
            ))}
          </Grid>
        ) : isError ? (
          <Alert severity="error">{toApiError(error).message}</Alert>
        ) : (
          <Grid container spacing={3} alignItems="stretch">
            {planes.map((plan) => {
              const { conPromo, precio } = precioAplicado(plan, true);
              return (
                <Grid key={plan.id} size={{ xs: 12, md: 4 }}>
                  <Card
                    elevation={plan.destacado ? 9 : 1}
                    variant={plan.destacado ? "elevation" : "outlined"}
                    sx={{ height: "100%", position: "relative" }}
                  >
                    {plan.destacado ? (
                      <Chip
                        label="Popular"
                        color="primary"
                        size="small"
                        sx={{ position: "absolute", top: 16, right: 16 }}
                      />
                    ) : null}
                    <CardContent sx={{ p: 4, display: "flex", flexDirection: "column", height: "100%" }}>
                      <Typography variant="h5" fontWeight={700}>
                        {plan.nombre}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" mb={2}>
                        {plan.descripcion}
                      </Typography>

                      <Stack direction="row" alignItems="baseline" spacing={1} mb={0.5}>
                        {conPromo ? (
                          <Typography variant="body2" color="textSecondary" sx={{ textDecoration: "line-through" }}>
                            {formatMoneda(plan.precio_mensual)}
                          </Typography>
                        ) : null}
                        <Typography variant="h3" fontWeight={700}>
                          {formatMoneda(precio)}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="textSecondary" mb={3}>
                        {conPromo ? `/mes los primeros ${plan.promo_duracion_meses} meses` : "/mes"}
                      </Typography>

                      <Box flexGrow={1} />
                      <Button component={Link} href="/register" variant="contained" fullWidth size="large">
                        Empezar prueba gratis
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default PricingSection;
