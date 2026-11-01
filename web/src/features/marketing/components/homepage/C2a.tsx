"use client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";

import Image from "next/image";

/**
 * Misma tarjeta redondeada de CTA que `shared/c2a`, con un mockup del
 * Dashboard real del panel de negocio en vez del montage de capturas de
 * Modernize (`design-collection.png`) que no representa este producto.
 */
const C2a = () => {

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
                  Prueba gratis 7 días
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

        {/* Solo donde hay sitio al lado del texto; lo decide el CSS. */}
        <Box
          sx={{
            display: { xs: "none", lg: "block" },
            position: "absolute",
            right: "48px",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          <Box sx={{ width: 560, borderRadius: "16px", overflow: "hidden", boxShadow: "0px 12px 30px rgba(74, 44, 245, 0.15)" }}>
            <Image src="/images/landing/caja-movimientos.png" alt="La caja del día en tivu" width={963} height={504} style={{ width: "100%", height: "auto", display: "block" }} />
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default C2a;
