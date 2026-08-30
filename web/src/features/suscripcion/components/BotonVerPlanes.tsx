"use client";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import { alpha } from "@mui/material/styles";

import { useSuscripcion } from "../hooks/useSuscripcion";
import type { EstadoSuscripcion } from "../types";
import RelojArena, { type NivelArena } from "./RelojArena";

/**
 * Aviso del plan, en el header.
 *
 * Sustituye al bloque que salía encima del contenido en las 17 pantallas: se
 * repetía todo el día y se comía el sitio de la pantalla. La información que
 * importa —cuánto queda y que hay que elegir plan— cabe en un botón.
 *
 * Lo que **no** se pierde al encoger: la urgencia sigue escalando. El reloj
 * de arena se vacía y gira más rápido, el color pasa de neutro a ámbar y a
 * rojo, y el texto cambia de "Ver planes" a "Compra tu plan". El detalle
 * completo vive en el tooltip.
 */

type Nivel = "info" | "aviso" | "critica" | "fin";

interface Aspecto {
  /** Clave de la paleta: tiñe borde, texto y reloj. */
  color: "info" | "warning" | "error";
  arena: NivelArena;
  /** Segundos por vuelta del reloj. 0 = quieto. */
  giro: number;
  texto: string;
}

const ASPECTO: Record<Nivel, Aspecto> = {
  info: { color: "info", arena: "alto", giro: 12, texto: "Ver planes" },
  aviso: { color: "warning", arena: "medio", giro: 7, texto: "Ver planes" },
  critica: {
    color: "error",
    arena: "bajo",
    giro: 4,
    texto: "Compra tu plan",
  },
  // Sin arena que caer, girarlo no significa nada.
  fin: { color: "error", arena: "vacio", giro: 0, texto: "Compra tu plan" },
};

function nivelDe(estado: EstadoSuscripcion, dias: number): Nivel {
  if (estado === "vencida" || estado === "cancelada" || dias <= 0) return "fin";
  if (dias <= 2) return "critica";
  if (dias <= 7) return "aviso";
  return "info";
}

/** Lo que antes era el titular y el motivo del bloque, ahora en el tooltip. */
function pistaDe(estado: EstadoSuscripcion, dias: number, nivel: Nivel) {
  if (nivel === "fin") {
    return estado === "cancelada"
      ? "Tu suscripción está cancelada. Compra un plan para volver a activar tu cuenta."
      : "Tu prueba gratuita terminó. Compra un plan para seguir usando la plataforma.";
  }

  const quedan =
    dias === 1
      ? "Te queda 1 día de prueba"
      : `Te quedan ${dias} días de prueba`;

  if (nivel === "critica") {
    return `${quedan}. Cuando termine, tu tienda pública deja de recibir reservas.`;
  }

  if (nivel === "aviso") {
    return `${quedan}. Elige tu plan antes de que termine para no perder el acceso.`;
  }

  return `${quedan}. Cuando quieras, elige el plan que mejor te calce.`;
}

/**
 * La pinta del botón, a partir del estado y los días. Separado del que lee la
 * API para poder verlo en los cuatro niveles sin tocar datos.
 */
export const VistaBotonPlanes = ({
  estado,
  dias,
}: {
  estado: EstadoSuscripcion;
  dias: number;
}) => {
  const nivel = nivelDe(estado, dias);
  const { color, arena, giro, texto } = ASPECTO[nivel];
  const pista = pistaDe(estado, dias, nivel);

  return (
    <Tooltip title={pista}>
      <Button
        component={Link}
        href="/mi-plan"
        variant="outlined"
        color={color}
        aria-label={`${texto}. ${pista}`}
        startIcon={<RelojArena nivel={arena} size={18} giro={giro} />}
        sx={(theme) => ({
          ml: 1,
          px: 1.75,
          py: 0.5,
          flexShrink: 0,
          borderRadius: 999,
          textTransform: "none",
          fontWeight: 600,
          whiteSpace: "nowrap",
          // `alpha` sobre el color principal y no el `.light` de la paleta: ese
          // tono no se invierte en modo oscuro (trampa de CLAUDE.md).
          borderColor: alpha(theme.palette[color].main, 0.5),
          "&:hover": {
            borderColor: theme.palette[color].main,
            bgcolor: alpha(theme.palette[color].main, 0.08),
          },
          // En móvil la barra va justa: queda el reloj, que ya dice el estado.
          "& .MuiButton-startIcon": { mr: { xs: 0, sm: 1 } },
        })}
      >
        <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
          {texto}
        </Box>
      </Button>
    </Tooltip>
  );
};

const BotonVerPlanes = () => {
  const { data } = useSuscripcion();

  if (!data) return null;
  // Con el plan al día no hay nada que avisar.
  if (data.estado === "activa") return null;

  return <VistaBotonPlanes estado={data.estado} dias={data.dias_restantes} />;
};

export default BotonVerPlanes;
