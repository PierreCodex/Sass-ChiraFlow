"use client";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import type { ProfesionalPublico } from "../types";

interface Props {
  profesionales: ProfesionalPublico[];
}

/**
 * Quién atiende, como fila de caras.
 *
 * El Blade los muestra así —avatares en rejilla, no lista de texto— y tiene
 * razón: la foto de quien te va a atender vende más que su biografía. El
 * perfil se lee al pasar el ratón.
 */
const ProfesionalesLocal = ({ profesionales }: Props) => {
  if (!profesionales.length) return null;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Quién te atiende
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))",
            gap: 2,
          }}
        >
          {profesionales.map((profesional) => (
            <Tooltip
              key={profesional.id}
              title={profesional.perfil ?? ""}
              placement="top"
              arrow
            >
              <Stack alignItems="center" spacing={1}>
                <Avatar
                  src={profesional.foto_url ?? undefined}
                  sx={{ width: 56, height: 56 }}
                >
                  {profesional.nombre[0]}
                </Avatar>
                <Typography
                  variant="caption"
                  textAlign="center"
                  fontWeight={500}
                  sx={{ lineHeight: 1.3 }}
                >
                  {profesional.nombre}
                </Typography>
              </Stack>
            </Tooltip>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProfesionalesLocal;
