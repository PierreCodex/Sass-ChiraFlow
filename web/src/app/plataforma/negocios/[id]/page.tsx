"use client";
import { use, useState } from "react";
import Link from "next/link";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  IconArrowLeft,
  IconCalendarPlus,
  IconCash,
  IconPackages,
  IconPlayerPause,
  IconPlayerPlay,
} from "@tabler/icons-react";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import DashboardCard from "@/components/shared/DashboardCard";
import { formatFecha, formatMoneda } from "@/lib/format";

import {
  useAccionesNegocio,
  useNegocioPlataforma,
  usePlanesPlataforma,
} from "@/features/plataforma/hooks/usePlataforma";
import {
  COLOR_ESTADO,
  ETIQUETA_ESTADO,
  ETIQUETA_METODO,
  limite,
  type MetodoPagoSuscripcion,
} from "@/features/plataforma/types";

type Dialogo = "plan" | "pago" | "suspender" | "reactivar" | null;

/** Story 8.5: la ficha de un negocio, con todo lo que hace falta para atenderlo. */
export default function FichaNegocioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isPending, isError } = useNegocioPlataforma(id);
  const { data: planes } = usePlanesPlataforma();
  const acciones = useAccionesNegocio(id);
  const [dialogo, setDialogo] = useState<Dialogo>(null);

  // Estado de los formularios de los diálogos.
  const [planNuevo, setPlanNuevo] = useState("");
  const [nota, setNota] = useState("");
  const [monto, setMonto] = useState("");
  const [metodo, setMetodo] = useState<MetodoPagoSuscripcion>("yape");
  const [periodo, setPeriodo] = useState(new Date().toISOString().slice(0, 7));

  if (isPending) return <Skeleton variant="rounded" height={480} />;
  if (isError || !data) {
    return (
      <Alert severity="error">
        Ese negocio no existe. <Link href="/plataforma/negocios">Volver a la lista</Link>
      </Alert>
    );
  }

  const { negocio, pagos, acciones: historial } = data;
  const plan = planes?.find((item) => item.slug === negocio.plan_slug);
  const usoProfesionales = plan ? (negocio.profesionales / plan.max_profesionales) * 100 : 0;
  const ocupado =
    acciones.cambiarPlan.isPending ||
    acciones.registrarPago.isPending ||
    acciones.cambiarEstado.isPending;

  const abrir = (cual: Dialogo) => {
    setNota("");
    setPlanNuevo(negocio.plan_slug);
    setMonto(String(plan?.precio_mensual ?? ""));
    setDialogo(cual);
  };
  const cerrar = () => setDialogo(null);

  const confirmar = () => {
    if (dialogo === "plan") {
      acciones.cambiarPlan.mutate({ plan: planNuevo, nota: nota.trim() || null }, { onSuccess: cerrar });
    }
    if (dialogo === "pago") {
      acciones.registrarPago.mutate(
        { monto: Number(monto), metodo, periodo, nota: nota.trim() || null },
        { onSuccess: cerrar }
      );
    }
    if (dialogo === "suspender" || dialogo === "reactivar") {
      acciones.cambiarEstado.mutate(
        { estado: dialogo === "suspender" ? "suspendido" : "activo", motivo: nota.trim() },
        { onSuccess: cerrar }
      );
    }
  };

  const puedeConfirmar =
    (dialogo === "plan" && planNuevo && planNuevo !== negocio.plan_slug) ||
    (dialogo === "pago" && Number(monto) > 0) ||
    ((dialogo === "suspender" || dialogo === "reactivar") && nota.trim().length > 0);

  return (
    <Stack spacing={3}>
      <Button
        component={Link}
        href="/plataforma/negocios"
        startIcon={<IconArrowLeft size={18} />}
        sx={{ alignSelf: "flex-start" }}
        color="inherit"
      >
        Negocios
      </Button>

      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        spacing={2}
      >
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <Typography variant="h3" fontWeight={700}>
              {negocio.nombre}
            </Typography>
            <Chip label={ETIQUETA_ESTADO[negocio.estado]} color={COLOR_ESTADO[negocio.estado]} />
          </Stack>
          <Typography color="textSecondary">
            {negocio.categoria} · {negocio.ciudad} · /reservar/{negocio.slug} · id {negocio.id}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="flex-start">
          <Button variant="contained" startIcon={<IconPackages size={18} />} onClick={() => abrir("plan")}>
            Cambiar plan
          </Button>
          <Button variant="outlined" startIcon={<IconCash size={18} />} onClick={() => abrir("pago")}>
            Registrar pago
          </Button>
          <Button
            variant="outlined"
            startIcon={<IconCalendarPlus size={18} />}
            onClick={() => acciones.renovar.mutate()}
            disabled={acciones.renovar.isPending || negocio.estado === "cancelado"}
          >
            Renovar 30 días
          </Button>
          {negocio.estado === "suspendido" ? (
            <Button
              color="success"
              variant="outlined"
              startIcon={<IconPlayerPlay size={18} />}
              onClick={() => abrir("reactivar")}
            >
              Reactivar
            </Button>
          ) : negocio.estado !== "cancelado" ? (
            <Button
              color="error"
              variant="outlined"
              startIcon={<IconPlayerPause size={18} />}
              onClick={() => abrir("suspender")}
            >
              Suspender
            </Button>
          ) : null}
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <DashboardCard title="Plan y vencimiento">
            <Stack spacing={1.5}>
              <Dato titulo="Plan">
                {plan?.nombre} · {plan?.precio_mensual ? `${formatMoneda(plan.precio_mensual)}/mes` : "gratis"}
              </Dato>
              <Dato titulo="Vence el">{formatFecha(negocio.vence_el)}</Dato>
              <Dato titulo="Alta">{formatFecha(negocio.alta_el)}</Dato>
              <Dato titulo="Último acceso">
                {negocio.ultimo_acceso ? formatFecha(negocio.ultimo_acceso) : "Nunca"}
              </Dato>
            </Stack>
          </DashboardCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <DashboardCard title="Uso del plan">
            <Stack spacing={2}>
              <Box>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Profesionales</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {negocio.profesionales} / {plan?.max_profesionales}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(usoProfesionales, 100)}
                  color={usoProfesionales >= 100 ? "warning" : "primary"}
                  sx={{ height: 8, borderRadius: 4, mt: 0.5 }}
                />
              </Box>
              <Dato titulo="Locales">
                {negocio.locales} de {plan ? limite(plan.max_sucursales).toLowerCase() : "—"}
              </Dato>
              <Dato titulo="Citas este mes">{negocio.citas_mes}</Dato>
            </Stack>
          </DashboardCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <DashboardCard title="Titular">
            <Stack spacing={1.5}>
              <Dato titulo="Nombre">{negocio.titular.nombre}</Dato>
              <Dato titulo="Correo">{negocio.titular.email}</Dato>
              <Dato titulo="Teléfono">{negocio.titular.telefono}</Dato>
            </Stack>
          </DashboardCard>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <DashboardCard title="Pagos de suscripción">
            {pagos.length === 0 ? (
              <Typography color="textSecondary">Todavía no hay pagos.</Typography>
            ) : (
              <Stack spacing={1.5} divider={<Divider flexItem />}>
                {pagos.map((pago) => (
                  <Stack key={pago.id} direction="row" spacing={2} alignItems="center">
                    <Box flex={1}>
                      <Typography fontWeight={600}>Periodo {pago.periodo}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {formatFecha(pago.fecha)} · {ETIQUETA_METODO[pago.metodo]}
                        {pago.nota ? ` · ${pago.nota}` : ""}
                      </Typography>
                    </Box>
                    {!pago.confirmado ? (
                      <Chip size="small" color="warning" label="Por confirmar" />
                    ) : null}
                    <Typography fontWeight={700}>{formatMoneda(pago.monto)}</Typography>
                  </Stack>
                ))}
              </Stack>
            )}
          </DashboardCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <DashboardCard title="Historial" subtitle="Quién hizo qué y cuándo">
            {historial.length === 0 ? (
              <Typography color="textSecondary">Sin movimientos.</Typography>
            ) : (
              <Stack spacing={1.5} divider={<Divider flexItem />}>
                {historial.map((accion) => (
                  <Box key={accion.id}>
                    <Typography variant="body2">{accion.descripcion}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(accion.fecha).toLocaleString("es-PE")} · {accion.autor}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </DashboardCard>
        </Grid>
      </Grid>

      <Dialog open={dialogo !== null} onClose={ocupado ? undefined : cerrar} fullWidth maxWidth="sm">
        <DialogTitle>
          {dialogo === "plan"
            ? "Cambiar plan"
            : dialogo === "pago"
              ? "Registrar pago"
              : dialogo === "suspender"
                ? "Suspender negocio"
                : "Reactivar negocio"}
        </DialogTitle>
        <DialogContent dividers>
          {dialogo === "plan" ? (
            <>
              <CustomFormLabel htmlFor="plan" sx={{ mt: 0 }}>
                Nuevo plan
              </CustomFormLabel>
              <CustomTextField
                id="plan"
                select
                fullWidth
                value={planNuevo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlanNuevo(e.target.value)}
              >
                {(planes ?? []).map((item) => (
                  <MenuItem key={item.slug} value={item.slug}>
                    {item.nombre} — {item.precio_mensual ? `${formatMoneda(item.precio_mensual)}/mes` : "gratis"} ·
                    hasta {item.max_profesionales} profesionales
                  </MenuItem>
                ))}
              </CustomTextField>
              {planNuevo &&
              (planes?.find((item) => item.slug === planNuevo)?.max_profesionales ?? 99) <
                negocio.profesionales ? (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Este negocio tiene {negocio.profesionales} profesionales y el plan elegido
                  admite menos. Tendrá que dar de baja a alguno.
                </Alert>
              ) : null}
              <Alert severity="info" sx={{ mt: 2 }}>
                Cambiar el plan <strong>no registra ningún cobro</strong>. Si pagó, regístralo
                aparte.
              </Alert>
            </>
          ) : null}

          {dialogo === "pago" ? (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomFormLabel htmlFor="monto" sx={{ mt: 0 }}>
                  Monto (S/)
                </CustomFormLabel>
                <CustomTextField
                  id="monto"
                  type="number"
                  fullWidth
                  value={monto}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMonto(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomFormLabel htmlFor="periodo" sx={{ mt: 0 }}>
                  Mes que paga
                </CustomFormLabel>
                <CustomTextField
                  id="periodo"
                  type="month"
                  fullWidth
                  value={periodo}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPeriodo(e.target.value)}
                />
              </Grid>
              <Grid size={12}>
                <CustomFormLabel htmlFor="metodo" sx={{ mt: 0 }}>
                  Método
                </CustomFormLabel>
                <CustomTextField
                  id="metodo"
                  select
                  fullWidth
                  value={metodo}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setMetodo(e.target.value as MetodoPagoSuscripcion)
                  }
                >
                  {(Object.keys(ETIQUETA_METODO) as MetodoPagoSuscripcion[]).map((clave) => (
                    <MenuItem key={clave} value={clave}>
                      {ETIQUETA_METODO[clave]}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Grid>
            </Grid>
          ) : null}

          {dialogo === "suspender" ? (
            <Alert severity="warning" sx={{ mb: 1 }}>
              El negocio no podrá entrar a su panel y su tienda dejará de recibir reservas
              hasta que lo reactives.
            </Alert>
          ) : null}

          <CustomFormLabel htmlFor="nota">
            {dialogo === "suspender" || dialogo === "reactivar" ? "Motivo" : "Nota (opcional)"}
          </CustomFormLabel>
          <CustomTextField
            id="nota"
            fullWidth
            multiline
            rows={2}
            value={nota}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNota(e.target.value)}
            helperText="Queda en el historial de la ficha."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button color="inherit" onClick={cerrar} disabled={ocupado}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color={dialogo === "suspender" ? "error" : "primary"}
            onClick={confirmar}
            disabled={!puedeConfirmar || ocupado}
          >
            {ocupado ? "Guardando…" : "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

function Dato({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="textSecondary">
        {titulo}
      </Typography>
      <Typography component="div" fontWeight={500}>
        {children}
      </Typography>
    </Box>
  );
}
