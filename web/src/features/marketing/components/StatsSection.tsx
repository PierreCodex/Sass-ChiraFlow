"use client";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

/** Mismas 6 estadísticas que la sección de imágenes animadas del Blade. */
const ESTADISTICAS = [
  { numero: "82%", texto: "Crecen nuestros clientes en 24 meses" },
  { numero: "90%", texto: "Menos inasistencias" },
  { numero: "30 hrs", texto: "de ahorro en gestión" },
  { numero: "320%", texto: "De aumento en retorno de inversión" },
  { numero: "40%", texto: "Más clientes recurrentes" },
  { numero: "70%", texto: "Más reservas fuera de horario de atención" },
];

const StatsSection = () => (
  <Box sx={{ py: { xs: 8, md: 12 } }}>
    <Container maxWidth="lg">
      <Typography
        variant="h3"
        fontWeight={700}
        mb={6}
        textAlign="center"
        sx={{ fontSize: { xs: 26, md: 34 } }}
      >
        Cada cita es crecimiento
      </Typography>
      <Grid container spacing={4}>
        {ESTADISTICAS.map((stat) => (
          <Grid key={stat.texto} size={{ xs: 6, md: 4 }}>
            <Box textAlign="center">
              <Typography variant="h3" fontWeight={700} color="primary.main">
                {stat.numero}
              </Typography>
              <Typography variant="body2" color="textSecondary" mt={0.5}>
                {stat.texto}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Container>
  </Box>
);

export default StatsSection;
