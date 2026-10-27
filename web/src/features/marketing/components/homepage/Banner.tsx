"use client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";

/**
 * La portada de la landing: titular, subtítulo y las dos llamadas a la
 * acción, centrados.
 *
 * Encima, la animación del logo.
 *
 * Sin las decoraciones de la demo de Modernize (`banner-top-left.svg`,
 * `banner-top-right.svg`, `bottom-part.svg`): eran capturas de su dashboard,
 * en inglés y en dólares, colocadas con `position: absolute`, así que según
 * el ancho de la pantalla tapaban el texto. Sin nada flotando, la portada se
 * adapta sola a cualquier ancho.
 */
const TITULO = { xs: "34px", sm: "48px", md: "60px", lg: "68px" };

const Banner = () => (
  <Box bgcolor="primary.light" py={{ xs: 7, md: 11 }}>
    <Container maxWidth="md" sx={{ textAlign: "center" }}>
      {/*
       * La animación del logo, una sola vez: sin `loop`, el vídeo se queda en
       * el último fotograma, que es el logo completo. Su fondo es blanco; con
       * `multiply` el blanco toma el color de la franja y no se ve el recuadro.
       */}
      <Box
        component="video"
        src="/images/logos/tivu-intro.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-label="tivu"
        sx={{
          display: "block",
          width: { xs: 280, sm: 380, md: 460 },
          maxWidth: "100%",
          mx: "auto",
          mb: { xs: 2, md: 3 },
          mixBlendMode: "multiply",
        }}
      />
      <Typography variant="h1" fontWeight={700} lineHeight={1.15} sx={{ fontSize: TITULO }}>
        Tu tiempo,{" "}
        <Box component="span" color="primary.main">
          a tu manera
        </Box>
      </Typography>

      <Typography
        color="textSecondary"
        mt={3}
        mb={5}
        mx="auto"
        maxWidth={640}
        sx={{ fontSize: { xs: "16px", md: "19px" }, lineHeight: 1.6 }}
      >
        Reservas 24/7, recordatorios automáticos, pagos y control de caja. Todo para
        peluquerías, barberías, spas, clínicas y más.
      </Typography>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="center"
        alignItems={{ xs: "stretch", sm: "center" }}
      >
        <Button component={Link} color="primary" size="large" variant="contained" href="/register">
          Prueba gratis 7 días
        </Button>
        <Button component={Link} variant="outlined" color="inherit" size="large" href="#planes">
          Ver planes
        </Button>
      </Stack>
    </Container>
  </Box>
);

export default Banner;
