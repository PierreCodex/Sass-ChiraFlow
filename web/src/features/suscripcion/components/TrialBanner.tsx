"use client";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import {
  IconHourglass,
  IconHourglassEmpty,
  IconHourglassHigh,
  IconHourglassLow,
} from "@tabler/icons-react";

import { useSuscripcion } from "../hooks/useSuscripcion";
import type { EstadoSuscripcion } from "../types";

/**
 * Aviso de prueba gratuita / suscripción terminada.
 *
 * Se renderiza en el layout del dashboard, así que **sale en las 17 pantallas,
 * todo el día, todos los días de la prueba**. De ahí las dos reglas que
 * gobiernan el diseño:
 *
 * 1. La urgencia **se escala**: el color, el reloj y el texto del botón
 *    cambian según se acerca el final. Un banner que grita igual el día 14 que
 *    el día 1 no dice nada.
 * 2. La animación **significa algo**: el reloj gira más a menudo cuanto menos
 *    queda, y no se mueve mientras sobra tiempo. Nada de botones que laten sin
 *    parar — eso no genera urgencia, genera fatiga.
 */

type Nivel = "info" | "aviso" | "critica" | "fin";

interface Aspecto {
  severity: "info" | "warning" | "error";
  Icono: typeof IconHourglass;
  /** Segundos entre giros del reloj. 0 = quieto. */
  giro: number;
  textoBoton: string;
}

// El nivel de arena del icono acompaña al nivel de urgencia: lleno cuando
// sobra tiempo, vacío cuando se acabó.
const ASPECTO: Record<Nivel, Aspecto> = {
  info: {
    severity: "info",
    Icono: IconHourglassHigh,
    giro: 0,
    textoBoton: "Ver planes",
  },
  aviso: {
    severity: "warning",
    Icono: IconHourglass,
    giro: 8,
    textoBoton: "Ver planes",
  },
  critica: {
    severity: "error",
    Icono: IconHourglassLow,
    giro: 4,
    textoBoton: "Compra tu plan",
  },
  fin: {
    severity: "error",
    Icono: IconHourglassEmpty,
    giro: 0,
    textoBoton: "Compra tu plan",
  },
};

function nivelDe(estado: EstadoSuscripcion, dias: number): Nivel {
  if (estado === "vencida" || estado === "cancelada" || dias <= 0) return "fin";
  if (dias <= 2) return "critica";
  if (dias <= 7) return "aviso";
  return "info";
}

function mensajeDe(estado: EstadoSuscripcion, dias: number, nivel: Nivel) {
  if (nivel === "fin") {
    return estado === "cancelada"
      ? "Tu suscripción está cancelada. Compra un plan para seguir usando la plataforma."
      : "Tu prueba gratuita terminó. Compra un plan para seguir usando la plataforma.";
  }

  // Sin el "(s)" de programador que arrastraba el texto anterior.
  return dias === 1
    ? "Te queda 1 día de prueba gratuita."
    : `Te quedan ${dias} días de prueba gratuita.`;
}

const TrialBanner = () => {
  const { data } = useSuscripcion();

  if (!data) return null;
  if (data.estado === "activa") return null;

  const nivel = nivelDe(data.estado, data.dias_restantes);
  const { severity, Icono, giro, textoBoton } = ASPECTO[nivel];
  const color = severity === "info" ? "info" : severity;

  return (
    <Alert
      severity={severity}
      variant="outlined"
      icon={
        <Box
          sx={{
            display: "flex",
            // Un giro completo cada `giro` segundos: la vuelta entera evita el
            // salto que daría volver de 180° a 0°. El 88% del ciclo está
            // quieto; solo el tramo final se mueve.
            ...(giro > 0 && {
              animation: `girarReloj ${giro}s ease-in-out infinite`,
              "@keyframes girarReloj": {
                "0%, 88%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" },
              },
              "@media (prefers-reduced-motion: reduce)": {
                animation: "none",
              },
            }),
          }}
        >
          <Icono size={22} stroke={1.6} />
        </Box>
      }
      sx={{ mb: 3, alignItems: "center", "& .MuiAlert-message": { flexGrow: 1 } }}
      action={
        <Button
          component={Link}
          href="/mi-plan"
          color={color}
          variant="contained"
          size="small"
          disableElevation
          sx={{ whiteSpace: "nowrap" }}
        >
          {textoBoton}
        </Button>
      }
    >
      <Typography variant="body2" fontWeight={nivel === "info" ? 400 : 500}>
        {mensajeDe(data.estado, data.dias_restantes, nivel)}
      </Typography>
    </Alert>
  );
};

export default TrialBanner;
