"use client";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

interface ItemProps {
  muestra: React.ReactNode;
  texto: string;
}

const Item = ({ muestra, texto }: ItemProps) => (
  <Stack direction="row" spacing={0.75} alignItems="center">
    {muestra}
    <Typography variant="caption" color="textSecondary">
      {texto}
    </Typography>
  </Stack>
);

/** Explica qué significa cada fondo de la rejilla. */
const LeyendaCalendario = () => (
  <Stack direction="row" spacing={2.5} flexWrap="wrap" useFlexGap mt={2}>
    <Item
      texto="Disponible para agendar"
      muestra={
        <Box
          sx={{
            width: 16,
            height: 16,
            borderRadius: 0.5,
            border: "1px solid",
            borderColor: "divider",
          }}
        />
      }
    />
    <Item
      texto="Fuera de horario o en descanso"
      muestra={
        <Box
          sx={{
            width: 16,
            height: 16,
            borderRadius: 0.5,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "rgba(99, 115, 129, 0.07)",
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(99,115,129,.25) 3px, rgba(99,115,129,.25) 6px)",
          }}
        />
      }
    />
    <Item
      texto="Cita agendada"
      muestra={
        <Box
          sx={{
            width: 16,
            height: 16,
            borderRadius: 0.5,
            bgcolor: "primary.light",
            borderLeft: "3px solid",
            borderColor: "primary.main",
          }}
        />
      }
    />
  </Stack>
);

export default LeyendaCalendario;
