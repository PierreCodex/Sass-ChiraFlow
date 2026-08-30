"use client";
import { use } from "react";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { buscarSeccion } from "@/features/administracion/nav";

/*
  El panel de una sección. Por ahora solo el encabezado: el formulario de cada
  una se maqueta después, uno a uno. Mientras tanto se enlaza la pantalla del
  panel que hoy hace ese trabajo, si existe.
*/
export default function SeccionAdminPage({
  params,
}: {
  params: Promise<{ grupo: string; seccion: string }>;
}) {
  const { grupo: grupoSlug, seccion: seccionSlug } = use(params);
  const encontrado = buscarSeccion(grupoSlug, seccionSlug);

  // Una URL inventada no saca al usuario de la vista: se queda con el índice
  // a la izquierda y un aviso a la derecha. `notFound()` pintaría la página de
  // error de Next, sin menú y sin manera de volver.
  if (!encontrado) {
    return (
      <Box sx={{ maxWidth: 760 }}>
        <Typography variant="h4" fontWeight={600}>
          Esa sección no existe
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Elige una del índice de la izquierda.
        </Typography>
      </Box>
    );
  }

  const { grupo, seccion } = encontrado;

  return (
    <Box sx={{ maxWidth: 760 }}>
      <Typography variant="caption" color="text.secondary" textTransform="uppercase">
        {grupo.titulo}
      </Typography>
      <Typography variant="h4" fontWeight={600} mt={0.5}>
        {seccion.titulo}
      </Typography>
      <Typography variant="body2" color="text.secondary" mt={1}>
        {seccion.descripcion}
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Stack spacing={2} alignItems="flex-start">
        <Alert severity="info" sx={{ width: "100%" }}>
          Esta sección todavía no tiene su formulario. Está por maquetar.
        </Alert>

        {seccion.rutaActual ? (
          <Button
            component={Link}
            href={seccion.rutaActual}
            variant="outlined"
            size="small"
          >
            Abrir la pantalla actual
          </Button>
        ) : null}
      </Stack>
    </Box>
  );
}
