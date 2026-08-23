"use client";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import {
  IconBuildingStore,
  IconCalendarCheck,
  IconCheck,
  IconClipboardList,
  IconClock,
  IconEye,
  IconUserPlus,
  type Icon,
} from "@tabler/icons-react";

import { describirPaso, type PasoOnboarding } from "../types";

/**
 * Un icono por tarea, a la derecha. Es lo que hace que cada fila se reconozca
 * de un vistazo sin leerla entera; el número de la izquierda solo dice el
 * orden.
 */
const ICONOS: Record<string, Icon> = {
  nombre_negocio: IconBuildingStore,
  horario_local: IconClock,
  primer_profesional: IconUserPlus,
  primer_servicio: IconClipboardList,
  reserva_prueba: IconCalendarCheck,
  sitio_publico: IconEye,
};

interface Props {
  paso: PasoOnboarding;
  indice: number;
  /** La primera pendiente: es la única que se pinta como llamada a la acción. */
  siguiente: boolean;
  onIr: () => void;
  deshabilitado?: boolean;
  pista?: string;
}

/**
 * Tarjeta de tarea. Parte del patrón de `widgets/cards/UpcomingActivity` de la
 * plantilla —avatar redondeado, título y subtítulo— y le añade lo que la
 * plantilla no trae: tarjeta propia con tres estados (hecha, actual,
 * pendiente), entrada escalonada y el check que aparece con un rebote.
 *
 * Los tintes van con `alpha()` sobre los colores del tema y no con
 * `primary.light` / `success.light`: esos tonos **no se invierten en modo
 * oscuro** y el texto encima queda ilegible (trampa documentada en CLAUDE.md).
 */
const FilaPaso = ({
  paso,
  indice,
  siguiente,
  onIr,
  deshabilitado,
  pista,
}: Props) => {
  const { etiqueta, descripcion } = describirPaso(paso.clave);
  const inerte = paso.completado || deshabilitado;
  const IconoTarea = ICONOS[paso.clave];

  const fila = (
    <Box
      onClick={inerte ? undefined : onIr}
      sx={(theme) => ({
        mx: 2,
        my: 1,
        px: 2,
        py: 1.75,
        borderRadius: 2,
        cursor: inerte ? "default" : "pointer",
        // La animación de entrada termina en `opacity: var(--opacidad-fila)` y
        // no en 1: con `fill-mode: both` el último fotograma se queda fijado y
        // pisaría la atenuación del paso deshabilitado.
        "--opacidad-fila": deshabilitado ? 0.45 : 1,
        opacity: "var(--opacidad-fila)",
        bgcolor: paso.completado
          ? alpha(theme.palette.success.main, 0.08)
          : siguiente
            ? alpha(theme.palette.primary.main, 0.06)
            : "background.paper",
        border: "1px solid",
        borderColor: paso.completado
          ? alpha(theme.palette.success.main, 0.28)
          : siguiente
            ? alpha(theme.palette.primary.main, 0.35)
            : "divider",
        boxShadow: siguiente
          ? `0 6px 16px ${alpha(theme.palette.primary.main, 0.18)}`
          : "none",
        transition:
          "background-color 250ms, border-color 250ms, box-shadow 250ms",
        animation: "entradaFila 420ms both cubic-bezier(0.16, 1, 0.3, 1)",
        animationDelay: `${indice * 60}ms`,
        "@keyframes entradaFila": {
          from: { opacity: 0, transform: "translateX(16px)" },
          to: { opacity: "var(--opacidad-fila)", transform: "translateX(0)" },
        },
        "&:hover": inerte
          ? undefined
          : {
              borderColor: theme.palette.primary.main,
              boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.22)}`,
              "& .iconoTarea": { transform: "scale(1.12)" },
            },
        "@media (prefers-reduced-motion: reduce)": { animation: "none" },
      })}
    >
      <Stack direction="row" spacing={1.75} alignItems="center">
        <Avatar
          variant="rounded"
          sx={(theme) => ({
            width: 34,
            height: 34,
            flexShrink: 0,
            fontSize: 15,
            fontWeight: 700,
            transition: "background-color 300ms, color 300ms",
            // Hecha: verde macizo con el check en blanco, como una casilla ya
            // marcada. Pendiente: solo el número, en tinte suave.
            bgcolor: paso.completado
              ? "success.main"
              : alpha(theme.palette.primary.main, 0.12),
            color: paso.completado ? "#fff" : "primary.main",
          })}
        >
          {paso.completado ? (
            <Box
              component="span"
              sx={{
                display: "inline-flex",
                animation:
                  "aparecerCheck 420ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                "@keyframes aparecerCheck": {
                  "0%": { transform: "scale(0)" },
                  "60%": { transform: "scale(1.25)" },
                  "100%": { transform: "scale(1)" },
                },
              }}
            >
              <IconCheck size={18} stroke={3} />
            </Box>
          ) : (
            indice + 1
          )}
        </Avatar>

        <Box flexGrow={1} minWidth={0}>
          {/* Etiqueta encima y no al lado del título: a 380 px de ancho, un
              chip en la misma línea parte el título en tres. */}
          {siguiente ? (
            <Chip
              label="PASO ACTUAL"
              size="small"
              color="primary"
              sx={{
                height: 18,
                fontSize: 9.5,
                fontWeight: 700,
                letterSpacing: 0.5,
                mb: 0.5,
              }}
            />
          ) : null}
          <Typography
            variant="h6"
            fontSize={14.5}
            color={paso.completado ? "textSecondary" : "textPrimary"}
            mb="1px"
            sx={{ transition: "color 300ms" }}
          >
            {etiqueta}
          </Typography>
          <Typography variant="subtitle2" fontSize={12.5} color="textSecondary">
            {descripcion}
          </Typography>
        </Box>

        {IconoTarea ? (
          <Box
            className="iconoTarea"
            sx={{
              display: "inline-flex",
              flexShrink: 0,
              color: paso.completado ? "success.main" : "text.secondary",
              transition: "transform 200ms, color 250ms",
            }}
          >
            <IconoTarea size={20} stroke={1.6} />
          </Box>
        ) : null}
      </Stack>
    </Box>
  );

  return pista ? (
    <Tooltip title={pista} placement="left">
      <span>{fila}</span>
    </Tooltip>
  ) : (
    fila
  );
};

export default FilaPaso;
