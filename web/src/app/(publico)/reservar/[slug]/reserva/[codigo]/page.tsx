"use client";
import { use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { IconCircleCheck, IconClockX } from "@tabler/icons-react";

import { toApiError } from "@/lib/api/client";
import { formatFechaLarga, formatHora12 } from "@/lib/format";
import TiendaShell from "@/features/publico/components/TiendaShell";
import { useConfirmarReserva } from "@/features/publico/hooks/useTienda";
import { useRutaTienda } from "@/features/publico/base-tienda";

/**
 * El enlace del correo «Confirma tu reserva» (Story 6.7):
 * `{slug}.tivuapp.store/reserva/{codigo}?f={firma}`.
 *
 * Confirma sola al abrirse: el cliente ya pulsó el botón del correo, y pedirle
 * otro clic aquí solo añade una ocasión de dejarla a medias. Volver a abrirla
 * no cambia nada; fuera de plazo dice «Tu reserva expiró», nunca un error.
 */
export default function ConfirmarReservaPage({
  params,
}: {
  params: Promise<{ slug: string; codigo: string }>;
}) {
  const { slug, codigo } = use(params);
  const firma = useSearchParams().get("f") ?? "";
  const ruta = useRutaTienda(slug);
  const { data, isPending, isError, error } = useConfirmarReserva(slug, codigo, firma);

  if (!firma || isError) {
    const status = isError ? toApiError(error).status : 404;
    return (
      <Container maxWidth="sm" sx={{ py: 10 }}>
        <Alert severity={status === 404 ? "warning" : "error"}>
          {status === 404
            ? "Este enlace no es válido. Ábrelo desde el último correo que te enviamos o reserva de nuevo."
            : "No pudimos confirmar tu reserva ahora. Vuelve a abrir el enlace en un momento."}
        </Alert>
        <Button component={Link} href={ruta("")} variant="contained" sx={{ mt: 3 }}>
          Ir a la tienda
        </Button>
      </Container>
    );
  }

  if (isPending || !data) {
    return (
      <Stack alignItems="center" spacing={2} sx={{ py: 14 }}>
        <CircularProgress />
        <Typography color="textSecondary">Confirmando tu reserva…</Typography>
      </Stack>
    );
  }

  const { resultado, negocio, cita } = data;
  const expirada = resultado === "expirada";
  const reservarDeNuevo = ruta(data.sede_slug ? `/${data.sede_slug}` : "");

  return (
    <TiendaShell nombre={negocio} subtitulo={cita.sede ?? undefined}>
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Card>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Box
              sx={{
                color: expirada ? "warning.main" : "success.main",
                display: "flex",
                justifyContent: "center",
              }}
            >
              {expirada ? <IconClockX size={56} /> : <IconCircleCheck size={56} />}
            </Box>

            <Typography variant="h4" fontWeight={700} mt={2}>
              {expirada
                ? "Tu reserva expiró"
                : resultado === "ya_confirmada"
                  ? "Tu reserva ya está confirmada"
                  : "¡Listo! Tu reserva está confirmada"}
            </Typography>

            <Typography color="textSecondary" mt={1.5}>
              {expirada
                ? "No recibimos tu confirmación a tiempo y el horario se liberó para otra persona. Si todavía quieres ir, reserva de nuevo en un minuto."
                : `Te esperamos en ${negocio}. Te enviamos los datos a tu correo.`}
            </Typography>

            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: 2,
                bgcolor: "grey.100",
                textAlign: "left",
                opacity: expirada ? 0.7 : 1,
              }}
            >
              <Typography variant="subtitle1" fontWeight={600}>
                {cita.servicio}
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ textDecoration: expirada ? "line-through" : "none" }}
              >
                {formatFechaLarga(cita.fecha)} · {formatHora12(cita.hora_inicio)}
                {cita.profesional ? ` · ${cita.profesional}` : ""}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Código {cita.codigo}
              </Typography>
            </Box>

            {expirada ? (
              <Button
                component={Link}
                href={reservarDeNuevo}
                variant="contained"
                size="large"
                fullWidth
                sx={{ mt: 3 }}
              >
                Reservar de nuevo
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </Container>
    </TiendaShell>
  );
}
