"use client";
import type { ReactNode } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

interface Props {
  titulo: string;
  /** Una línea de contexto. Solo si aporta algo que el título no dice. */
  descripcion?: string;
  /** Acciones de la pantalla, alineadas a la derecha en escritorio. */
  acciones?: ReactNode;
}

/**
 * Cabecera de las pantallas del panel.
 *
 * Sustituye al `Breadcrumb` de la plantilla, que gastaba **145 px** en repetir
 * "Inicio • Configuración" cuando el sidebar ya marca dónde estás: en
 * `/configuracion` el primer campo editable empezaba en el píxel 566 de 900,
 * o sea el 63% de la primera pantalla ocupado antes de poder escribir.
 *
 * Esto ocupa ~64 px y deja sitio para las acciones de la pantalla, que antes
 * no tenían dónde ir.
 */
const EncabezadoPagina = ({ titulo, descripcion, acciones }: Props) => (
  <Stack
    direction={{ xs: "column", sm: "row" }}
    justifyContent="space-between"
    alignItems={{ xs: "flex-start", sm: "center" }}
    spacing={2}
    mb={3}
  >
    <Box minWidth={0}>
      <Typography variant="h4" fontWeight={600}>
        {titulo}
      </Typography>
      {descripcion ? (
        <Typography variant="subtitle2" color="textSecondary" mt={0.5}>
          {descripcion}
        </Typography>
      ) : null}
    </Box>

    {acciones ? <Box flexShrink={0}>{acciones}</Box> : null}
  </Stack>
);

export default EncabezadoPagina;
