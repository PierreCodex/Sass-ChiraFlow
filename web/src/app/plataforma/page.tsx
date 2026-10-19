"use client";
import Link from "next/link";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  IconAlertTriangle,
  IconBuildingStore,
  IconCash,
  IconClockHour4,
  IconMapPin,
  IconUsers,
} from "@tabler/icons-react";

import DashboardCard from "@/components/shared/DashboardCard";
import StatCard from "@/components/shared/StatCard";
import { formatFecha, formatMoneda } from "@/lib/format";

import {
  useNegociosPlataforma,
  usePagosPlataforma,
  useReiniciarDatos,
  useResumenPlataforma,
} from "@/features/plataforma/hooks/usePlataforma";
import { COLOR_ESTADO, ETIQUETA_ESTADO, ETIQUETA_METODO } from "@/features/plataforma/types";

export default function ResumenPlataformaPage() {
  const { data: resumen, isPending } = useResumenPlataforma();
  const { data: negocios } = useNegociosPlataforma();
  const { data: pagos } = usePagosPlataforma();
  const reiniciar = useReiniciarDatos();

  const hoy = new Date().toISOString().slice(0, 10);
  const proximos = (negocios ?? [])
    .filter((item) => item.estado !== "cancelado" && item.estado !== "suspendido")
    .filter((item) => item.vence_el >= hoy)
    .sort((a, b) => a.vence_el.localeCompare(b.vence_el))
    .slice(0, 6);

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
        <Box>
          <Typography variant="h3" fontWeight={700}>
            Resumen de la plataforma
          </Typography>
          <Typography color="textSecondary">
            Todos los negocios que usan ChiraFlow, de un vistazo.
          </Typography>
        </Box>
        <Button
          size="small"
          color="inherit"
          onClick={() => reiniciar.mutate()}
          sx={{ alignSelf: { sm: "center" } }}
        >
          Reiniciar datos de prueba
        </Button>
      </Stack>

      {isPending || !resumen ? (
        <Skeleton variant="rounded" height={260} />
      ) : (
        <>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                titulo="Negocios"
                valor={resumen.negocios}
                icono={<IconBuildingStore size={24} />}
                color="primary"
                detalle={`${resumen.activos} activos · ${resumen.en_prueba} en prueba`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                titulo="Ingreso mensual"
                valor={formatMoneda(resumen.ingreso_mensual)}
                icono={<IconCash size={24} />}
                color="success"
                detalle="Suma de los planes que pagan"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                titulo="Locales"
                valor={resumen.locales}
                icono={<IconMapPin size={24} />}
                color="secondary"
                detalle={`${resumen.profesionales} profesionales`}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard
                titulo="Requieren atención"
                valor={resumen.por_vencer + resumen.suspendidos}
                icono={<IconAlertTriangle size={24} />}
                color="warning"
                detalle={`${resumen.por_vencer} por vencer · ${resumen.suspendidos} suspendidos`}
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 5 }}>
              <DashboardCard title="Negocios por plan" subtitle="Sin contar los cancelados">
                <Stack spacing={2.5}>
                  {resumen.por_plan.map(({ plan, negocios: cantidad }) => {
                    const vivos = resumen.negocios || 1;
                    return (
                      <Box key={plan.slug}>
                        <Stack direction="row" justifyContent="space-between" mb={0.5}>
                          <Typography fontWeight={600}>
                            {plan.nombre}{" "}
                            <Typography component="span" variant="body2" color="textSecondary">
                              · {plan.precio_mensual ? `${formatMoneda(plan.precio_mensual)}/mes` : "gratis"}
                            </Typography>
                          </Typography>
                          <Typography fontWeight={600}>{cantidad}</Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={(cantidad / vivos) * 100}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    );
                  })}
                </Stack>
              </DashboardCard>
            </Grid>

            <Grid size={{ xs: 12, lg: 7 }}>
              <DashboardCard
                title="Próximos vencimientos"
                action={
                  <Button component={Link} href="/plataforma/negocios" size="small">
                    Ver todos
                  </Button>
                }
              >
                <Stack spacing={1.5}>
                  {proximos.map((item) => (
                    <Stack
                      key={item.id}
                      direction="row"
                      alignItems="center"
                      spacing={2}
                      component={Link}
                      href={`/plataforma/negocios/${item.id}`}
                      sx={{ textDecoration: "none", color: "inherit", "&:hover": { opacity: 0.8 } }}
                    >
                      <IconClockHour4 size={18} />
                      <Box flex={1} minWidth={0}>
                        <Typography fontWeight={600} noWrap>
                          {item.nombre}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Vence el {formatFecha(item.vence_el)}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={ETIQUETA_ESTADO[item.estado]}
                        color={COLOR_ESTADO[item.estado]}
                      />
                    </Stack>
                  ))}
                </Stack>
              </DashboardCard>
            </Grid>
          </Grid>

          <DashboardCard
            title="Últimos pagos de suscripción"
            action={
              <Button component={Link} href="/plataforma/pagos" size="small">
                Ver todos
              </Button>
            }
          >
            <Stack spacing={1.5}>
              {(pagos ?? []).slice(0, 5).map((pago) => (
                <Stack key={pago.id} direction="row" spacing={2} alignItems="center">
                  <IconUsers size={18} />
                  <Box flex={1} minWidth={0}>
                    <Typography fontWeight={600} noWrap>
                      {pago.negocio_nombre}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {formatFecha(pago.fecha)} · {ETIQUETA_METODO[pago.metodo]}
                    </Typography>
                  </Box>
                  {!pago.confirmado ? <Chip size="small" color="warning" label="Por confirmar" /> : null}
                  <Typography fontWeight={700}>{formatMoneda(pago.monto)}</Typography>
                </Stack>
              ))}
            </Stack>
          </DashboardCard>
        </>
      )}
    </Stack>
  );
}
