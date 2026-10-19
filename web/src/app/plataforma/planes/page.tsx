"use client";
import { useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { IconCheck, IconEdit } from "@tabler/icons-react";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import { formatMoneda } from "@/lib/format";

import {
  useGuardarPlan,
  usePlanesPlataforma,
  useResumenPlataforma,
} from "@/features/plataforma/hooks/usePlataforma";
import { ETIQUETA_FEATURE, limite, type PlanPlataforma } from "@/features/plataforma/types";

/** Los planes que ofrece la plataforma, con cuántos negocios usa cada uno. */
export default function PlanesPlataformaPage() {
  const { data: planes, isPending } = usePlanesPlataforma();
  const { data: resumen } = useResumenPlataforma();
  const guardar = useGuardarPlan();
  const [editando, setEditando] = useState<PlanPlataforma | null>(null);

  const usan = (slug: string) =>
    resumen?.por_plan.find((item) => item.plan.slug === slug)?.negocios ?? 0;

  const campoNumero = (campo: keyof PlanPlataforma, titulo: string) => (
    <Grid size={{ xs: 12, sm: 6 }}>
      <CustomFormLabel htmlFor={campo} sx={{ mt: 0 }}>
        {titulo}
      </CustomFormLabel>
      <CustomTextField
        id={campo}
        type="number"
        fullWidth
        value={(editando?.[campo] as number | null) ?? ""}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setEditando((actual) =>
            actual
              ? { ...actual, [campo]: e.target.value === "" ? null : Number(e.target.value) }
              : actual
          )
        }
      />
    </Grid>
  );

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3" fontWeight={700}>
          Planes
        </Typography>
        <Typography color="textSecondary">
          Lo que se ofrece a los negocios. Son los mismos 4 planes que siembra el backend.
        </Typography>
      </Box>

      {isPending ? (
        <Skeleton variant="rounded" height={420} />
      ) : (
        <Grid container spacing={3}>
          {(planes ?? []).map((plan) => (
            <Grid key={plan.id} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Card
                elevation={plan.destacado ? 12 : 3}
                sx={{
                  height: "100%",
                  border: plan.destacado ? 2 : 0,
                  borderColor: "primary.main",
                  opacity: plan.activo ? 1 : 0.85,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <Typography variant="h5" fontWeight={700}>
                      {plan.nombre}
                    </Typography>
                    {plan.destacado ? <Chip size="small" color="primary" label="Destacado" /> : null}
                    {!plan.activo ? <Chip size="small" label="No se ofrece" /> : null}
                  </Stack>
                  <Typography variant="body2" color="textSecondary" minHeight={40}>
                    {plan.descripcion}
                  </Typography>

                  <Typography variant="h3" fontWeight={700} mt={2}>
                    {plan.precio_mensual ? formatMoneda(plan.precio_mensual) : "Gratis"}
                    {plan.precio_mensual ? (
                      <Typography component="span" color="textSecondary">
                        {" "}/mes
                      </Typography>
                    ) : null}
                  </Typography>
                  {plan.promo_activa && plan.precio_promo ? (
                    <Typography variant="caption" color="success.main">
                      Promo: {formatMoneda(plan.precio_promo)} los primeros {plan.promo_duracion_meses} meses
                    </Typography>
                  ) : null}

                  <Box sx={{ my: 2, p: 1.5, bgcolor: "primary.light", borderRadius: 2 }}>
                    <Typography fontWeight={600}>{usan(plan.slug)} negocios lo usan</Typography>
                  </Box>

                  <Stack spacing={0.5}>
                    <Typography variant="body2">
                      <strong>{plan.max_profesionales}</strong> profesionales
                    </Typography>
                    <Typography variant="body2">
                      <strong>{limite(plan.max_sucursales)}</strong> sedes
                    </Typography>
                    <Typography variant="body2">
                      <strong>{plan.max_whatsapp_mes}</strong> WhatsApp/mes
                    </Typography>
                  </Stack>

                  <Divider sx={{ my: 2 }} />
                  <Stack spacing={0.5} sx={{ maxHeight: 180, overflow: "auto" }}>
                    {plan.features.map((feature) => (
                      <Stack key={feature} direction="row" spacing={1} alignItems="center">
                        <IconCheck size={14} />
                        <Typography variant="caption">
                          {ETIQUETA_FEATURE[feature] ?? feature}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<IconEdit size={16} />}
                    sx={{ mt: 2 }}
                    onClick={() => setEditando(plan)}
                  >
                    Editar
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={!!editando} onClose={() => setEditando(null)} fullWidth maxWidth="sm">
        <DialogTitle>Editar plan {editando?.nombre}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={12}>
              <CustomFormLabel htmlFor="descripcion" sx={{ mt: 0 }}>
                Descripción
              </CustomFormLabel>
              <CustomTextField
                id="descripcion"
                fullWidth
                value={editando?.descripcion ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditando((actual) => (actual ? { ...actual, descripcion: e.target.value } : actual))
                }
              />
            </Grid>
            {campoNumero("precio_mensual", "Precio mensual (S/)")}
            {campoNumero("precio_anual", "Precio anual (S/)")}
            {campoNumero("max_profesionales", "Máximo de profesionales")}
            {campoNumero("max_sucursales", "Máximo de sedes (999 = ilimitadas)")}
            {campoNumero("max_whatsapp_mes", "WhatsApp al mes")}
            {campoNumero("precio_promo", "Precio de promoción (S/)")}
            <Grid size={12}>
              <Stack direction="row" spacing={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!editando?.activo}
                      onChange={(e) =>
                        setEditando((actual) => (actual ? { ...actual, activo: e.target.checked } : actual))
                      }
                    />
                  }
                  label="Se ofrece en la landing"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!editando?.destacado}
                      onChange={(e) =>
                        setEditando((actual) => (actual ? { ...actual, destacado: e.target.checked } : actual))
                      }
                    />
                  }
                  label="Destacado"
                />
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button color="inherit" onClick={() => setEditando(null)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={guardar.isPending}
            onClick={() =>
              editando && guardar.mutate(editando, { onSuccess: () => setEditando(null) })
            }
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
