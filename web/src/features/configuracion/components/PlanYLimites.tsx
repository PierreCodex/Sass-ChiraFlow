"use client";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Link from "next/link";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { IconBriefcase, IconBrandWhatsapp, IconBuildingStore } from "@tabler/icons-react";

import { toApiError } from "@/lib/api/client";
import { formatMoneda } from "@/lib/format";
import { usePlanes, useSuscripcion } from "@/features/suscripcion/hooks/useSuscripcion";
import { esIlimitado } from "@/features/suscripcion/types";

interface Limite {
  icono: typeof IconBriefcase;
  titulo: string;
  valor: string;
}

/**
 * Pestaña "Plan y límites" de Configuración: qué plan tiene el negocio ahora
 * y hasta dónde llega (profesionales, locales, mensajes de WhatsApp). Todo
 * de solo lectura — cambiar de plan se hace desde `/mi-plan`.
 */
const PlanYLimites = () => {
  const { data: suscripcion, isPending: cargandoSuscripcion, isError, error } = useSuscripcion();
  const { data: planes, isPending: cargandoPlanes } = usePlanes();

  if (cargandoSuscripcion || cargandoPlanes) {
    return <Skeleton variant="rounded" height={280} />;
  }

  if (isError) {
    return <Alert severity="error">{toApiError(error).message}</Alert>;
  }

  const plan = planes?.find((item) => item.id === suscripcion?.plan?.id) ?? null;

  if (!plan) {
    return (
      <Alert
        severity="warning"
        action={
          <Button component={Link} href="/mi-plan" size="small">
            Elegir un plan
          </Button>
        }
      >
        Todavía no tienes un plan activo.
      </Alert>
    );
  }

  const limites: Limite[] = [
    {
      icono: IconBriefcase,
      titulo: "Profesionales",
      valor: esIlimitado(plan.max_profesionales) ? "Ilimitados" : String(plan.max_profesionales),
    },
    {
      icono: IconBuildingStore,
      titulo: "Locales",
      valor: esIlimitado(plan.max_sucursales) ? "Ilimitados" : String(plan.max_sucursales),
    },
    {
      icono: IconBrandWhatsapp,
      titulo: "Mensajes de WhatsApp / mes",
      valor: esIlimitado(plan.max_whatsapp_mes) ? "Ilimitados" : String(plan.max_whatsapp_mes),
    },
  ];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
            <Typography variant="h6" fontWeight={700}>
              Plan {plan.nombre}
            </Typography>
            {plan.destacado ? <Chip label="Popular" color="primary" size="small" /> : null}
          </Stack>
          <Typography variant="body2" color="textSecondary">
            {formatMoneda(plan.precio_mensual)} / mes
          </Typography>
        </Box>
        <Button component={Link} href="/mi-plan" variant="outlined">
          Cambiar de plan
        </Button>
      </Stack>

      {suscripcion?.estado === "prueba" ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          Estás en período de prueba — te quedan {suscripcion.dias_restantes} día(s).
        </Alert>
      ) : null}

      <Divider sx={{ mb: 3 }} />

      <Typography variant="subtitle1" fontWeight={600} mb={2}>
        Límites de tu plan
      </Typography>

      <Grid container spacing={2}>
        {limites.map((limite) => {
          const Icono = limite.icono;
          return (
            <Grid key={limite.titulo} size={{ xs: 12, sm: 4 }}>
              <Stack
                spacing={1}
                alignItems="center"
                textAlign="center"
                sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider" }}
              >
                <Icono size={28} stroke={1.5} />
                <Typography variant="h5" fontWeight={700}>
                  {limite.valor}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {limite.titulo}
                </Typography>
              </Stack>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default PlanYLimites;
