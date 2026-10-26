"use client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import useMediaQuery from "@mui/material/useMediaQuery";

import DashboardMockup from "./DashboardMockup";

/**
 * Misma tarjeta redondeada de CTA que `shared/c2a`, con un mockup del
 * Dashboard real del panel de negocio en vez del montage de capturas de
 * Modernize (`design-collection.png`) que no representa este producto.
 */
const C2a = () => {
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));

  return (
    <Container sx={{ maxWidth: "1400px !important", py: { xs: "20px", lg: "30px" } }}>
      <Box
        bgcolor="primary.light"
        borderRadius="24px"
        overflow="hidden"
        position="relative"
        sx={{ py: { xs: "40px", lg: "70px" } }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, lg: 6 }}>
              <Typography
                variant="h4"
                mb={3}
                fontWeight={700}
                lineHeight="1.4"
                sx={{ fontSize: { lg: "40px", xs: "30px" } }}
              >
                Empieza a recibir reservas hoy mismo
              </Typography>
              <Stack spacing={{ xs: 1, sm: 2 }} direction="row" flexWrap="wrap" mb={3}>
                <Button component={Link} variant="contained" size="large" href="/register">
                  Prueba gratis 10 días
                </Button>
                <Button component={Link} variant="outlined" size="large" href="/login">
                  Iniciar sesión
                </Button>
              </Stack>
              <Typography fontSize="14px">
                <Box fontWeight={600} component="span">
                  Sin tarjeta de crédito
                </Box>{" "}
                — cancela cuando quieras.
              </Typography>
            </Grid>
          </Grid>
        </Container>

        {lgUp ? (
          <Box sx={{ position: "absolute", right: "-40px", top: "50%", transform: "translateY(-50%)" }}>
            <DashboardMockup />
          </Box>
        ) : null}
      </Box>
    </Container>
  );
};

export default C2a;
