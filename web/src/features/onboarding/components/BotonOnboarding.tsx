"use client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import { alpha } from "@mui/material/styles";

interface Props {
  completados: number;
  total: number;
  pendientes: number;
  /** El panel está abierto: el botón se queda hundido. */
  activo: boolean;
  onClick: () => void;
}

/**
 * El disparador del checklist en el header.
 *
 * Antes era un icono con una chapita y se perdía entre los otros iconos de la
 * barra. Ahora es una píldora con texto y su anillo de avance a la derecha: se
 * lee de un vistazo cuánto queda y no compite con las campanas.
 *
 * En móvil el texto se esconde y queda solo el anillo, que ahí sí necesita el
 * sitio.
 */
const BotonOnboarding = ({
  completados,
  total,
  pendientes,
  activo,
  onClick,
}: Props) => {
  const porcentaje = total ? (completados / total) * 100 : 0;
  const etiqueta = `Configura tu negocio, ${pendientes} ${
    pendientes === 1 ? "paso pendiente" : "pasos pendientes"
  }`;

  return (
    <Tooltip title={etiqueta}>
      <Button
        onClick={onClick}
        aria-label={etiqueta}
        disableElevation
        sx={{
          minWidth: 0,
          px: { xs: 1, sm: 2 },
          py: 0.75,
          borderRadius: 999,
          textTransform: "none",
          fontWeight: 600,
          whiteSpace: "nowrap",
          // Píldora de contraste, no un botón de color: el header ya tiene
          // acentos de sobra. En oscuro el negro no se ve, así que ahí la
          // píldora se levanta con un velo claro.
          color: "#fff",
          bgcolor: (t) =>
            t.palette.mode === "dark"
              ? alpha(t.palette.common.white, activo ? 0.24 : 0.16)
              : t.palette.grey[600],
          "&:hover": {
            bgcolor: (t) =>
              t.palette.mode === "dark"
                ? alpha(t.palette.common.white, 0.28)
                : alpha(t.palette.grey[600], 0.85),
          },
        }}
      >
        <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
          Configura tu negocio
        </Box>

        {/* Dos anillos superpuestos: el de atrás es la pista, el de delante
            el avance. Igual que el grande del panel, en pequeño. */}
        <Box
          sx={{
            position: "relative",
            display: "inline-flex",
            ml: { xs: 0, sm: 1 },
          }}
        >
          <CircularProgress
            variant="determinate"
            value={100}
            size={18}
            thickness={5}
            sx={{ color: alpha("#fff", 0.3) }}
          />
          <CircularProgress
            variant="determinate"
            value={porcentaje}
            size={18}
            thickness={5}
            sx={{
              color: "#fff",
              position: "absolute",
              left: 0,
              strokeLinecap: "round",
              "& .MuiCircularProgress-circle": {
                transition: "stroke-dashoffset 800ms cubic-bezier(0.4, 0, 0.2, 1)",
              },
            }}
          />
        </Box>
      </Button>
    </Tooltip>
  );
};

export default BotonOnboarding;
