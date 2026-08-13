"use client";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import Rating from "@mui/material/Rating";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { formatFecha } from "@/lib/format";
import type { Resena, ResumenResenas } from "../types";

interface Props {
  resumen: ResumenResenas | null;
  resenas: Resena[];
}

const ESTRELLAS = [5, 4, 3, 2, 1] as const;

/**
 * Valoraciones de la sede.
 *
 * Es lo que más pesa al decidir dónde reservar, así que va después del
 * catálogo y no escondido. Si el negocio aún no tiene ninguna, la sección
 * **no se pinta**: un "0 reseñas" en una tienda recién abierta resta más de
 * lo que suma.
 */
const ResenasLocal = ({ resumen, resenas }: Props) => {
  if (!resumen || resenas.length === 0) return null;

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight={600} mb={3}>
          Lo que dicen los clientes
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={4}
          alignItems={{ sm: "center" }}
          mb={3}
        >
          <Stack alignItems="center" flexShrink={0}>
            <Typography variant="h1" fontWeight={700} lineHeight={1}>
              {resumen.promedio}
            </Typography>
            <Rating value={resumen.promedio} precision={0.1} readOnly size="small" />
            <Typography variant="caption" color="textSecondary" mt={0.5}>
              {resumen.total} reseña{resumen.total === 1 ? "" : "s"}
            </Typography>
          </Stack>

          {/* Distribución: una media de 4,3 no dice lo mismo con 2 que con 200. */}
          <Stack spacing={0.5} flex={1} width="100%">
            {ESTRELLAS.map((estrella) => {
              const cuantas = resumen.distribucion[estrella] ?? 0;
              return (
                <Stack key={estrella} direction="row" spacing={1.5} alignItems="center">
                  <Typography variant="caption" color="textSecondary" width={12}>
                    {estrella}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(cuantas / resumen.total) * 100}
                    sx={{ flex: 1, height: 6, borderRadius: 3 }}
                  />
                  <Typography variant="caption" color="textSecondary" width={20} textAlign="right">
                    {cuantas}
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        </Stack>

        <Divider />

        <Stack spacing={3} mt={3}>
          {resenas.map((resena) => (
            <Box key={resena.id}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Avatar sx={{ width: 36, height: 36, fontSize: 14 }}>
                  {resena.cliente[0]}
                </Avatar>

                <Box flex={1} minWidth={0}>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    flexWrap="wrap"
                    useFlexGap
                  >
                    <Typography variant="subtitle2" fontWeight={600}>
                      {resena.cliente}
                    </Typography>
                    <Rating value={resena.puntuacion} readOnly size="small" />
                    <Typography variant="caption" color="textSecondary">
                      {formatFecha(resena.fecha)}
                    </Typography>
                  </Stack>

                  {resena.servicio ? (
                    <Typography variant="caption" color="textSecondary" display="block">
                      {resena.servicio}
                    </Typography>
                  ) : null}

                  {resena.comentario ? (
                    <Typography variant="body2" mt={0.5}>
                      {resena.comentario}
                    </Typography>
                  ) : null}

                  {/* La respuesta del negocio importa tanto como la reseña. */}
                  {resena.respuesta ? (
                    <Box
                      sx={{
                        mt: 1.5,
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: "grey.100",
                        borderLeft: "3px solid",
                        borderColor: "primary.main",
                      }}
                    >
                      <Typography variant="caption" fontWeight={600} display="block">
                        Respuesta del negocio
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {resena.respuesta}
                      </Typography>
                    </Box>
                  ) : null}
                </Box>
              </Stack>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ResenasLocal;
