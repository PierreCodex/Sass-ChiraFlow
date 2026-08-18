"use client";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Link from "next/link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import type { NegocioResumen } from "../types";

interface Props {
  titulo: string;
  negocios: NegocioResumen[];
  /** Segunda línea de cada fila: "Pro · prueba" o "Vence 18/08/2026". */
  subtitulo: (negocio: NegocioResumen) => string;
  textoVacio: string;
}

/**
 * Tarjeta de lista reutilizada por "Negocios recientes" y "Suscripciones por
 * vencer" — mismo layout que el Blade de `superadmin/dashboard`, solo cambia
 * qué se muestra en la segunda línea.
 */
const NegocioListaCard = ({ titulo, negocios, subtitulo, textoVacio }: Props) => (
  <Card elevation={9}>
    <CardContent sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight={600} mb={2}>
        {titulo}
      </Typography>

      {negocios.length === 0 ? (
        <Typography variant="body2" color="textSecondary">
          {textoVacio}
        </Typography>
      ) : (
        <Stack divider={<Divider />}>
          {negocios.map((negocio) => (
            <Stack
              key={negocio.id}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              py={1.5}
            >
              <Stack spacing={0.25} minWidth={0}>
                <Typography variant="subtitle2" fontWeight={600} noWrap>
                  {negocio.nombre}
                </Typography>
                <Typography variant="caption" color="textSecondary" noWrap>
                  {subtitulo(negocio)}
                </Typography>
              </Stack>
              <Link
                href={`/superadmin/negocios/${negocio.id}`}
                style={{ flexShrink: 0 }}
              >
                <Typography variant="body2" color="primary.main" fontWeight={500}>
                  Ver
                </Typography>
              </Link>
            </Stack>
          ))}
        </Stack>
      )}
    </CardContent>
  </Card>
);

export default NegocioListaCard;
