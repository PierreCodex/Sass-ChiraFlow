"use client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import Link from "next/link";
import useMediaQuery from "@mui/material/useMediaQuery";

/**
 * Hero real de `frontend-pages/homepage/banner/Banner.tsx`, adaptado:
 * - Mismo layout (título centrado + decoraciones laterales + franja inferior).
 * - Quité la fila de logos de frameworks (React/MUI/Next/TS) y el diálogo de
 *   YouTube: eran marketing de la plantilla para *desarrolladores*, no de
 *   este SaaS de citas.
 * - Sin cifra inventada de "X negocios confían en nosotros": el producto es
 *   nuevo y no hay una cifra real que mostrar todavía.
 */
const Banner = () => {
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));

  return (
    <Box bgcolor="primary.light" pt={7}>
      <Container sx={{ maxWidth: "1400px !important", position: "relative" }}>
        <Grid container spacing={3} justifyContent="center" mb={4}>
          {lgUp ? (
            <Grid alignItems="end" display="flex" size={{ xs: 12, lg: 2 }}>
              <Image
                src="/images/frontend-pages/homepage/banner-top-left.svg"
                alt="decoración"
                width={360}
                height={200}
                style={{
                  borderRadius: "16px",
                  position: "absolute",
                  left: "24px",
                  boxShadow: "0px 6px 12px rgba(127, 145, 156, 0.12)",
                  height: "auto",
                  width: "auto",
                }}
              />
            </Grid>
          ) : null}

          <Grid textAlign="center" size={{ xs: 12, lg: 7 }}>
            <Typography
              variant="h1"
              fontWeight={700}
              lineHeight="1.2"
              sx={{ fontSize: { xs: "40px", sm: "56px" } }}
            >
              Tu agenda online,{" "}
              <Typography
                variant="h1"
                component="span"
                fontWeight={700}
                color="primary.main"
                sx={{ fontSize: { xs: "40px", sm: "56px" } }}
              >
                lista para crecer
              </Typography>
            </Typography>

            <Typography variant="h6" fontWeight={400} color="textSecondary" mt={3} mb={5}>
              Reservas 24/7, recordatorios automáticos, pagos y control de caja. Todo para
              peluquerías, barberías, spas, clínicas y más.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems="center"
              spacing={3}
              mb={4}
              justifyContent="center"
            >
              <Button component={Link} color="primary" size="large" variant="contained" href="/register">
                Prueba gratis 10 días
              </Button>
              <Button component={Link} variant="outlined" color="inherit" size="large" href="#planes">
                Ver planes
              </Button>
            </Stack>
          </Grid>

          {lgUp ? (
            <Grid alignItems="end" display="flex" size={{ xs: 12, lg: 2 }}>
              <Image
                src="/images/frontend-pages/homepage/banner-top-right.svg"
                alt="decoración"
                width={350}
                height={220}
                style={{
                  borderRadius: "16px",
                  position: "absolute",
                  right: "24px",
                  boxShadow: "0px 6px 12px rgba(127, 145, 156, 0.12)",
                  height: "auto",
                  width: "auto",
                }}
              />
            </Grid>
          ) : null}
        </Grid>

        {lgUp ? (
          <Image
            src="/images/frontend-pages/homepage/bottom-part.svg"
            alt=""
            width={500}
            height={300}
            style={{ width: "100%", marginBottom: "-11px" }}
          />
        ) : null}
      </Container>
    </Box>
  );
};

export default Banner;
