"use client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { dialogoResponsive } from "@/components/shared/estilos-formulario";

import {
  DATOS_MUESTRA,
  EVENTOS_WHATSAPP,
  PLANTILLAS_PREDISENADAS,
  renderizarPlantilla,
} from "../constants";
import type { PlantillaPredisenada } from "../types";

interface Props {
  abierto: boolean;
  /** Eventos que ya tienen plantilla, para marcarlos. */
  eventosUsados: string[];
  onElegir: (plantilla: PlantillaPredisenada) => void;
  onCerrar: () => void;
}

/**
 * Galería de las 8 plantillas prediseñadas del backend.
 *
 * En la app actual esto es un modal con enlaces a
 * `/plantillas-whatsapp/create?predisenada=<key>`. Aquí, elegir una abre
 * directamente el formulario con el contenido precargado.
 */
const PredisenadasDialog = ({
  abierto,
  eventosUsados,
  onElegir,
  onCerrar,
}: Props) => (
  <Dialog
      sx={dialogoResponsive} open={abierto} onClose={onCerrar} fullWidth maxWidth="md">
    <DialogTitle component="div">
      <Typography variant="h5" fontWeight={600}>
        Plantillas prediseñadas
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Elige una para empezar; luego puedes editarla a tu gusto.
      </Typography>
    </DialogTitle>

    <Divider />

    <DialogContent>
      <Grid container spacing={2}>
        {PLANTILLAS_PREDISENADAS.map((plantilla) => {
          const usada = eventosUsados.includes(plantilla.key);

          return (
            <Grid key={plantilla.key} size={{ xs: 12, sm: 6 }}>
              <Card
                elevation={0}
                onClick={() => onElegir(plantilla)}
                sx={{
                  height: "100%",
                  cursor: "pointer",
                  border: "1px solid",
                  borderColor: "divider",
                  transition: "border-color .15s",
                  "&:hover": { borderColor: "primary.main" },
                }}
              >
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={1}
                    mb={1}
                  >
                    <Typography variant="subtitle2" fontWeight={600}>
                      {plantilla.nombre}
                    </Typography>
                    {usada ? (
                      <Chip size="small" label="Ya la tienes" />
                    ) : null}
                  </Stack>

                  <Typography variant="caption" color="textSecondary" display="block" mb={1}>
                    {EVENTOS_WHATSAPP[plantilla.key]}
                  </Typography>

                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: "grey.100",
                    }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      {renderizarPlantilla(plantilla.contenido, DATOS_MUESTRA)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </DialogContent>

    <Divider />

    <DialogActions sx={{ p: 3 }}>
      <Button onClick={onCerrar} color="inherit">
        Cerrar
      </Button>
    </DialogActions>
  </Dialog>
);

export default PredisenadasDialog;
