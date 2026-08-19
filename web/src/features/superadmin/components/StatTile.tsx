import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import type { Icon } from "@tabler/icons-react";

export type ColorTile = "primary" | "secondary" | "success" | "warning" | "error" | "info";

export interface StatTileProps {
  titulo: string;
  valor: string | number;
  icono: Icon;
  color: ColorTile;
}

/**
 * Mismo patrón real de `dashboards/modern/TopCards.tsx` en Modernize: ícono
 * arriba centrado, título debajo, número al final — todo apilado en
 * vertical, no ícono-junto-al-texto en horizontal. Por eso cabe sin cortarse
 * en una fila de 6: el texto tiene el ancho completo de la tarjeta, no
 * tiene que competir al lado de un avatar de 48px.
 *
 * `components/shared/StatCard` (icono+texto en fila) sigue siendo la
 * correcta para filas de 4, como el dashboard del negocio.
 */
const StatTile = ({ titulo, valor, icono: Icono, color }: StatTileProps) => {
  // Este proyecto usa el ThemeProvider clásico de MUI, no su modo de
  // variables CSS — `var(--mui-palette-...)` no existe y dejaba el ícono
  // sin color (invisible). El color real sale del tema con `useTheme()`.
  const theme = useTheme();

  return (
    <Box bgcolor={`${color}.light`} textAlign="center" borderRadius={2} height="100%">
      <CardContent>
        <Icono size={40} stroke={1.5} color={theme.palette[color].main} />
        <Typography color={`${color}.main`} mt={1} variant="subtitle1" fontWeight={600}>
          {titulo}
        </Typography>
        <Typography color={`${color}.main`} variant="h4" fontWeight={600}>
          {valor}
        </Typography>
      </CardContent>
    </Box>
  );
};

export default StatTile;
