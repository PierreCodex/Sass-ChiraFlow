"use client";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Rating from "@mui/material/Rating";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { IconClock, IconMapPin, IconPhone } from "@tabler/icons-react";

import type { LocalPublico, NegocioPublico, ResumenResenas } from "../types";

interface Props {
  negocio: NegocioPublico;
  local: LocalPublico;
  resenas?: ResumenResenas | null;
}

/** "Clínica El Rosal" -> "CR": una letra por palabra con peso. */
function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .filter((parte) => parte.length > 2)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}

/**
 * Portada de la tienda.
 *
 * Una tienda de reservas se abre con una imagen, no con una barra de menú: es
 * lo primero que decide si el cliente sigue. Si el local no tiene banner
 * cargado, el fondo se construye con **su color de marca** en degradado, así
 * nunca queda un hueco gris.
 */
const PortadaLocal = ({ negocio, local, resenas }: Props) => (
  <Box
    sx={(theme) => {
      const marca = local.color ?? theme.palette.primary.main;
      return {
        position: "relative",
        color: "common.white",
        overflow: "hidden",
        backgroundImage: local.banner_url
          ? `linear-gradient(to bottom, ${alpha("#000", 0.25)}, ${alpha("#000", 0.75)}), url(${local.banner_url})`
          : `linear-gradient(135deg, ${marca}, ${alpha(marca, 0.6)})`,
        backgroundSize: "cover",
        backgroundPosition: "center",

        // Dos halos de luz: sin ellos el degradado se lee como un rectángulo
        // plano de color, que es justo lo que hacía la portada aburrida.
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(circle at 85% 15%, ${alpha("#fff", 0.22)}, transparent 45%),
                            radial-gradient(circle at 10% 110%, ${alpha("#000", 0.25)}, transparent 55%)`,
          pointerEvents: "none",
        },
      };
    }}
  >
    <Container
      maxWidth="lg"
      sx={{ py: { xs: 5, md: 8 }, position: "relative", zIndex: 1 }}
    >
      <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="flex-start">
        <Avatar
          src={local.logo_url ?? undefined}
          variant="rounded"
          sx={{
            width: { xs: 72, md: 96 },
            height: { xs: 72, md: 96 },
            border: "3px solid",
            borderColor: "common.white",
            bgcolor: "common.white",
            color: local.color ?? "primary.main",
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          {iniciales(negocio.nombre)}
        </Avatar>

        <Box minWidth={0}>
          <Typography variant="h2" fontWeight={700} color="inherit">
            {negocio.nombre}
          </Typography>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography variant="h6" color="inherit" sx={{ opacity: 0.9 }}>
              {local.nombre}
            </Typography>

            {/* La valoración va arriba del todo: es lo que decide si sigue. */}
            {resenas ? (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Rating
                  value={resenas.promedio}
                  precision={0.1}
                  readOnly
                  size="small"
                  sx={{ "& .MuiRating-iconEmpty": { color: alpha("#fff", 0.4) } }}
                />
                <Typography variant="body2" color="inherit" fontWeight={600}>
                  {resenas.promedio}
                </Typography>
                <Typography variant="body2" color="inherit" sx={{ opacity: 0.75 }}>
                  ({resenas.total})
                </Typography>
              </Stack>
            ) : null}
          </Stack>

          {local.descripcion ? (
            <Typography
              color="inherit"
              sx={{ opacity: 0.85, mt: 1, maxWidth: 620 }}
            >
              {local.descripcion}
            </Typography>
          ) : null}

          {/* Los tres datos que el cliente busca antes de reservar. */}
          <Stack
            direction="row"
            spacing={3}
            flexWrap="wrap"
            useFlexGap
            mt={2}
            sx={{ opacity: 0.9 }}
          >
            {local.direccion ? (
              <Stack direction="row" spacing={0.75} alignItems="center">
                <IconMapPin size={16} />
                <Typography variant="body2" color="inherit">
                  {local.direccion}
                </Typography>
              </Stack>
            ) : null}
            {local.telefono ? (
              <Stack direction="row" spacing={0.75} alignItems="center">
                <IconPhone size={16} />
                <Typography variant="body2" color="inherit">
                  {local.telefono}
                </Typography>
              </Stack>
            ) : null}
            {local.horario_desde && local.horario_hasta ? (
              <Stack direction="row" spacing={0.75} alignItems="center">
                <IconClock size={16} />
                <Typography variant="body2" color="inherit">
                  {local.horario_desde} – {local.horario_hasta}
                </Typography>
              </Stack>
            ) : null}
          </Stack>

          {/*
            La portada ocupa la primera pantalla entera: sin un botón, en
            móvil el cliente no ve ni un servicio antes de scrollear.
          */}
          <Stack direction="row" spacing={1.5} mt={3} flexWrap="wrap" useFlexGap>
            <Button
              variant="contained"
              size="large"
              onClick={() =>
                document
                  .getElementById("catalogo")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              sx={{
                bgcolor: "common.white",
                color: local.color ?? "primary.main",
                "&:hover": { bgcolor: "common.white", opacity: 0.9 },
              }}
            >
              Ver servicios y reservar
            </Button>

            {local.telefono ? (
              <Button
                variant="outlined"
                size="large"
                href={`tel:${local.telefono.replace(/\s/g, "")}`}
                startIcon={<IconPhone size={18} />}
                sx={{
                  color: "common.white",
                  borderColor: alpha("#fff", 0.6),
                  "&:hover": { borderColor: "common.white", bgcolor: alpha("#fff", 0.1) },
                }}
              >
                Llamar
              </Button>
            ) : null}
          </Stack>
        </Box>
      </Stack>
    </Container>
  </Box>
);

export default PortadaLocal;
