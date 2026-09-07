"use client";
import { use } from "react";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { useUsuarioActual } from "@/features/auth/hooks/useAuth";
import { useCapacidades } from "@/features/capacidades/hooks/useCapacidades";
import { buscarSeccion, puedeVerSeccion } from "@/features/administracion/nav";
import { panelDeSeccion } from "@/features/administracion/paneles";

/*
  El panel de una sección. Las que ya tienen el suyo lo montan desde
  `paneles.ts`; el resto sigue enseñando el aviso de «por maquetar» y, si
  existe, el enlace a la pantalla del panel que hoy hace ese trabajo.
*/
export default function SeccionAdminPage({
  params,
}: {
  params: Promise<{ grupo: string; seccion: string }>;
}) {
  const { grupo: grupoSlug, seccion: seccionSlug } = use(params);
  const encontrado = buscarSeccion(grupoSlug, seccionSlug);
  const { data: sesion } = useUsuarioActual();
  const { data: capacidades } = useCapacidades();
  const esAdminGeneral = sesion?.rol === "admin_general";

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

  /*
    Una sección del dueño abierta por su URL. Se explica en vez de mandar a un
    404: la sección existe, y quien llega aquí normalmente lo hace desde un
    enlace que alguien le pasó. Decirle «no existe» le haría buscar un error
    que no está de su lado.

    Esto NO es lo que protege los datos: `/usuarios` responde 403 a cualquiera
    que no sea el dueño, pase lo que pase con esta pantalla.
  */
  if (!puedeVerSeccion(seccion, { esAdminGeneral, capacidades })) {
    return (
      <Box sx={{ maxWidth: 760 }}>
        <Typography variant="h4" fontWeight={600}>
          {seccion.titulo}
        </Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          {seccion.soloAdminGeneral
            ? "Esta sección la gestiona el administrador general del negocio. Pídele que haga el cambio, o que te dé ese rol."
            : "Tu rol no incluye esta sección. Si necesitas entrar, pídeselo a quien administra el negocio."}
        </Alert>
      </Box>
    );
  }

  const Panel = panelDeSeccion(grupo.slug, seccion.slug);

  return (
    // El ancho se limita solo cuando no hay panel: un formulario corto se lee
    // mejor estrecho, pero una tabla necesita todo el sitio que haya.
    <Box sx={{ maxWidth: Panel ? "none" : 760 }}>
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

      {Panel ? (
        <Panel />
      ) : (
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
      )}
    </Box>
  );
}
