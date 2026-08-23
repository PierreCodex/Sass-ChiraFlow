"use client";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";

import { useSuscripcion } from "../hooks/useSuscripcion";
import type { EstadoSuscripcion } from "../types";
import RelojArena, { type NivelArena } from "./RelojArena";

/**
 * Aviso del estado del plan.
 *
 * Se renderiza en el layout del dashboard, así que **sale en las 17 pantallas,
 * todo el día, todos los días de la prueba**. De ahí las reglas del diseño:
 *
 * 1. Es un **bloque propio**, no un `Alert` del montón: tiene que verse como
 *    algo distinto del contenido para que el dueño lo registre.
 * 2. La urgencia **se escala**: color, arena y textos cambian según se acerca
 *    el final. Un banner que grita igual el día 14 que el día 1 no dice nada.
 * 3. La animación **significa algo**: la arena cae siempre, pero el bulbo de
 *    arriba se vacía conforme quedan menos días. Nada de botones que laten sin
 *    parar — eso no genera urgencia, genera fatiga.
 */

type Nivel = "info" | "aviso" | "critica" | "fin";

interface Aspecto {
  /** Clave de la paleta: tiñe borde, fondo, icono y botón. */
  color: "info" | "warning" | "error";
  arena: NivelArena;
  /** Segundos por vuelta del reloj. 0 = quieto. */
  giro: number;
  textoBoton: string;
}

const ASPECTO: Record<Nivel, Aspecto> = {
  info: { color: "info", arena: "alto", giro: 12, textoBoton: "Ver planes" },
  aviso: {
    color: "warning",
    arena: "medio",
    giro: 7,
    textoBoton: "Ver planes",
  },
  critica: {
    color: "error",
    arena: "bajo",
    giro: 4,
    textoBoton: "Compra tu plan",
  },
  // Sin arena que caer, girarlo no significa nada.
  fin: {
    color: "error",
    arena: "vacio",
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

/** Titular y motivo. El motivo es lo que convierte, no el número. */
function textosDe(estado: EstadoSuscripcion, dias: number, nivel: Nivel) {
  if (nivel === "fin") {
    return estado === "cancelada"
      ? {
          titulo: "Tu suscripción está cancelada",
          detalle: "Compra un plan para volver a activar tu cuenta.",
        }
      : {
          titulo: "Tu prueba gratuita terminó",
          detalle: "Compra un plan para seguir usando la plataforma.",
        };
  }

  // Sin el "(s)" de programador que arrastraba el texto anterior.
  const titulo =
    dias === 1
      ? "Te queda 1 día de prueba"
      : `Te quedan ${dias} días de prueba`;

  if (nivel === "critica") {
    return {
      titulo,
      detalle:
        "Cuando termine, tu tienda pública deja de recibir reservas. Elige tu plan hoy.",
    };
  }

  if (nivel === "aviso") {
    return {
      titulo,
      detalle: "Elige tu plan antes de que termine para no perder el acceso.",
    };
  }

  return {
    titulo,
    detalle:
      "Tu negocio funciona al completo. Cuando quieras, elige el plan que mejor te calce.",
  };
}

const TrialBanner = () => {
  const { data } = useSuscripcion();

  if (!data) return null;
  if (data.estado === "activa") return null;

  const nivel = nivelDe(data.estado, data.dias_restantes);
  const { color, arena, giro, textoBoton } = ASPECTO[nivel];
  const { titulo, detalle } = textosDe(data.estado, data.dias_restantes, nivel);

  return (
    <Box
      sx={(theme) => ({
        mb: 3,
        p: 2,
        borderRadius: 2,
        border: "1px solid",
        borderColor: alpha(theme.palette[color].main, 0.35),
        // `alpha` sobre el color principal y no el `.light` de la paleta: ese
        // tono no se invierte en modo oscuro (trampa de CLAUDE.md).
        bgcolor: alpha(theme.palette[color].main, 0.07),
      })}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", sm: "center" }}
      >
        <Box
          sx={(theme) => ({
            width: 46,
            height: 46,
            flexShrink: 0,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            color: `${color}.main`,
            bgcolor: alpha(theme.palette[color].main, 0.14),
          })}
        >
          <RelojArena nivel={arena} size={26} giro={giro} />
        </Box>

        <Box flexGrow={1} minWidth={0}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            color={`${color}.main`}
          >
            {titulo}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {detalle}
          </Typography>
        </Box>

        <Button
          component={Link}
          href="/mi-plan"
          color={color}
          variant="contained"
          disableElevation
          sx={{ whiteSpace: "nowrap", flexShrink: 0 }}
        >
          {textoBoton}
        </Button>
      </Stack>
    </Box>
  );
};

export default TrialBanner;
