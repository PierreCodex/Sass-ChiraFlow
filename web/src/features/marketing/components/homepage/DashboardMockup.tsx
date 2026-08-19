"use client";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";

/**
 * Mockup ilustrativo del Dashboard real del panel de negocio (StatsCards +
 * gráfica de ventas + citas del día) — no es una captura real: no hay forma
 * de tomar screenshots de la app en este equipo (la extensión de Chrome no
 * está conectada). Reemplaza el montage de capturas de Modernize
 * (`design-collection.png`) que usaba la demo original en este mismo lugar.
 */
const BARRAS = [40, 65, 50, 80, 55, 90, 60];

function Ventana({
  rotate,
  translateX,
  translateY,
  zIndex,
  opacity = 1,
}: {
  rotate: number;
  translateX: number;
  translateY: number;
  zIndex: number;
  opacity?: number;
}) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 340,
        borderRadius: "16px",
        overflow: "hidden",
        bgcolor: "background.paper",
        boxShadow: "0px 20px 40px rgba(0,0,0,0.25)",
        transform: `translate(${translateX}px, ${translateY}px) rotate(${rotate}deg)`,
        zIndex,
        opacity,
      }}
    >
      {/* barra de ventana */}
      <Stack direction="row" spacing={0.5} sx={{ px: 1.5, py: 1, bgcolor: "grey.100" }}>
        <Box width={8} height={8} borderRadius="50%" bgcolor="error.main" />
        <Box width={8} height={8} borderRadius="50%" bgcolor="warning.main" />
        <Box width={8} height={8} borderRadius="50%" bgcolor="success.main" />
      </Stack>

      <Box p={2}>
        <Typography variant="caption" fontWeight={700} color="text.secondary">
          Dashboard
        </Typography>

        {/* stat chips */}
        <Stack direction="row" spacing={1} mt={1} mb={1.5}>
          {(["primary", "warning", "secondary", "success"] as const).map((c) => (
            <Box
              key={c}
              flex={1}
              borderRadius="10px"
              bgcolor={`${c}.light`}
              p={0.75}
              textAlign="center"
            >
              <Box
                width={16}
                height={16}
                borderRadius="6px"
                bgcolor={`${c}.main`}
                mx="auto"
                mb={0.5}
              />
              <Box width="70%" height={6} borderRadius="3px" bgcolor={`${c}.main`} mx="auto" sx={{ opacity: 0.6 }} />
            </Box>
          ))}
        </Stack>

        {/* mini gráfica de barras */}
        <Box
          display="flex"
          alignItems="flex-end"
          gap={0.75}
          height={70}
          px={0.5}
          borderRadius="10px"
          bgcolor="grey.50"
          sx={{ border: `1px solid ${theme.palette.divider}` }}
        >
          {BARRAS.map((h, i) => (
            <Box
              key={i}
              flex={1}
              height={`${h}%`}
              borderRadius="4px 4px 0 0"
              bgcolor="primary.main"
              sx={{ opacity: 0.4 + (i / BARRAS.length) * 0.6 }}
            />
          ))}
        </Box>

        {/* mini lista de citas */}
        <Stack spacing={0.75} mt={1.5}>
          {[1, 2, 3].map((i) => (
            <Stack key={i} direction="row" spacing={1} alignItems="center">
              <Box width={22} height={22} borderRadius="50%" bgcolor="primary.light" flexShrink={0} />
              <Box flex={1}>
                <Box width="80%" height={6} borderRadius="3px" bgcolor="grey.300" mb={0.5} />
                <Box width="50%" height={5} borderRadius="3px" bgcolor="grey.200" />
              </Box>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

const DashboardMockup = () => (
  <Box
    sx={{
      position: "relative",
      width: 420,
      height: 320,
      display: { xs: "none", lg: "block" },
    }}
  >
    <Ventana rotate={8} translateX={60} translateY={10} zIndex={1} opacity={0.55} />
    <Ventana rotate={-4} translateX={20} translateY={40} zIndex={2} />
  </Box>
);

export default DashboardMockup;
