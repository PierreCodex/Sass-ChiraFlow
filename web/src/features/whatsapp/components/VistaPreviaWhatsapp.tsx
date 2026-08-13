"use client";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { IconChecks } from "@tabler/icons-react";

import { DATOS_MUESTRA, renderizarPlantilla } from "../constants";

interface Props {
  contenido: string;
}

/**
 * Burbuja de mensaje con el contenido ya renderizado con los datos de muestra.
 *
 * La app actual superpone el texto sobre una captura de un teléfono
 * (`images/23324aa.png`). Aquí la burbuja se dibuja con CSS: no depende de un
 * asset, se adapta al ancho y funciona en modo oscuro.
 */
const VistaPreviaWhatsapp = ({ contenido }: Props) => {
  const mensaje = renderizarPlantilla(contenido, DATOS_MUESTRA);

  return (
    <Box>
      <Typography variant="subtitle2" color="textSecondary" mb={1.5}>
        Así lo recibe el cliente
      </Typography>

      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          // Verde tenue tipo chat, legible en ambos temas.
          bgcolor: "success.light",
          minHeight: 140,
        }}
      >
        <Box
          sx={{
            bgcolor: "background.paper",
            borderRadius: 2,
            borderTopLeftRadius: 0,
            p: 1.5,
            maxWidth: 320,
            boxShadow: 1,
          }}
        >
          {mensaje.trim() ? (
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
              {mensaje}
            </Typography>
          ) : (
            <Typography variant="body2" color="textSecondary" fontStyle="italic">
              Escribe el mensaje para ver la vista previa.
            </Typography>
          )}

          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            justifyContent="flex-end"
            mt={0.5}
          >
            <Typography variant="caption" color="textSecondary">
              9:00
            </Typography>
            <Box component="span" sx={{ display: "flex", color: "info.main" }}>
              <IconChecks size={14} />
            </Box>
          </Stack>
        </Box>
      </Box>

      <Typography variant="caption" color="textSecondary" display="block" mt={1}>
        Las variables se reemplazan con datos de ejemplo. Al enviarse de verdad
        usan los de la cita.
      </Typography>
    </Box>
  );
};

export default VistaPreviaWhatsapp;
