"use client";
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { IconAlertTriangle, IconCircleCheck } from "@tabler/icons-react";

import { toApiError } from "@/lib/api/client";

import { useVerificarEmail } from "../hooks/useAuth";
import ReenviarVerificacion from "./ReenviarVerificacion";

const PARAMS = ["id", "hash", "expires", "signature"] as const;

/**
 * Landing del enlace del correo de verificación.
 *
 * Reenvía los cuatro parámetros firmados **tal como llegaron**: `expires` es
 * un timestamp Unix y `signature` un HMAC sobre `id|hash|expires`, así que
 * normalizar o reordenar cualquiera de ellos invalidaría la firma.
 *
 * El endpoint es idempotente: recargar vuelve a responder 200. Por eso el
 * éxito no se "gasta" y la segunda visita no es un error.
 */
const VerificacionCorreo = () => {
  const searchParams = useSearchParams();
  const verificar = useVerificarEmail();

  // En desarrollo React monta dos veces; sin esto se dispararían dos POST.
  const yaEnviado = useRef(false);

  const valores = PARAMS.map((clave) => searchParams.get(clave));
  const faltanParams = valores.some((valor) => valor === null);

  useEffect(() => {
    if (faltanParams || yaEnviado.current) return;
    yaEnviado.current = true;

    const [id, hash, expires, signature] = valores as string[];
    verificar.mutate({ id, hash, expires, signature });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faltanParams]);

  // El enlace llegó recortado o manipulado: mismo tratamiento que un 422.
  if (faltanParams) {
    return (
      <PanelEnlaceInvalido mensaje="Este enlace está incompleto. Pide uno nuevo y ábrelo desde el correo." />
    );
  }

  if (verificar.isPending || verificar.isIdle) {
    return (
      <Stack alignItems="center" spacing={2} py={3}>
        <CircularProgress />
        <Typography color="textSecondary">Verificando tu correo…</Typography>
      </Stack>
    );
  }

  if (verificar.isSuccess) {
    return (
      <Stack alignItems="center" textAlign="center" spacing={2} py={2}>
        <Box color="success.main" display="flex">
          <IconCircleCheck size={48} stroke={1.5} />
        </Box>
        <Typography variant="h4" fontWeight={700}>
          ¡Listo!
        </Typography>
        <Typography color="textSecondary">
          {verificar.data.message}
        </Typography>
        <Button
          component={Link}
          href="/login"
          variant="contained"
          size="large"
          fullWidth
        >
          Iniciar sesión
        </Button>
      </Stack>
    );
  }

  return <PanelEnlaceInvalido mensaje={toApiError(verificar.error).message} />;
};

/** 422: enlace vencido (duran 48 h) o firma que no cuadra. */
const PanelEnlaceInvalido = ({ mensaje }: { mensaje: string }) => (
  <Stack alignItems="center" textAlign="center" spacing={2} py={2}>
    <Box color="warning.main" display="flex">
      <IconAlertTriangle size={48} stroke={1.5} />
    </Box>
    <Typography variant="h4" fontWeight={700}>
      Enlace no válido
    </Typography>
    <Alert severity="warning" sx={{ width: "100%", textAlign: "left" }}>
      {mensaje}
    </Alert>
    <Typography color="textSecondary" variant="body2">
      Escribe tu email y te mandamos uno nuevo. Los enlaces vencen a las 48
      horas.
    </Typography>

    {/* El panel va centrado, pero el campo y su etiqueta no. */}
    <Box width="100%" textAlign="left">
      <ReenviarVerificacion textoBoton="Enviarme un enlace nuevo" />
    </Box>

    <Typography
      component={Link}
      href="/login"
      fontWeight={500}
      sx={{ textDecoration: "none", color: "primary.main" }}
    >
      Volver al inicio de sesión
    </Typography>
  </Stack>
);

export default VerificacionCorreo;
