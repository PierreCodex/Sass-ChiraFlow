"use client";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  IconCalendarEvent,
  IconCash,
  IconChartBar,
  IconBrandWhatsapp,
  IconWorld,
} from "@tabler/icons-react";

/**
 * Cuadrícula "bento" real de `homepage/features/Features.tsx`, con el mismo
 * layout de tarjetas de colores — pero con las funciones reales del SaaS en
 * vez de las que venden la plantilla en sí ("Light & Dark schemes", "50+ UI
 * Components"...), y sin las capturas del propio dashboard de Modernize.
 */
const Features = () => (
  <Box id="caracteristicas" pt={10} pb={10}>
    <Container maxWidth="lg">
      <Typography
        variant="h3"
        textAlign="center"
        fontWeight={700}
        sx={{ fontSize: { xs: 32, lg: 42 } }}
      >
        Todo lo que necesita tu negocio
      </Typography>
      <Typography variant="h6" fontWeight={400} color="textSecondary" textAlign="center" mt={2}>
        Una sola herramienta para agendar, cobrar y hacer crecer tu negocio.
      </Typography>

      <Grid container spacing={3} mt={3}>
        <Grid size={{ xs: "grow", sm: 6, lg: "grow" }}>
          <Box mb={3} bgcolor="warning.light" borderRadius="24px">
            <Box px={4} py="65px">
              <Stack direction="column" spacing={2} textAlign="center" alignItems="center">
                <IconCalendarEvent size={40} stroke={1.5} />
                <Typography variant="h6" fontWeight={700}>
                  Agenda online 24/7
                </Typography>
                <Typography variant="body1">
                  Tus clientes reservan solos, a cualquier hora, sin llamadas.
                </Typography>
              </Stack>
            </Box>
          </Box>
          <Box textAlign="center" mb={3} bgcolor="secondary.light" borderRadius="24px">
            <Box px={4} py="65px">
              <Stack direction="column" spacing={2} textAlign="center" alignItems="center">
                <IconBrandWhatsapp size={40} stroke={1.5} />
                <Typography variant="h6" fontWeight={700}>
                  Recordatorios automáticos
                </Typography>
                <Typography variant="body1">
                  Por WhatsApp y correo. Menos inasistencias, más ingresos.
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Grid>

        <Grid sx={{ order: { xs: 3, lg: 2 } }} size={{ xs: 12, lg: 5 }}>
          <Box textAlign="center" mb={3} bgcolor="primary.light" borderRadius="24px" height="100%">
            <Box pt="65px" pb="40px" px={5}>
              <IconChartBar size={50} stroke={1.5} />
              <Typography
                variant="h2"
                fontWeight={700}
                mt={4}
                sx={{ fontSize: { lg: "40px", xs: "35px" } }}
              >
                Un panel para todo
              </Typography>
              <Typography variant="body1" mt={2}>
                Dashboard con ingresos, citas del día y ocupación en{" "}
                <Typography component="span" fontWeight={600}>
                  tiempo real
                </Typography>
                .
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid sx={{ order: { xs: 2, lg: 3 } }} size={{ xs: "grow", sm: 6, lg: "grow" }}>
          <Box textAlign="center" mb={3} bgcolor="success.light" borderRadius="24px">
            <Box px={4} py="65px">
              <Stack direction="column" spacing={2} textAlign="center" alignItems="center">
                <IconCash size={40} stroke={1.5} />
                <Typography variant="h6" fontWeight={700}>
                  Caja y control de ingresos
                </Typography>
                <Typography variant="body1">Registra pagos, egresos y cierre de turno.</Typography>
              </Stack>
            </Box>
          </Box>
          <Box textAlign="center" mb={3} bgcolor="error.light" borderRadius="24px">
            <Box px={4} py="65px">
              <Stack direction="column" spacing={2} textAlign="center" alignItems="center">
                <IconWorld size={40} stroke={1.5} />
                <Typography variant="h6" fontWeight={700}>
                  Sitio web propio
                </Typography>
                <Typography variant="body1">
                  Tu negocio con subdominio personalizado, listo para compartir.
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  </Box>
);

export default Features;
