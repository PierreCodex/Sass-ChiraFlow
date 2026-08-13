"use client";
import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Snackbar from "@mui/material/Snackbar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  IconBrandWhatsapp,
  IconCopy,
  IconExternalLink,
  IconWorld,
} from "@tabler/icons-react";

import { env } from "@/config/env";

/**
 * Enlace público de reservas del negocio.
 *
 * Se arma igual que `subdominio_url()` en Laravel: con dominio configurado va
 * por subdominio; sin él, por ruta. Así lo que se ve en el panel es
 * **exactamente** lo que el negocio va a repartir.
 */
export function urlTienda(slug: string) {
  if (typeof window === "undefined") return `/reservar/${slug}`;

  return env.appDomain
    ? `${window.location.protocol}//${slug}.${env.appDomain}`
    : `${window.location.origin}/reservar/${slug}`;
}

interface Props {
  slug: string;
  nombreNegocio: string;
  /** `compacto` para incrustarlo dentro de otra tarjeta. */
  variante?: "tarjeta" | "compacto";
}

const EnlaceTienda = ({ slug, nombreNegocio, variante = "tarjeta" }: Props) => {
  const [copiado, setCopiado] = useState(false);
  const url = urlTienda(slug);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
    } catch {
      // Sin permiso de portapapeles no se puede hacer más; el enlace se ve
      // igual y se puede seleccionar a mano.
    }
  };

  // Mensaje listo para pegar en WhatsApp, que es por donde se comparte aquí.
  const mensajeWhatsapp = encodeURIComponent(
    `¡Hola! Ya puedes reservar tu cita en ${nombreNegocio} desde aquí: ${url}`
  );

  const contenido = (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={2}
      alignItems={{ md: "center" }}
      justifyContent="space-between"
    >
      <Stack direction="row" spacing={2} alignItems="flex-start" minWidth={0}>
        <Box sx={{ display: "flex", color: "primary.main", mt: 0.5 }}>
          <IconWorld size={22} />
        </Box>
        <Box minWidth={0}>
          <Typography variant="subtitle1" fontWeight={600}>
            Tu sitio de reservas
          </Typography>
          <Typography
            component="a"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            variant="body2"
            color="primary"
            sx={{ wordBreak: "break-all", textDecoration: "none" }}
          >
            {url}
          </Typography>
          <Typography variant="caption" color="textSecondary" display="block">
            Compártelo con tus clientes para que reserven solos.
          </Typography>
        </Box>
      </Stack>

      <Stack direction="row" spacing={1} flexShrink={0} flexWrap="wrap" useFlexGap>
        <Button
          variant="contained"
          startIcon={<IconExternalLink size={18} />}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ whiteSpace: "nowrap" }}
        >
          Ver mi sitio
        </Button>
        <Button
          variant="outlined"
          startIcon={<IconCopy size={18} />}
          onClick={copiar}
          sx={{ whiteSpace: "nowrap" }}
        >
          Copiar
        </Button>
        <Button
          variant="outlined"
          color="success"
          startIcon={<IconBrandWhatsapp size={18} />}
          href={`https://wa.me/?text=${mensajeWhatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ whiteSpace: "nowrap" }}
        >
          Compartir
        </Button>
      </Stack>
    </Stack>
  );

  return (
    <>
      {variante === "tarjeta" ? (
        <Card elevation={9}>
          <CardContent sx={{ p: 3 }}>{contenido}</CardContent>
        </Card>
      ) : (
        <Box
          sx={{
            p: 2,
            borderRadius: 1,
            bgcolor: "grey.100",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {contenido}
        </Box>
      )}

      <Snackbar
        open={copiado}
        autoHideDuration={2500}
        onClose={() => setCopiado(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" onClose={() => setCopiado(false)}>
          Enlace copiado
        </Alert>
      </Snackbar>
    </>
  );
};

export default EnlaceTienda;
