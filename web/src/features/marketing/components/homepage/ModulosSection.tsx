"use client";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";

import ModulosCarousel from "./ModulosCarousel";

/** Mismo bloque que `homepage/powerful-dozens`: título oscuro + carrusel debajo. */
const ModulosSection = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
        color: theme.palette.primary.contrastText,
        py: { xs: 6, lg: 10 },
        overflow: "hidden",
      }}
    >
      <Container maxWidth="lg" sx={{ mb: 5 }}>
        <Typography
          variant="h3"
          fontWeight={700}
          lineHeight={1.3}
          sx={{ fontSize: { xs: 28, lg: 42 } }}
        >
          Descubre todos los módulos hechos para tu negocio
        </Typography>
      </Container>

      <Container maxWidth="lg">
        <ModulosCarousel />
      </Container>
    </Box>
  );
};

export default ModulosSection;
