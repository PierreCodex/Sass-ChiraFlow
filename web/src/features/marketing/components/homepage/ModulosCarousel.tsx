"use client";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import {
  IconBrandWhatsapp,
  IconCalendarEvent,
  IconCash,
  IconChartBar,
  IconPackage,
  IconUsers,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";

interface Modulo {
  icono: Icon;
  titulo: string;
  color: "primary" | "secondary" | "success" | "warning" | "error" | "info";
}

/**
 * Mismo carrusel que `homepage/powerful-dozens/DozensCarousel.tsx` (autoplay
 * infinito, `react-slick`), pero con los módulos reales de este SaaS en vez
 * de capturas de las variantes de Modernize (dark/RTL/horizontal…) — eso
 * vendía plantillas, esto vende un sistema de citas.
 */
const MODULOS: Modulo[] = [
  { icono: IconCalendarEvent, titulo: "Citas", color: "primary" },
  { icono: IconCash, titulo: "Caja", color: "success" },
  { icono: IconChartBar, titulo: "Reportes", color: "secondary" },
  { icono: IconBrandWhatsapp, titulo: "WhatsApp", color: "info" },
  { icono: IconUsers, titulo: "Clientes", color: "warning" },
  { icono: IconPackage, titulo: "Inventario", color: "error" },
];

const ModulosCarousel = () => {
  const theme = useTheme();

  const settings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 4500,
    autoplay: true,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <Box
      sx={{
        "& .slick-track": { display: "flex", gap: "24px" },
        "& .slick-slide": { height: "auto" },
        "& .slick-slide > div": { height: "100%" },
      }}
    >
      <Slider {...settings}>
        {MODULOS.map((modulo) => {
          const Icono = modulo.icono;
          return (
            <Box key={modulo.titulo} px={1}>
              <Stack
                alignItems="center"
                justifyContent="center"
                spacing={1.5}
                sx={{
                  height: 200,
                  borderRadius: "16px",
                  bgcolor: `${modulo.color}.light`,
                  boxShadow: theme.shadows[10],
                }}
              >
                <Icono size={44} stroke={1.5} color={theme.palette[modulo.color].main} />
                <Typography variant="h6" fontWeight={700} color={`${modulo.color}.main`}>
                  {modulo.titulo}
                </Typography>
              </Stack>
            </Box>
          );
        })}
      </Slider>
    </Box>
  );
};

export default ModulosCarousel;
