"use client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import Link from "next/link";

/**
 * Hero de `frontend-pages/homepage/banner` de Modernize con el producto real:
 * a los lados, las citas del día del panel y la tienda pública en un
 * celular; abajo, el dashboard. Las imágenes van en el flujo de la cuadrícula
 * (no `position: absolute` como en la plantilla), así nunca tapan el texto.
 */
const marco = {
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow: "0px 12px 30px rgba(74, 44, 245, 0.12)",
  bgcolor: "background.paper",
};

const Banner = () => (
  <Box bgcolor="primary.light" pt={{ xs: 6, lg: 8 }} overflow="hidden">
    <Container sx={{ maxWidth: "1400px !important" }}>
      <Grid container spacing={4} alignItems="center" mb={{ xs: 6, lg: 6 }}>
        <Grid size={{ lg: 3 }} sx={{ display: { xs: "none", lg: "block" } }}>
          <Box sx={{ ...marco, transform: "rotate(-3deg)" }}>
            <Image
              src="/images/landing/citas-hoy.png"
              alt="Las citas del día en el panel de tivu"
              width={455}
              height={486}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }} textAlign="center">
          <Typography
            variant="h1"
            fontWeight={700}
            lineHeight="1.15"
            sx={{ fontSize: { xs: "36px", sm: "52px" } }}
          >
            Tus clientes reservan solos.{" "}
            <Box component="span" color="primary.main">
              Tú atiendes.
            </Box>
          </Typography>

          <Typography
            variant="h6"
            fontWeight={400}
            color="textSecondary"
            mt={3}
            mb={5}
            sx={{ fontSize: { xs: 16, sm: 18 } }}
          >
            Tu agenda, tu página de reservas y tu caja en un solo lugar. En
            soles y con recordatorios por WhatsApp, para salones, barberías,
            spas y clínicas.
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
          >
            <Button component={Link} size="large" variant="contained" href="/register">
              Prueba gratis 7 días
            </Button>
            <Button component={Link} size="large" variant="outlined" color="inherit" href="#como-funciona">
              Cómo funciona
            </Button>
          </Stack>
          <Typography fontSize="13px" color="textSecondary" mt={2}>
            Sin tarjeta de crédito · Cancela cuando quieras
          </Typography>
        </Grid>

        <Grid size={{ lg: 3 }} sx={{ display: { xs: "none", lg: "flex" }, justifyContent: "center" }}>
          <Box
            sx={{
              ...marco,
              width: 230,
              borderRadius: "32px",
              border: "8px solid",
              borderColor: "grey.900",
              transform: "rotate(3deg)",
            }}
          >
            <Image
              src="/images/landing/tienda-movil.png"
              alt="La página de reservas de un negocio en el celular"
              width={390}
              height={780}
              style={{ width: "100%", height: "auto", display: "block" }}
            />
          </Box>
        </Grid>
      </Grid>

      {/* El dashboard asoma por abajo, como en la plantilla. */}
      <Box
        sx={{
          ...marco,
          borderRadius: "16px 16px 0 0",
          maxWidth: 1100,
          mx: "auto",
          maxHeight: { xs: 220, sm: 380, lg: 460 },
        }}
      >
        <Box display="flex" gap={0.75} px={2} py={1.25} bgcolor="grey.100">
          {["error.main", "warning.main", "success.main"].map((c) => (
            <Box key={c} width={10} height={10} borderRadius="50%" bgcolor={c} />
          ))}
        </Box>
        <Image
          src="/images/landing/panel.png"
          alt="El panel de tivu"
          width={1440}
          height={900}
          style={{ width: "100%", height: "auto", display: "block" }}
          priority
        />
      </Box>
    </Container>
  </Box>
);

export default Banner;
