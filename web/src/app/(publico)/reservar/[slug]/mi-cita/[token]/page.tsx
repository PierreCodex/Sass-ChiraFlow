"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import type { AxiosError } from "axios";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { IconBrandWhatsapp, IconCalendarEvent, IconPhone } from "@tabler/icons-react";

import ConfirmDialog from "@/components/shared/ConfirmDialog";
import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import { toApiError } from "@/lib/api/client";
import { formatFechaLarga, formatHora12, formatMoneda } from "@/lib/format";
import TiendaShell from "@/features/publico/components/TiendaShell";
import {
  useCambiarMiCita,
  useHorariosMiCita,
  useMiCita,
} from "@/features/publico/hooks/useTienda";
import { useRutaTienda } from "@/features/publico/base-tienda";
import type { ContactoNegocio, MiCita } from "@/features/publico/types";

/**
 * «Gestionar mi cita» (Story 6.8, FR-69): `{slug}.tivuapp.store/mi-cita/{token}`.
 *
 * Abrirla no cambia nada: mover y cancelar se confirman con un botón. Mismo
 * servicio, profesional y precio; solo cambian fecha y hora. Fuera del plazo
 * del negocio (6.9) solo se ve, con su WhatsApp para hablar con ellos.
 */
export default function MiCitaPage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}) {
  const { slug, token } = use(params);
  const ruta = useRutaTienda(slug);
  const { data, isPending, isError, error } = useMiCita(slug, token);

  if (isPending) {
    return (
      <Stack alignItems="center" spacing={2} sx={{ py: 14 }}>
        <CircularProgress />
        <Typography color="textSecondary">Buscando tu cita…</Typography>
      </Stack>
    );
  }

  if (isError || !data) {
    const { status, codigo } = toApiError(error);
    const negocio = (error as AxiosError<{ negocio?: ContactoNegocio }>)?.response?.data?.negocio ?? null;
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight={700}>
              {status === 410 && codigo === "caducado"
                ? "Este enlace ya caducó"
                : status === 410
                  ? "Este enlace ya no es válido"
                  : status === 404
                    ? "No encontramos esta cita"
                    : "No pudimos abrir tu cita"}
            </Typography>
            <Typography color="textSecondary" mt={1.5}>
              {status === 404 || status === 410
                ? "Usa el enlace del último correo que te enviamos o comunícate con el negocio."
                : "Vuelve a intentarlo en un momento."}
            </Typography>
            {negocio ? <Contacto negocio={negocio} /> : null}
            <Button component={Link} href={ruta("")} variant="contained" sx={{ mt: 3 }}>
              Reservar una cita
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <TiendaShell nombre={data.negocio.nombre} subtitulo={data.cita.sede ?? undefined}>
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Gestion slug={slug} token={token} data={data} reservar={ruta(data.sede_slug ? `/${data.sede_slug}` : "")} />
      </Container>
    </TiendaShell>
  );
}

