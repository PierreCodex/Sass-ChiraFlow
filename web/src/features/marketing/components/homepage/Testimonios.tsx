"use client";
import Button from "@mui/material/Button";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Image from "next/image";
import Link from "next/link";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { IconStar } from "@tabler/icons-react";

/**
 * Espejo de `shared/reviews`: mismo layout (título a la izquierda, tarjeta a
 * la derecha) — pero **sin el carrusel de 5 reseñas falsas** de la demo
 * (las 5 eran literalmente el mismo texto atribuido a "Jenny Wilson"). Este
 * SaaS todavía no tiene clientes reales, así que no hay reseñas que
 * mostrar — inventarlas sería publicidad engañosa. Cuando existan reseñas
 * reales, esta tarjeta se reemplaza por el carrusel real.
 */
const Testimonios = () => {
  const theme = useTheme();

  return (
  <Container maxWidth="lg" sx={{ py: { xs: 5, lg: 10 } }}>
    <Grid container spacing={3} alignItems="center" justifyContent="space-between">
      <Grid size={{ xs: 12, sm: 8, lg: 5 }} pr={{ lg: 6 }}>
        <Typography
          variant="h4"
          lineHeight={1.4}
          mb={3}
          fontWeight={700}
          sx={{ fontSize: { lg: "40px", xs: "35px" } }}
        >
          ¿Qué van a pensar{" "}
          <Image
            src="/images/logos/logoIcon.svg"
            alt="logo"
            width={36}
            height={36}
            style={{ margin: "0 6px", verticalAlign: "middle" }}
          />{" "}
          nuestros clientes de nosotros?
        </Typography>
        <Typography variant="body1" color="textSecondary" lineHeight={1.8}>
          Recién estamos empezando — todavía no tenemos reseñas que mostrar. Sé de los
          primeros negocios en probarlo y ayúdanos a construir esta sección con tu
          experiencia real.
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, sm: 12, lg: 6 }}>
        <Grid container justifyContent="center">
          <Grid size={{ xs: 12, lg: 10 }}>
            <Paper variant="outlined" sx={{ borderRadius: "16px" }}>
              <CardContent sx={{ p: "48px !important", textAlign: "center" }}>
                <Stack direction="row" spacing={0.5} justifyContent="center" mb={2}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <IconStar key={i} size={20} color={theme.palette.action.disabled} />
                  ))}
                </Stack>
                <Typography variant="h6" fontWeight={600} mb={1}>
                  Todavía sin reseñas
                </Typography>
                <Typography variant="body2" color="textSecondary" mb={3}>
                  Esta tarjeta se llena sola en cuanto tus primeros negocios dejen su
                  opinión.
                </Typography>
                <Button component={Link} href="/register" variant="contained">
                  Sé de los primeros
                </Button>
              </CardContent>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  </Container>
  );
};

export default Testimonios;
