"use client";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { keyframes, styled, useTheme } from "@mui/material/styles";
import {
  IconBell,
  IconBrandWhatsapp,
  IconBuildingStore,
  IconCalendarEvent,
  IconCash,
  IconChartBar,
  IconCreditCard,
  IconDeviceMobile,
  IconHeadset,
  IconLock,
  IconPackage,
  IconRefresh,
  IconWorld,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";

/**
 * Mismo componente real de `homepage/exceptional-feature` (3 filas en
 * marquee infinito, dos hacia la izquierda y una hacia la derecha) — con las
 * funciones reales de este SaaS en vez de las de la plantilla ("6 Theme
 * Colors", "Material Ui"...) y usando `@tabler/icons-react` en vez de copiar
 * 13 SVG nuevos, ya que es el sistema de íconos que usa el resto de la app.
 *
 * El keyframe `marquee`/`marquee2` vive local a este componente (vía
 * `keyframes` de MUI) en vez de tocar el tema global — la demo original lo
 * registra en `Components.tsx`, pero cambiar el tema compartido por una sola
 * sección es más riesgo del que vale.
 */
const marquee = keyframes`
  0% { transform: translate3d(0,0,0); }
  100% { transform: translate3d(-50%,0,0); }
`;

const marqueeReverse = keyframes`
  0% { transform: translate3d(-50%,0,0); }
  100% { transform: translate3d(0,0,0); }
`;

const Fila = styled(Box)({
  width: "100%",
  overflowX: "hidden",
  whiteSpace: "nowrap",
  boxSizing: "border-box",
});

const FilaContenido = styled(Box)({
  display: "inline-flex",
  gap: "30px",
  animation: `${marquee} 30s linear infinite`,
});

const FilaContenidoInversa = styled(Box)({
  display: "inline-flex",
  gap: "30px",
  animation: `${marqueeReverse} 30s linear infinite`,
});

interface Item {
  icono: Icon;
  texto: string;
}

const fila1: Item[] = [
  { icono: IconCalendarEvent, texto: "Agenda online 24/7" },
  { icono: IconBrandWhatsapp, texto: "Recordatorios por WhatsApp" },
  { icono: IconWorld, texto: "Sitio web propio" },
  { icono: IconBuildingStore, texto: "Múltiples locaciones" },
];

const fila2: Item[] = [
  { icono: IconCash, texto: "Caja e ingresos" },
  { icono: IconChartBar, texto: "Reportes en tiempo real" },
  { icono: IconDeviceMobile, texto: "Subdominio personalizado" },
  { icono: IconCreditCard, texto: "Pagos y cierre de turno" },
];

const fila3: Item[] = [
  { icono: IconHeadset, texto: "Soporte prioritario" },
  { icono: IconPackage, texto: "Inventario básico" },
  { icono: IconBell, texto: "Notificaciones y alertas" },
  { icono: IconRefresh, texto: "Actualizaciones constantes" },
  { icono: IconLock, texto: "Datos seguros en la nube" },
];

/** Cada fila se duplica una vez, para que el loop del marquee no se note. */
function ItemBox({ icono: Icono, texto }: Item) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        boxShadow: theme.shadows[10],
        bgcolor: "background.default",
        minHeight: "72px",
        width: "300px",
        borderRadius: "16px",
        my: "15px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        flexShrink: 0,
      }}
    >
      <Icono size={22} stroke={1.75} color={theme.palette.primary.main} />
      <Typography fontSize="15px" fontWeight={600}>
        {texto}
      </Typography>
    </Box>
  );
}

const ExceptionalFeature = () => (
  <Container sx={{ maxWidth: "1400px !important" }}>
    <Box bgcolor="primary.light" borderRadius="24px" sx={{ py: { xs: "40px", lg: "70px" } }}>
      <Container maxWidth="lg">
        <Grid container spacing={3} alignItems="center" justifyContent="center">
          <Grid size={{ xs: 12, lg: 7, sm: 9 }}>
            <Typography
              variant="h4"
              mb="55px"
              textAlign="center"
              fontWeight={700}
              lineHeight="1.2"
              sx={{ fontSize: { lg: "40px", xs: "30px" } }}
            >
              Todo lo que tu negocio necesita, en un solo lugar
            </Typography>
          </Grid>
        </Grid>
      </Container>

      <Fila>
        <FilaContenido>
          {[...fila1, ...fila1].map((item, i) => (
            <ItemBox key={i} {...item} />
          ))}
        </FilaContenido>
      </Fila>

      <Fila>
        <FilaContenidoInversa>
          {[...fila2, ...fila2].map((item, i) => (
            <ItemBox key={i} {...item} />
          ))}
        </FilaContenidoInversa>
      </Fila>

      <Fila>
        <FilaContenido>
          {[...fila3, ...fila3].map((item, i) => (
            <ItemBox key={i} {...item} />
          ))}
        </FilaContenido>
      </Fila>
    </Box>
  </Container>
);

export default ExceptionalFeature;
