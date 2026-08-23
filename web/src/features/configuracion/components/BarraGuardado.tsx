"use client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Slide from "@mui/material/Slide";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { IconAlertCircle } from "@tabler/icons-react";

interface Props {
  visible: boolean;
  guardando: boolean;
  onDescartar: () => void;
}

/**
 * Barra de guardado, pegada abajo y **solo cuando hay cambios**.
 *
 * Con 19 campos repartidos en cuatro pestañas, el botón al final del scroll
 * obligaba a bajar hasta el fondo para guardar y, peor, no avisaba de que
 * quedaba algo sin guardar al cambiar de pestaña.
 *
 * No es guardado automático a propósito: estos campos alimentan la tienda
 * pública y el cálculo de disponibilidad. Un horario mal tecleado y guardado
 * al instante deja al negocio sin huecos sin que nadie lo haya confirmado.
 */
const BarraGuardado = ({ visible, guardando, onDescartar }: Props) => (
  <Slide direction="up" in={visible} mountOnEnter unmountOnExit>
    <Box
      sx={{
        position: "sticky",
        bottom: 0,
        zIndex: 2,
        px: 3,
        py: 2,
        // El Fab del Customizer vive en `right: 25px; bottom: 15px` y caía
        // justo encima de "Guardar cambios".
        pr: { xs: 3, sm: 13 },
        borderTop: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        // El contenido de la pestaña se ve por debajo al hacer scroll; sin
        // sombra la barra se confunde con el propio formulario.
        boxShadow: "0 -8px 20px rgba(0,0,0,0.06)",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ sm: "center" }}
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{ display: "flex", color: "warning.main" }}>
            <IconAlertCircle size={20} />
          </Box>
          <Typography variant="body2" color="textSecondary">
            Tienes cambios sin guardar
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Button color="inherit" onClick={onDescartar} disabled={guardando}>
            Descartar
          </Button>
          <Button type="submit" variant="contained" disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar cambios"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  </Slide>
);

export default BarraGuardado;
