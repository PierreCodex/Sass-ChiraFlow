"use client";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import { useProfesionalesLibres } from "../hooks/useTienda";
import type { ProfesionalPublico } from "../types";

interface Props {
  slug: string;
  localId: number;
  duracionMin: number;
  /** Ya elegidas en el paso "Fecha y hora": solo se ofrece a quien le quede libre. */
  fecha: string;
  hora: string;
  profesionales: ProfesionalPublico[];
  profesionalId: number | null;
  onProfesional: (id: number) => void;
}

/** "Sandro Gavino" -> "SG": para el avatar cuando no hay foto cargada. */
function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .filter((parte) => parte.length > 1)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}

/**
 * Paso "Profesional" del wizard, DESPUÉS de "Fecha y hora": ya no se
 * muestran todos, solo a quien realmente le queda libre esa hora — la
 * unión del paso anterior no garantiza que cualquiera sirva.
 */
const SelectorProfesional = ({
  slug,
  localId,
  duracionMin,
  fecha,
  hora,
  profesionales,
  profesionalId,
  onProfesional,
}: Props) => {
  const idsCandidatos = profesionales.map((p) => p.id);
  const { data: libresIds, isPending } = useProfesionalesLibres(
    slug,
    localId,
    idsCandidatos,
    fecha,
    hora,
    duracionMin
  );

  if (isPending) {
    return (
      <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" width={100} height={100} />
        ))}
      </Stack>
    );
  }

  const disponibles = profesionales.filter((p) => libresIds?.includes(p.id));

  if (!disponibles.length) {
    return (
      <Alert severity="warning">
        Nadie tiene libre esa hora. Vuelve al paso anterior y prueba con otra.
      </Alert>
    );
  }

  return (
    <Box>
      <CustomFormLabel sx={{ mt: 0 }}>Profesional</CustomFormLabel>
      <Grid container spacing={1.5}>
        {disponibles.map((profesional) => {
          const seleccionado = profesionalId === profesional.id;
          return (
            <Grid key={profesional.id} size={{ xs: 6, sm: 4 }}>
              <Stack
                onClick={() => onProfesional(profesional.id)}
                alignItems="center"
                spacing={1}
                sx={{
                  cursor: "pointer",
                  p: 1.5,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: seleccionado ? "primary.main" : "divider",
                  borderWidth: seleccionado ? 2 : 1,
                  bgcolor: seleccionado ? "primary.light" : "transparent",
                  textAlign: "center",
                }}
              >
                <Avatar
                  src={profesional.foto_url ?? undefined}
                  sx={{ width: 56, height: 56 }}
                >
                  {iniciales(profesional.nombre)}
                </Avatar>
                <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: "100%" }}>
                  {profesional.nombre}
                </Typography>
              </Stack>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default SelectorProfesional;
