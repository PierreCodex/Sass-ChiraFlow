"use client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { IconExternalLink, IconMapPin } from "@tabler/icons-react";

import type { LocalPublico } from "../types";

interface Props {
  local: LocalPublico;
}

/**
 * Mapa de la sede.
 *
 * Usa el `embed` de OpenStreetMap: **no necesita clave de API ni script
 * externo**, solo un iframe. Con Google Maps habría que registrar una clave y
 * facturarla por carga, que para una tienda pública multiplica el coste por
 * negocio.
 *
 * El botón "Cómo llegar" sí abre Google Maps, que es lo que la gente tiene
 * instalado en el móvil.
 */
const MapaLocal = ({ local }: Props) => {
  if (!local.latitud || !local.longitud) return null;

  const { latitud: lat, longitud: lng } = local;
  // Recuadro pequeño alrededor del punto: acerca el mapa a nivel de calle.
  const margen = 0.004;
  const bbox = [lng - margen, lat - margen, lng + margen, lat + margen].join(",");

  return (
    <Card>
      <Box
        component="iframe"
        title={`Mapa de ${local.nombre}`}
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`}
        loading="lazy"
        sx={{ width: "100%", height: 190, border: 0, display: "block" }}
      />
      <CardContent>
        <Stack direction="row" spacing={1} alignItems="flex-start" mb={2}>
          <Box sx={{ display: "flex", color: "primary.main", mt: 0.25 }}>
            <IconMapPin size={18} />
          </Box>
          <Typography variant="body2" color="textSecondary">
            {local.direccion ?? local.nombre}
          </Typography>
        </Stack>

        <Button
          fullWidth
          variant="outlined"
          size="small"
          endIcon={<IconExternalLink size={16} />}
          href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Cómo llegar
        </Button>
      </CardContent>
    </Card>
  );
};

export default MapaLocal;
