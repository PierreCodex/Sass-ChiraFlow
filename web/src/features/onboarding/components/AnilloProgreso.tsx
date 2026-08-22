"use client";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

interface Props {
  completados: number;
  total: number;
}

/**
 * Anillo de progreso de la cabecera. Dos círculos superpuestos: el de atrás es
 * la pista y el de delante el avance, que se anima solo porque MUI transiciona
 * el `strokeDashoffset` al cambiar `value`.
 */
const AnilloProgreso = ({ completados, total }: Props) => {
  const porcentaje = total ? (completados / total) * 100 : 0;

  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <CircularProgress
        variant="determinate"
        value={100}
        size={64}
        thickness={4}
        sx={{ color: "rgba(255,255,255,0.25)" }}
      />
      <CircularProgress
        variant="determinate"
        value={porcentaje}
        size={64}
        thickness={4}
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
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="subtitle2" fontWeight={700} color="#fff">
          {completados}/{total}
        </Typography>
      </Box>
    </Box>
  );
};

export default AnilloProgreso;
