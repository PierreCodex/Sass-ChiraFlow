"use client";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

/**
 * «Cómo funciona» en tres pasos. Sustituye a las cifras del Blade anterior,
 * que no tenían clientes detrás que las respaldaran.
 */
const PASOS = [
  {
    titulo: "Crea tu negocio",
    texto: "Tus servicios, tus profesionales y tus horarios, en unos minutos.",
  },
  {
    titulo: "Comparte tu enlace",
    texto: "Tu página de reservas con tu nombre. Mándala por WhatsApp o ponla en Instagram.",
  },
  {
    titulo: "Recibe reservas",
    texto: "Tus clientes eligen hora solos; tú las ves en tu agenda y cobras en tu caja.",
  },
];

const StatsSection = () => (
  <Box id="como-funciona" sx={{ py: { xs: 8, md: 12 } }}>
    <Container maxWidth="lg">
      <Typography
        variant="h3"
        fontWeight={700}
        mb={6}
        textAlign="center"
        sx={{ fontSize: { xs: 26, md: 34 } }}
      >
        Cómo funciona
      </Typography>
      <Grid container spacing={4}>
        {PASOS.map((paso, i) => (
          <Grid key={paso.titulo} size={{ xs: 12, md: 4 }} textAlign="center">
            <Box
              mx="auto"
              mb={2}
              width={56}
              height={56}
              borderRadius="50%"
              display="flex"
              alignItems="center"
              justifyContent="center"
              bgcolor="primary.light"
              color="primary.main"
              fontSize={24}
              fontWeight={700}
            >
              {i + 1}
            </Box>
            <Typography variant="h5" fontWeight={700} mb={1}>
              {paso.titulo}
            </Typography>
            <Typography color="textSecondary">{paso.texto}</Typography>
          </Grid>
        ))}
      </Grid>
    </Container>
  </Box>
);

export default StatsSection;
