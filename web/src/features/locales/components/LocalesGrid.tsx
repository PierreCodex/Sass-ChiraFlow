"use client";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";

import { toApiError } from "@/lib/api/client";
import { useTodosLosLocales } from "../hooks/useLocales";
import type { Local } from "../types";
import LocalCard from "./LocalCard";

interface Props {
  onEditar: (local: Local) => void;
  onEliminar: (local: Local) => void;
}

const LocalesGrid = ({ onEditar, onEliminar }: Props) => {
  const { data: locales = [], isPending, error } = useTodosLosLocales();

  if (isPending) {
    return (
      <Grid container spacing={3}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, lg: 4 }}>
            <Skeleton variant="rounded" height={330} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (error) {
    return <Alert severity="error">{toApiError(error).message}</Alert>;
  }

  if (locales.length === 0) {
    return (
      <Box py={6} textAlign="center">
        <Typography color="textSecondary">
          Todavía no has registrado locales.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {locales.map((local) => (
        <Grid key={local.id} size={{ xs: 12, sm: 6, lg: 4 }}>
          <LocalCard
            local={local}
            onEditar={onEditar}
            onEliminar={onEliminar}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default LocalesGrid;
