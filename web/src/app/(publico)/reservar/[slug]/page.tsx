"use client";
import { use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { IconMapPin, IconPhone } from "@tabler/icons-react";

import { toApiError } from "@/lib/api/client";
import TiendaShell from "@/features/publico/components/TiendaShell";
import { useNegocioPublico } from "@/features/publico/hooks/useTienda";

/**
 * Selector de sucursal.
 *
 * En Laravel, si el negocio tiene **una sola sede** este paso se salta con un
 * redirect. Aquí se hace igual, pero con `replace` para que el botón "atrás"
 * del navegador no devuelva al cliente a una página que solo redirige.
 */
export default function ElegirSucursalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { data, isPending, isError, error } = useNegocioPublico(slug);

  // Con una sola sede este paso no aporta nada: se va directo al catálogo.
  // `replace` y no `push`, para que "atrás" no devuelva a una pantalla que
  // solo vuelve a redirigir.
  const localUnico = data?.locales.length === 1 ? data.locales[0] : null;

  useEffect(() => {
    if (localUnico) {
      router.replace(`/reservar/${slug}/sucursal/${localUnico.id}`);
    }
  }, [localUnico, router, slug]);

  if (isError) {
    return (
      <Container maxWidth="sm" sx={{ py: 10 }}>
        <Alert severity="error">{toApiError(error).message}</Alert>
      </Container>
    );
  }

  // Mientras se redirige no se enseña la rejilla de una sola tarjeta.
  if (isPending || !data || localUnico) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={3}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton variant="rounded" height={260} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  const { negocio, locales } = data;

  return (
    <TiendaShell nombre={negocio.nombre} subtitulo="Reserva tu cita en línea">
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" fontWeight={700} textAlign="center">
          Elige dónde quieres reservar
        </Typography>
        <Typography color="textSecondary" textAlign="center" mt={1} mb={5}>
          {locales.length === 1
            ? "Esta es nuestra sede."
            : `Tenemos ${locales.length} sedes disponibles.`}
        </Typography>

        {locales.length === 0 ? (
          <Alert severity="info">
            No hay sucursales disponibles para reservar en este momento.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {locales.map((local) => (
              <Grid key={local.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card sx={{ height: "100%" }}>
                  <CardActionArea
                    component={Link}
                    href={`/reservar/${slug}/sucursal/${local.id}`}
                    sx={{ height: "100%" }}
                  >
                    <Box
                      sx={{
                        height: 150,
                        bgcolor: local.color ?? "primary.light",
                        backgroundImage: local.banner_url
                          ? `url(${local.banner_url})`
                          : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <CardContent>
                      <Typography variant="h6" fontWeight={600}>
                        {local.nombre}
                      </Typography>

                      <Stack spacing={0.75} mt={1.5}>
                        {local.direccion ? (
                          <Stack direction="row" spacing={1} alignItems="flex-start">
                            <Box sx={{ display: "flex", color: "text.secondary", mt: 0.25 }}>
                              <IconMapPin size={16} />
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                              {local.direccion}
                            </Typography>
                          </Stack>
                        ) : null}

                        {local.telefono ? (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ display: "flex", color: "text.secondary" }}>
                              <IconPhone size={16} />
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                              {local.telefono}
                            </Typography>
                          </Stack>
                        ) : null}

                        {local.horario_desde && local.horario_hasta ? (
                          <Typography variant="body2" color="textSecondary">
                            {local.horario_desde} – {local.horario_hasta}
                          </Typography>
                        ) : null}
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </TiendaShell>
  );
}
