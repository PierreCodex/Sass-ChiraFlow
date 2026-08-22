"use client";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { IconCheck, IconChevronRight } from "@tabler/icons-react";

import { describirPaso, type PasoOnboarding } from "../types";

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
 * Fila de tarea. Parte del patrón de `widgets/cards/UpcomingActivity` de la
 * plantilla —avatar redondeado sobre color claro, título y subtítulo— y le
 * añade lo que la plantilla no trae: entrada escalonada, realce de la tarea
 * siguiente y el check que aparece con un rebote.
 *
 * Los fondos van con `alpha()` sobre `primary.main` y no con `primary.light`:
 * ese tono **no se invierte en modo oscuro** y el texto encima queda ilegible
 * (trampa documentada en CLAUDE.md).
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

  const fila = (
    <Box
      onClick={inerte ? undefined : onIr}
      sx={(theme) => ({
        mx: 2,
        my: 0.5,
        px: 2,
        py: 1.75,
        borderRadius: 2,
        cursor: inerte ? "default" : "pointer",
        // La animación de entrada termina en `opacity: var(--opacidad-fila)` y
        // no en 1: con `fill-mode: both` el último fotograma se queda fijado y
        // pisaría la atenuación del paso deshabilitado.
        "--opacidad-fila": deshabilitado ? 0.45 : 1,
        opacity: "var(--opacidad-fila)",
        // Realce solo de la siguiente: seis filas iguales no dicen por dónde
        // empezar.
        bgcolor: siguiente
          ? alpha(theme.palette.primary.main, 0.08)
          : "transparent",
        border: "1px solid",
        borderColor: siguiente
          ? alpha(theme.palette.primary.main, 0.24)
          : "transparent",
        transition: "background-color 200ms, border-color 200ms, transform 200ms",
        // Entrada escalonada: cada fila entra 60 ms después de la anterior.
        animation: "entradaFila 420ms both cubic-bezier(0.16, 1, 0.3, 1)",
        animationDelay: `${indice * 60}ms`,
        "@keyframes entradaFila": {
          from: { opacity: 0, transform: "translateX(16px)" },
          to: { opacity: "var(--opacidad-fila)", transform: "translateX(0)" },
        },
        "&:hover": inerte
          ? undefined
          : {
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              "& .flecha": { transform: "translateX(4px)" },
            },
        "@media (prefers-reduced-motion: reduce)": {
          animation: "none",
        },
      })}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar
          variant="rounded"
          sx={(theme) => ({
            width: 40,
            height: 40,
            flexShrink: 0,
            fontWeight: 600,
            transition: "background-color 300ms, color 300ms",
            bgcolor: paso.completado
              ? alpha(theme.palette.success.main, 0.16)
              : alpha(theme.palette.primary.main, 0.12),
            color: paso.completado ? "success.main" : "primary.main",
          })}
        >
          {paso.completado ? (
            <Box
              component="span"
              sx={{
                display: "inline-flex",
                animation: "aparecerCheck 420ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                "@keyframes aparecerCheck": {
                  "0%": { transform: "scale(0)" },
                  "60%": { transform: "scale(1.25)" },
                  "100%": { transform: "scale(1)" },
                },
              }}
            >
              <IconCheck size={20} stroke={2.5} />
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
              label="Empieza aquí"
              size="small"
              color="primary"
              sx={{ height: 19, fontSize: 10.5, fontWeight: 700, mb: 0.5 }}
            />
          ) : null}
          <Typography
            variant="h6"
            color={paso.completado ? "textSecondary" : "textPrimary"}
            mb="2px"
            sx={{ transition: "color 300ms" }}
          >
            {etiqueta}
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            {paso.completado ? "Listo" : descripcion}
          </Typography>
        </Box>

        {inerte ? null : (
          <Box
            className="flecha"
            sx={{
              display: "inline-flex",
              color: "text.secondary",
              transition: "transform 200ms",
            }}
          >
            <IconChevronRight size={18} />
          </Box>
        )}
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
