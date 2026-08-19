"use client";
import { useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { IconX } from "@tabler/icons-react";

/**
 * Barra de anuncio real de la demo, sin los PNGs decorativos de fondo (son
 * capturas del dashboard de Modernize, no aplican aquí) y con nuestro copy.
 */
const HeaderAlert = () => {
  const [visible, setVisible] = useState(true);
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));

  if (!visible) return null;

  return (
    <Box bgcolor="primary.main" textAlign="center" py="11px" position="relative">
      <Stack direction={{ xs: "column", sm: "row" }} spacing="16px" justifyContent="center" alignItems="center">
        {lgUp ? (
          <Chip
            label="Nuevo"
            size="small"
            sx={{ backgroundColor: "rgba(255,255,255,0.15)", color: "white", borderRadius: "8px" }}
          />
        ) : null}
        <Typography variant="body1" color="white" fontWeight={500} fontSize="13px" sx={{ opacity: 0.9 }}>
          10 días de prueba gratis, sin tarjeta de crédito
        </Typography>
      </Stack>
      <IconButton
        onClick={() => setVisible(false)}
        color="secondary"
        sx={{ zIndex: 1, position: "absolute", right: "6px", top: "6px" }}
      >
        <IconX size={18} color="white" />
      </IconButton>
    </Box>
  );
};

export default HeaderAlert;
