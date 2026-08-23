"use client";
import type { ReactNode } from "react";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

interface Props {
  titulo: string;
  descripcion?: string;
  children: ReactNode;
  /** La última sección de una pestaña no lleva separador. */
  sinSeparador?: boolean;
}

/**
 * Subsección de un formulario largo: el rótulo y su explicación a la
 * izquierda, los campos a la derecha.
 *
 * Es el patrón clásico de las pantallas de ajustes, y aquí hace falta: la
 * pestaña "Negocio" son diez campos seguidos, imposibles de escanear cuando
 * van todos en la misma columna sin agrupar.
 *
 * Por debajo de `md` se apila, que en móvil leer dos columnas de 180 px no
 * lleva a ninguna parte.
 */
const SeccionCampos = ({
  titulo,
  descripcion,
  children,
  sinSeparador,
}: Props) => (
  <Box>
    <Grid container spacing={{ xs: 1, md: 4 }}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Typography variant="h6" fontWeight={600}>
          {titulo}
        </Typography>
        {descripcion ? (
          <Typography variant="body2" color="textSecondary" mt={0.5}>
            {descripcion}
          </Typography>
        ) : null}
      </Grid>

      <Grid size={{ xs: 12, md: 8 }}>{children}</Grid>
    </Grid>

    {sinSeparador ? null : <Divider sx={{ my: 4 }} />}
  </Box>
);

export default SeccionCampos;
