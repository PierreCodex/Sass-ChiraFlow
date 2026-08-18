"use client";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";

import { toApiError } from "@/lib/api/client";
import { formatFecha } from "@/lib/format";
import { useActualizarNegocio, useNegocio } from "../hooks/useNegocios";
import { ESTADO_NEGOCIO } from "../constants";
import type { EstadoNegocio } from "../types";

interface Campo {
  label: string;
  valor: string;
}

const Fila = ({ label, valor }: Campo) => (
  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
    <Typography variant="caption" color="textSecondary">
      {label}
    </Typography>
    <Typography variant="body1" fontWeight={500}>
      {valor}
    </Typography>
  </Grid>
);

interface Props {
  id: number;
}

/**
 * Igual estructura que `superadmin/negocios/show.blade.php`: datos del
 * negocio + selector para cambiar el estado. La tabla de "Últimos pagos" del
 * Blade queda pendiente — todavía no hay mock de pagos en este feature.
 */
const NegocioDetalle = ({ id }: Props) => {
  const { data: negocio, isPending, isError, error } = useNegocio(id);
  const actualizar = useActualizarNegocio();
  const [estado, setEstado] = useState<EstadoNegocio | "">("");

  useEffect(() => {
    if (negocio) setEstado(negocio.estado);
  }, [negocio]);

  if (isPending) return <Skeleton variant="rounded" height={220} />;
  if (isError) return <Alert severity="error">{toApiError(error).message}</Alert>;
  if (!negocio) return null;

  const { label, color } = ESTADO_NEGOCIO[negocio.estado];

  return (
    <Card elevation={9}>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Grid container spacing={3}>
            <Fila label="Plan" valor={negocio.plan ?? "—"} />
            <Fila label="Categoría" valor={negocio.categoria ?? "—"} />
            <Fila
              label="Vence"
              valor={
                negocio.suscripcion_vence_el
                  ? formatFecha(negocio.suscripcion_vence_el)
                  : "—"
              }
            />
            <Fila label="Slug" valor={negocio.slug} />
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography variant="caption" color="textSecondary">
                Estado actual
              </Typography>
              <Chip label={label} color={color} size="small" sx={{ display: "block", width: "fit-content", mt: 0.5 }} />
            </Grid>
          </Grid>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
            <TextField
              select
              size="small"
              label="Cambiar estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value as EstadoNegocio)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="activa">Activa</MenuItem>
              <MenuItem value="suspendida">Suspendida</MenuItem>
              <MenuItem value="prueba">Prueba</MenuItem>
            </TextField>
            <Button
              variant="contained"
              disabled={!estado || estado === negocio.estado || actualizar.isPending}
              onClick={() =>
                estado && actualizar.mutate({ id: negocio.id, payload: { estado } })
              }
            >
              Guardar
            </Button>
            {actualizar.isSuccess ? (
              <Typography variant="body2" color="success.main">
                Estado actualizado.
              </Typography>
            ) : null}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default NegocioDetalle;
