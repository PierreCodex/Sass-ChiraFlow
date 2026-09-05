"use client";
import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Grid from "@mui/material/Grid";
import Link from "next/link";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import PageContainer from "@/components/container/PageContainer";
import EncabezadoPagina from "@/components/shared/EncabezadoPagina";
import { toApiError } from "@/lib/api/client";

import PlanSelector from "@/features/suscripcion/components/PlanSelector";
import ExtrasPlan from "@/features/suscripcion/components/ExtrasPlan";
import ResumenPlan from "@/features/suscripcion/components/ResumenPlan";
import {
  usePlanes,
  useSolicitarPlan,
  useSuscripcion,
} from "@/features/suscripcion/hooks/useSuscripcion";
import AvisoError from "@/components/shared/AvisoError";


export default function MiPlanPage() {
  const { data: planes, isPending, isError, error } = usePlanes();
  const { data: suscripcion } = useSuscripcion();
  const solicitar = useSolicitarPlan();

  const [planId, setPlanId] = useState<number | null>(null);
  const [extraProfesionales, setExtraProfesionales] = useState(0);
  const [extraWhatsapp, setExtraWhatsapp] = useState(0);

  // Arranca en el plan contratado; si el negocio está en prueba, en el
  // destacado, que es el que el Blade marca como "Popular".
  useEffect(() => {
    if (planId || !planes?.length) return;
    const inicial =
      planes.find((plan) => plan.id === suscripcion?.plan?.id) ??
      planes.find((plan) => plan.destacado) ??
      planes[0];
    setPlanId(inicial.id);
  }, [planes, suscripcion, planId]);

  // Los extras ya contratados se precargan al llegar la suscripción.
  useEffect(() => {
    if (!suscripcion) return;
    setExtraProfesionales(suscripcion.extra_profesionales);
    setExtraWhatsapp(suscripcion.extra_whatsapp);
  }, [suscripcion]);

  const plan = planes?.find((item) => item.id === planId);

  return (
    <PageContainer title="Mi Plan" description="Planes y extras">
      <EncabezadoPagina titulo="Elige tu plan" />

      {isError ? (
        <AvisoError error={error} />
      ) : isPending || !planes || !plan ? (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={2}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" height={220} />
              ))}
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Skeleton variant="rounded" height={480} />
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={3} alignItems="flex-start">
          <Grid size={{ xs: 12, lg: 8 }}>
            <Stack spacing={4}>
              {solicitar.isSuccess ? (
                <Alert severity="success">
                  <AlertTitle>Solicitud enviada</AlertTitle>
                  Se abrió un ticket con el desglose. Nuestro equipo te contacta
                  para activar el plan; puedes seguirlo en{" "}
                  <Link href="/soporte">Soporte</Link>.
                </Alert>
              ) : null}

              {solicitar.isError ? (
                <Alert severity="error">
                  {toApiError(solicitar.error).message}
                </Alert>
              ) : null}

              <PlanSelector
                planes={planes}
                seleccionado={plan.id}
                onSeleccionar={setPlanId}
                planActualId={suscripcion?.plan?.id ?? null}
                elegiblePromo={suscripcion?.elegible_promo ?? false}
              />

              <ExtrasPlan
                plan={plan}
                extraProfesionales={extraProfesionales}
                extraWhatsapp={extraWhatsapp}
                onProfesionales={setExtraProfesionales}
                onWhatsapp={setExtraWhatsapp}
              />

              <Typography variant="body2" color="textSecondary" textAlign="center">
                ¿No es lo que buscas? <Link href="/soporte">Contáctanos</Link>
              </Typography>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <ResumenPlan
              plan={plan}
              extraProfesionales={extraProfesionales}
              extraWhatsapp={extraWhatsapp}
              elegiblePromo={suscripcion?.elegible_promo ?? false}
              enviando={solicitar.isPending}
              onSolicitar={() =>
                solicitar.mutate({
                  plan_id: plan.id,
                  extra_profesionales: extraProfesionales,
                  extra_whatsapp: extraWhatsapp,
                })
              }
            />
          </Grid>
        </Grid>
      )}
    </PageContainer>
  );
}
