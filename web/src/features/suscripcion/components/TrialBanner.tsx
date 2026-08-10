"use client";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";

import { useSuscripcion } from "../hooks/useSuscripcion";

/**
 * Aviso de prueba gratuita / suscripción vencida.
 * Se renderiza en el layout del dashboard, así aparece en todas las pantallas.
 * No muestra nada mientras carga ni si el plan está activo.
 */
const TrialBanner = () => {
  const { data } = useSuscripcion();

  if (!data) return null;
  if (data.estado === "activa") return null;

  const vencida = data.estado === "vencida" || data.dias_restantes <= 0;

  const mensaje = vencida
    ? "Tu prueba gratuita terminó. Compra un plan para seguir usando la plataforma."
    : `Te quedan ${data.dias_restantes} día(s) de tu prueba gratuita.`;

  return (
    <Alert
      severity={vencida ? "error" : "warning"}
      variant="outlined"
      icon={false}
      sx={{
        mb: 3,
        alignItems: "center",
        "& .MuiAlert-message": { flexGrow: 1 },
      }}
      action={
        <Button
          component={Link}
          href="/mi-plan"
          color={vencida ? "error" : "warning"}
          variant="contained"
          size="small"
          disableElevation
          sx={{ whiteSpace: "nowrap" }}
        >
          Compra tu plan aquí
        </Button>
      }
    >
      {mensaje}
    </Alert>
  );
};

export default TrialBanner;
