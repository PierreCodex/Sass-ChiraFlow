"use client";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Radio from "@mui/material/Radio";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { IconCheck } from "@tabler/icons-react";

import { formatMoneda } from "@/lib/format";
import { etiquetaFeature } from "../constants";
import { esIlimitado, precioAplicado, type Plan } from "../types";

interface Props {
  planes: Plan[];
  seleccionado: number;
  onSeleccionar: (planId: number) => void;
  planActualId: number | null;
  elegiblePromo: boolean;
}

/** "2 profesionales, 1 locación y 100 mensajes WhatsApp/mes" */
function resumenLimites(plan: Plan) {
  const partes = [
    `${plan.max_profesionales} profesional${plan.max_profesionales === 1 ? "" : "es"}`,
    esIlimitado(plan.max_sucursales)
      ? "locaciones ilimitadas"
      : `${plan.max_sucursales} locación${plan.max_sucursales === 1 ? "" : "es"}`,
  ];
  if (plan.max_whatsapp_mes > 0) {
    partes.push(`${plan.max_whatsapp_mes} mensajes WhatsApp/mes`);
  }
  return partes.join(" · ");
}

const PlanSelector = ({
  planes,
  seleccionado,
  onSeleccionar,
  planActualId,
  elegiblePromo,
}: Props) => (
  <Stack spacing={2}>
    {planes.map((plan) => {
      const activo = plan.id === seleccionado;
      const { conPromo, precio } = precioAplicado(plan, elegiblePromo);

      return (
        <Card
          key={plan.id}
          elevation={activo ? 9 : 0}
          onClick={() => onSeleccionar(plan.id)}
          sx={{
            cursor: "pointer",
            border: "1px solid",
            borderColor: activo ? "primary.main" : "divider",
            transition: "border-color .15s",
            "&:hover": { borderColor: "primary.main" },
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Radio checked={activo} sx={{ p: 0, mt: 0.5 }} />

              <Box flex={1} minWidth={0}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Box minWidth={0}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Typography variant="h5" fontWeight={600}>
                        {plan.nombre}
                      </Typography>
                      {plan.id === planActualId ? (
                        <Chip size="small" label="Actual" />
                      ) : null}
                      {plan.destacado ? (
                        <Chip size="small" color="primary" label="Popular" />
                      ) : null}
                    </Stack>
                    <Typography variant="body2" color="textSecondary" mt={0.5}>
                      {plan.descripcion}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" display="block" mt={1}>
                      Incluye {resumenLimites(plan)}
                    </Typography>
                  </Box>

                  <Box textAlign={{ xs: "left", sm: "right" }} flexShrink={0}>
                    {conPromo ? (
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ textDecoration: "line-through" }}
                      >
                        {formatMoneda(plan.precio_mensual)}
                      </Typography>
                    ) : null}
                    <Typography variant="h4" fontWeight={700} noWrap>
                      {formatMoneda(precio)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {conPromo
                        ? `/mes los primeros ${plan.promo_duracion_meses} meses`
                        : "/mes"}
                    </Typography>
                  </Box>
                </Stack>

                <Grid container spacing={0.5} mt={2}>
                  {plan.features.map((feature) => (
                    <Grid key={feature} size={{ xs: 12, sm: 6 }}>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <Box component="span" sx={{ display: "flex", color: "success.main" }}>
                          <IconCheck size={14} />
                        </Box>
                        <Typography variant="caption" color="textSecondary">
                          {etiquetaFeature(feature)}
                        </Typography>
                      </Stack>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      );
    })}
  </Stack>
);

export default PlanSelector;
