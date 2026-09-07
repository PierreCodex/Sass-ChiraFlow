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
  /** `null` mientras el negocio no tenga nombre: todavía no hay enlace. */
  slug: string | null;
  nombreNegocio: string;
  /** `compacto` para incrustarlo dentro de otra tarjeta. */
  variante?: "tarjeta" | "compacto";
}

const EnlaceTienda = ({ slug, nombreNegocio, variante = "tarjeta" }: Props) => {
  const compacto = variante === "compacto";
  const [copiado, setCopiado] = useState(false);
  /*
    Sin slug no hay enlace, y el que se armaba era `https://null.midominio.com`:
    un enlace roto que se puede copiar y repartir por WhatsApp es peor que
    ninguno, porque el negocio no se entera hasta que un cliente le dice que no
    entra.
  */
  const url = slug ? urlTienda(slug) : null;

  const copiar = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
    } catch {
      // Sin permiso de portapapeles no se puede hacer más; el enlace se ve
      // igual y se puede seleccionar a mano.
    }
  };

  /*
    Sin `url` no se pasan `href`/`target`: el Button de MUI cambia de tipo
    segun lleve href o no --anchor o button--, y un `href={undefined}` no le
    vale a ninguna de las dos sobrecargas.
  */
  const comoEnlace = (destino: string | null) =>
    destino
      ? { href: destino, target: "_blank", rel: "noopener noreferrer" }
      : {};

  // Mensaje listo para pegar en WhatsApp, que es por donde se comparte aquí.
  const mensajeWhatsapp = encodeURIComponent(
    `¡Hola! Ya puedes reservar tu cita en ${nombreNegocio} desde aquí: ${url}`
  );

  const contenido = (
    <Stack
      // La variante compacta va siempre apilada: incrustada en una columna de
      // ~600 px, los tres botones no dejan sitio al texto y la URL se parte
      // letra a letra.
      direction={compacto ? "column" : { xs: "column", md: "row" }}
      spacing={2}
      alignItems={compacto ? "flex-start" : { md: "center" }}
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
          {url ? (
            <>
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
            </>
          ) : (
            <Typography variant="body2" color="textSecondary">
              Todavía no tienes dirección. Se crea sola en cuanto le pongas
              nombre a tu negocio, en <strong>Datos del negocio</strong>.
            </Typography>
          )}
        </Box>
      </Stack>

      <Stack direction="row" spacing={1} flexShrink={0} flexWrap="wrap" useFlexGap>
        {/*
          Sin enlace los tres botones se apagan en vez de esconderse: así se ve
          que el sitio existe y qué falta para encenderlo, en vez de parecer que
          esta pantalla no lleva nada.
        */}
        <Button
          variant="contained"
          startIcon={<IconExternalLink size={18} />}
          {...comoEnlace(url)}
          disabled={!url}
          sx={{ whiteSpace: "nowrap" }}
        >
          Ver mi sitio
        </Button>
        <Button
          variant="outlined"
          startIcon={<IconCopy size={18} />}
          onClick={copiar}
          disabled={!url}
          sx={{ whiteSpace: "nowrap" }}
        >
          Copiar
        </Button>
        <Button
          variant="outlined"
          color="success"
          startIcon={<IconBrandWhatsapp size={18} />}
          {...comoEnlace(url ? `https://wa.me/?text=${mensajeWhatsapp}` : null)}
          disabled={!url}
          sx={{ whiteSpace: "nowrap" }}
        >
          Compartir
        </Button>
      </Stack>
    </Stack>
  );

  return (
    <>
      {!compacto ? (
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
