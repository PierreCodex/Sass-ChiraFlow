"use client";
import { useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { styled, useTheme } from "@mui/material/styles";
import { IconMinus, IconPlus } from "@tabler/icons-react";

const PREGUNTAS = [
  {
    pregunta: "¿Qué incluye la prueba gratuita de 10 días?",
    respuesta:
      "Acceso completo a las funciones de tu plan, sin tarjeta de crédito. Si no continúas, no se te cobra nada.",
  },
  {
    pregunta: "¿Puedo cancelar cuando quiera?",
    respuesta: "Sí. No hay permanencia mínima ni penalidad por cancelar.",
  },
  {
    pregunta: "¿Puedo usarlo con varias sucursales?",
    respuesta:
      "Sí, según el plan: Premium y Pro incluyen varias locaciones desde el mismo panel.",
  },
  {
    pregunta: "¿Mis clientes reciben recordatorios automáticos?",
    respuesta: "Sí, por WhatsApp y correo, para reducir las inasistencias.",
  },
  {
    pregunta: "¿Puedo personalizar el sitio con mi marca?",
    respuesta:
      "Sí — subdominio propio y colores personalizados, disponibles desde el plan Básico.",
  },
  {
    pregunta: "¿Cómo obtengo soporte?",
    respuesta:
      "Desde el panel, en la sección Soporte, o por WhatsApp — según el plan, con atención prioritaria.",
  },
];

/** Mismo acordeón real de `homepage/faq`, con preguntas propias del SaaS. */
const FAQ = () => {
  const theme = useTheme();
  const [abierto, setAbierto] = useState<number | null>(0);

  const StyledAccordian = styled(Accordion)(() => ({
    borderRadius: "8px",
    marginBottom: "16px !important",
    boxShadow:
      theme.palette.mode === "light" ? "0px 3px 0px rgba(235, 241, 246, 0.25)" : "unset",
    border: `1px solid ${theme.palette.divider}`,
    "&:before": { display: "none" },
    "&.Mui-expanded": { margin: 0 },
    "& .MuiAccordionSummary-root": { padding: "8px 24px", minHeight: "60px", fontSize: "18px", fontWeight: 500 },
    "& .MuiAccordionDetails-root": { padding: "0 24px 24px" },
  }));

  return (
    <Container id="faq" maxWidth="lg" sx={{ pb: { xs: "30px", lg: "60px" } }}>
      <Grid container spacing={3} justifyContent="center">
        <Grid size={{ xs: 12, lg: 8 }}>
          <Typography
            variant="h4"
            textAlign="center"
            lineHeight="1.2"
            fontWeight={700}
            sx={{ fontSize: { lg: "40px", xs: "35px" } }}
          >
            Preguntas frecuentes
          </Typography>
          <Box mt={7}>
            {PREGUNTAS.map((item, i) => (
              <StyledAccordian
                key={item.pregunta}
                expanded={abierto === i}
                onChange={() => setAbierto(abierto === i ? null : i)}
              >
                <AccordionSummary
                  expandIcon={abierto === i ? <IconMinus size={21} stroke={1.5} /> : <IconPlus size={21} stroke={1.5} />}
                >
                  {item.pregunta}
                </AccordionSummary>
                <AccordionDetails>{item.respuesta}</AccordionDetails>
              </StyledAccordian>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FAQ;
