"use client";
import { useEffect, useState } from "react";

import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { IconChecklist, IconConfetti, IconX } from "@tabler/icons-react";

import Scrollbar from "@/components/custom-scroll/Scrollbar";
import { useUsuarioActual } from "@/features/auth/hooks/useAuth";
import { env } from "@/config/env";

import { useMarcarPaso, useOnboarding } from "../hooks/useOnboarding";
import { contarCompletados, describirPaso, type PasoOnboarding } from "../types";
import AnilloProgreso from "./AnilloProgreso";
import FilaPaso from "./FilaPaso";
import NombreNegocioDialog from "./NombreNegocioDialog";

/** Se abre solo la primera vez; después el usuario decide. */
const CLAVE_VISTO = "mi-saas:onboarding-visto";

/** El texto acompaña el avance en vez de repetir siempre lo mismo. */
function animar(completados: number, total: number) {
  if (completados === 0) return "Empecemos por lo primero";
  if (completados >= total - 1) return "Te falta uno, ya está";
  if (completados >= total / 2) return "Vas más de la mitad";
  return "Buen comienzo";
}

const OnboardingChecklist = () => {
  const { data: onboarding } = useOnboarding();
  const { data: usuario } = useUsuarioActual();
  const marcar = useMarcarPaso();

  const [abierto, setAbierto] = useState(false);
  const [dialogoNombre, setDialogoNombre] = useState(false);

  const completados = onboarding ? contarCompletados(onboarding) : 0;
  const total = onboarding?.pasos.length ?? 0;
  const pendientes = total - completados;
  const terminado = Boolean(onboarding?.completado);

  // Terminado deja de anunciarse en el header, pero si el panel está abierto se
  // queda para dar la enhorabuena: desaparecer de golpe no cierra nada.
  const visible = Boolean(onboarding) && (!terminado || abierto);

  useEffect(() => {
    if (!onboarding || terminado) return;
    try {
      if (localStorage.getItem(CLAVE_VISTO)) return;
      localStorage.setItem(CLAVE_VISTO, "1");
      setAbierto(true);
    } catch {
      // Modo incógnito o almacenamiento bloqueado: que no se abra solo es
      // preferible a romper el panel.
    }
  }, [onboarding, terminado]);

  if (!visible || !onboarding) return null;

  const slug = usuario?.negocio?.slug ?? null;
  const indiceSiguiente = onboarding.pasos.findIndex((p) => !p.completado);

  const irA = (paso: PasoOnboarding) => {
    if (paso.clave === "nombre_negocio") {
      setDialogoNombre(true);
      return;
    }

    if (paso.clave === "sitio_publico") {
      if (!slug) return;
      const url = env.appDomain
        ? `https://${slug}.${env.appDomain}`
        : `/reservar/${slug}`;
      window.open(url, "_blank", "noopener");
      marcar.mutate(paso.clave);
      return;
    }

    const { href } = describirPaso(paso.clave);
    if (href) window.location.assign(href);
  };

  return (
    <Box>
      {terminado ? null : (
        <Tooltip title="Configura tu negocio">
          <IconButton
            size="large"
            color="inherit"
            onClick={() => setAbierto(true)}
            aria-label={`Configura tu negocio, ${pendientes} tareas pendientes`}
            sx={{
              color: abierto ? "primary.main" : "text.secondary",
              // En movil la barra va justa de sitio.
              p: { xs: 0.75, sm: 1.5 },
              "& .MuiBadge-badge": {
                // Latido lento: recuerda que hay algo pendiente sin dar la lata.
                animation: "latido 2.4s ease-in-out infinite",
              },
              "@keyframes latido": {
                "0%, 70%, 100%": { transform: "scale(1)" },
                "80%": { transform: "scale(1.18)" },
              },
              "@media (prefers-reduced-motion: reduce)": {
                "& .MuiBadge-badge": { animation: "none" },
              },
            }}
          >
            <Badge color="primary" badgeContent={pendientes}>
              <IconChecklist size="21" stroke="1.5" />
            </Badge>
          </IconButton>
        </Tooltip>
      )}

      <Drawer
        anchor="right"
        open={abierto}
        onClose={() => setAbierto(false)}
        slotProps={{ paper: { sx: { width: 380, maxWidth: "100%" } } }}
      >
        {/* Cabecera con degradado: es lo que separa el panel de una lista seca */}
        <Box
          sx={(theme) => ({
            position: "relative",
            px: 3,
            py: 3,
            color: "#fff",
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          })}
        >
          <IconButton
            onClick={() => setAbierto(false)}
            aria-label="Cerrar"
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              color: "rgba(255,255,255,0.8)",
              "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.12)" },
            }}
          >
            <IconX size="1rem" />
          </IconButton>

          <Stack direction="row" spacing={2.5} alignItems="center">
            <AnilloProgreso completados={completados} total={total} />
            <Box>
              <Typography variant="h5" fontWeight={700} color="#fff">
                {terminado ? "¡Todo listo!" : "Configura tu negocio"}
              </Typography>
              <Typography
                variant="subtitle2"
                sx={{ color: "rgba(255,255,255,0.85)" }}
              >
                {terminado
                  ? "Tu negocio ya puede recibir reservas"
                  : animar(completados, total)}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {terminado ? (
          <Stack
            spacing={2}
            alignItems="center"
            textAlign="center"
            px={4}
            py={6}
          >
            <Box
              sx={(theme) => ({
                width: 88,
                height: 88,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                color: "success.main",
                bgcolor: alpha(theme.palette.success.main, 0.14),
                animation: "celebrar 600ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                "@keyframes celebrar": {
                  "0%": { transform: "scale(0.4) rotate(-12deg)", opacity: 0 },
                  "100%": { transform: "scale(1) rotate(0)", opacity: 1 },
                },
              })}
            >
              <IconConfetti size={44} />
            </Box>
            <Typography variant="h5" fontWeight={700}>
              Completaste los {total} pasos
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Ya puedes compartir el enlace de tu tienda con tus clientes.
            </Typography>
            <Button variant="contained" onClick={() => setAbierto(false)}>
              Entendido
            </Button>
          </Stack>
        ) : (
          <Scrollbar sx={{ height: "calc(100vh - 136px)" }}>
            <Box py={1.5}>
              {onboarding.pasos.map((paso, indice) => {
                const sinTienda = paso.clave === "sitio_publico" && !slug;
                return (
                  <FilaPaso
                    key={paso.clave}
                    paso={paso}
                    indice={indice}
                    siguiente={indice === indiceSiguiente && !sinTienda}
                    onIr={() => irA(paso)}
                    deshabilitado={sinTienda}
                    pista={
                      sinTienda ? "Primero ponle nombre a tu negocio" : undefined
                    }
                  />
                );
              })}
            </Box>
          </Scrollbar>
        )}

        <NombreNegocioDialog
          abierto={dialogoNombre}
          onCerrar={() => setDialogoNombre(false)}
        />
      </Drawer>
    </Box>
  );
};

export default OnboardingChecklist;