function Gestion({
  slug,
  token,
  data,
  reservar,
}: {
  slug: string;
  token: string;
  data: MiCita;
  reservar: string;
}) {
  const [moviendo, setMoviendo] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [fecha, setFecha] = useState<string | null>(null);
  const [hora, setHora] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  /*
   * Los botones del correo (diseño del 2026-11-13) llegan con `#mover` o
   * `#cancelar`: se abre directo esa opción, si aún se puede cambiar. Después
   * se quita el ancla, para que recargar no la vuelva a abrir.
   */
  useEffect(() => {
    const ancla = window.location.hash;
    if (ancla !== "#mover" && ancla !== "#cancelar") return;
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    if (!data.puede_cambiar) return;
    if (ancla === "#mover") setMoviendo(true);
    else setCancelando(true);
  }, [data.puede_cambiar]);

  const horarios = useHorariosMiCita(slug, token, moviendo ? fecha : null);
  const { reprogramar, cancelar } = useCambiarMiCita(slug, token);
  const { cita, negocio } = data;
  const cancelada = data.situacion === "cancelada";

  const errorMover = reprogramar.isError ? toApiError(reprogramar.error) : null;

  const confirmarMovida = () => {
    if (!fecha || !hora) return;
    reprogramar.mutate(
      { fecha, hora },
      {
        onSuccess: () => {
          setMoviendo(false);
          setHora(null);
          setAviso("¡Listo! Tu cita cambió de hora. Te enviamos los datos a tu correo.");
        },
      }
    );
  };

  return (
    <Stack spacing={3}>
      {aviso ? <Alert severity="success">{aviso}</Alert> : null}

      <Card>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Typography variant="h5" fontWeight={700}>
              Tu cita
            </Typography>
            <Chip
              size="small"
              label={
                cancelada
                  ? "Cancelada"
                  : data.situacion === "pasada"
                    ? "Ya pasó"
                    : cita && data.estado === "confirmada"
                      ? "Confirmada"
                      : "Pendiente"
              }
              color={cancelada ? "error" : data.situacion === "pasada" ? "default" : "success"}
            />
          </Stack>

          <Box sx={{ mt: 2.5, opacity: cancelada ? 0.6 : 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ color: "primary.main", display: "flex" }}>
                <IconCalendarEvent size={22} />
              </Box>
              <Typography
                variant="h6"
                fontWeight={600}
                sx={{ textDecoration: cancelada ? "line-through" : "none" }}
              >
                {formatFechaLarga(cita.fecha)} · {formatHora12(cita.hora_inicio)}
              </Typography>
            </Stack>

            <Stack spacing={1} mt={2}>
              <Fila etiqueta="Servicio" valor={cita.servicio} />
              {cita.profesional ? <Fila etiqueta="Con" valor={cita.profesional} /> : null}
              {cita.sede ? <Fila etiqueta="Dónde" valor={cita.direccion ? `${cita.sede} · ${cita.direccion}` : cita.sede} /> : null}
              {cita.monto > 0 ? <Fila etiqueta="Pagas en el local" valor={formatMoneda(cita.monto)} /> : null}
              <Fila etiqueta="Código" valor={cita.codigo} />
            </Stack>
          </Box>

          <Divider sx={{ my: 3 }} />

          {data.puede_cambiar && !moviendo ? (
            <Stack spacing={1.5}>
              <Button variant="contained" size="large" onClick={() => { setAviso(null); setMoviendo(true); }}>
                Cambiar fecha u hora
              </Button>
              <Button variant="outlined" color="error" size="large" onClick={() => setCancelando(true)}>
                Cancelar mi cita
              </Button>
              <Typography variant="caption" color="textSecondary" textAlign="center">
                Puedes cambiarla o cancelarla hasta {data.politica} antes de la cita.
              </Typography>
            </Stack>
          ) : null}

          {data.situacion === "fuera_de_plazo" ? (
            <Alert severity="info">
              Faltan menos de {data.politica} para tu cita, así que ya no se puede
              cambiar desde aquí. Si te surge algo, comunícate con {negocio.nombre}.
            </Alert>
          ) : null}

          {cancelada ? (
            <Stack spacing={2}>
              <Typography color="textSecondary">
                Esta cita está cancelada. Si quieres ir otro día, reserva de nuevo.
              </Typography>
              <Button component={Link} href={reservar} variant="contained" size="large">
                Reservar de nuevo
              </Button>
            </Stack>
          ) : null}

          {data.situacion === "pasada" ? (
            <Typography color="textSecondary">
              Esta cita ya pasó. ¡Esperamos verte pronto!
            </Typography>
          ) : null}
        </CardContent>
      </Card>

      {moviendo ? (
        <Card>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography variant="h6" fontWeight={600}>
              Elige la nueva fecha y hora
            </Typography>
            <Typography variant="body2" color="textSecondary" mt={0.5}>
              Mismo servicio{cita.profesional ? ` con ${cita.profesional}` : ""} y mismo precio.
            </Typography>

            <CustomFormLabel htmlFor="nueva-fecha">Fecha</CustomFormLabel>
            <CustomTextField
              id="nueva-fecha"
              type="date"
              fullWidth
              value={fecha ?? ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFecha(e.target.value || null);
                setHora(null);
              }}
            />

            {fecha ? (
              <Box mt={2}>
                <CustomFormLabel sx={{ mt: 0 }}>Hora</CustomFormLabel>
                {horarios.isPending ? (
                  <CircularProgress size={22} />
                ) : (horarios.data ?? []).length === 0 ? (
                  <Typography variant="body2" color="textSecondary">
                    No hay horas libres ese día. Prueba con otro.
                  </Typography>
                ) : (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {(horarios.data ?? []).map((h) => (
                      <Button
                        key={h}
                        size="small"
                        variant={hora === h ? "contained" : "outlined"}
                        onClick={() => setHora(h)}
                        sx={{ minWidth: 92 }}
                      >
                        {formatHora12(h)}
                      </Button>
                    ))}
                  </Box>
                )}
              </Box>
            ) : null}

            {errorMover ? (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errorMover.errors?.hora_inicio?.[0] ?? errorMover.errors?.cita?.[0] ?? errorMover.message}
              </Alert>
            ) : null}

            <Stack direction={{ xs: "column-reverse", sm: "row" }} spacing={1.5} mt={3} justifyContent="flex-end">
              <Button color="inherit" onClick={() => setMoviendo(false)} disabled={reprogramar.isPending}>
                Volver
              </Button>
              <Button
                variant="contained"
                onClick={confirmarMovida}
                disabled={!fecha || !hora || reprogramar.isPending}
              >
                {reprogramar.isPending
                  ? "Cambiando…"
                  : hora
                    ? `Mover a las ${formatHora12(hora)}`
                    : "Mover mi cita"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ) : null}

      <Contacto negocio={negocio} />

      <ConfirmDialog
        abierto={cancelando}
        titulo="¿Cancelar tu cita?"
        mensaje={`Se liberará el horario del ${formatFechaLarga(cita.fecha)} a las ${formatHora12(cita.hora_inicio)} y le avisaremos a ${negocio.nombre}.`}
        textoConfirmar="Sí, cancelar"
        color="error"
        cargando={cancelar.isPending}
        error={cancelar.isError ? (toApiError(cancelar.error).errors?.cita?.[0] ?? toApiError(cancelar.error).message) : null}
        onCancelar={() => setCancelando(false)}
        onConfirmar={() =>
          cancelar.mutate(undefined, {
            onSuccess: () => {
              setCancelando(false);
              setAviso("Tu cita quedó cancelada. Te enviamos la confirmación a tu correo.");
            },
          })
        }
      />
    </Stack>
  );
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="body2" color="textSecondary">
        {etiqueta}
      </Typography>
      <Typography variant="body2" fontWeight={600} textAlign="right">
        {valor}
      </Typography>
    </Stack>
  );
}

/** El WhatsApp y el teléfono del negocio, para lo que la página no resuelve. */
function Contacto({ negocio }: { negocio: ContactoNegocio }) {
  const numero = (negocio.whatsapp ?? "").replace(/\D+/g, "");
  if (!numero && !negocio.telefono) return null;

  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2 }}>
      {numero ? (
        <Button
          component="a"
          href={`https://wa.me/${numero.length === 9 ? `51${numero}` : numero}`}
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          startIcon={<IconBrandWhatsapp size={18} />}
        >
          Escribir a {negocio.nombre}
        </Button>
      ) : null}
      {negocio.telefono ? (
        <Button component="a" href={`tel:${negocio.telefono}`} variant="text" startIcon={<IconPhone size={18} />}>
          {negocio.telefono}
        </Button>
      ) : null}
    </Stack>
  );
}
