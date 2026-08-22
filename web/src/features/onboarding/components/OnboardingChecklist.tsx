"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { IconCheck, IconChecklist, IconChevronRight, IconX } from "@tabler/icons-react";

import Scrollbar from "@/components/custom-scroll/Scrollbar";
import { useUsuarioActual } from "@/features/auth/hooks/useAuth";
import { env } from "@/config/env";

import { useMarcarPaso, useOnboarding } from "../hooks/useOnboarding";
import { contarCompletados, describirPaso, type PasoOnboarding } from "../types";
import NombreNegocioDialog from "./NombreNegocioDialog";

/** Se abre solo la primera vez; después el usuario decide. */
const CLAVE_VISTO = "mi-saas:onboarding-visto";

interface FilaProps {
  paso: PasoOnboarding;
  indice: number;
  onIr: () => void;
  deshabilitado?: boolean;
  pista?: string;
}

/**
 * Fila de tarea. Copia el patrón de `widgets/cards/UpcomingActivity` de la
 * plantilla: avatar redondeado con el color de fondo claro, título y
 * subtítulo. Las hechas se atenúan en vez de tacharse (el tachado se lee mal
 * en una lista).
 */
const FilaPaso = ({ paso, indice, onIr, deshabilitado, pista }: FilaProps) => {
  const { etiqueta, descripcion } = describirPaso(paso.clave);
  const inerte = paso.completado || deshabilitado;

  const fila = (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      onClick={inerte ? undefined : onIr}
      sx={{
        px: 3,
        py: 2,
        cursor: inerte ? "default" : "pointer",
        opacity: deshabilitado ? 0.5 : 1,
        "&:hover": inerte ? undefined : { bgcolor: "action.hover" },
      }}
    >
      <Avatar
        variant="rounded"
        sx={{
          width: 40,
          height: 40,
          bgcolor: paso.completado ? "success.light" : "primary.light",
          color: paso.completado ? "success.main" : "primary.main",
        }}
      >
        {paso.completado ? <IconCheck size={20} /> : indice + 1}
      </Avatar>

      <Box flexGrow={1} minWidth={0}>
        <Typography
          variant="h6"
          mb="2px"
          color={paso.completado ? "textSecondary" : "textPrimary"}
        >
          {etiqueta}
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          {paso.completado ? "Listo" : descripcion}
        </Typography>
      </Box>

      {inerte ? null : <IconChevronRight size={18} />}
    </Stack>
  );

  return pista ? (
    <Tooltip title={pista} placement="left">
      <span>{fila}</span>
    </Tooltip>
  ) : (
    fila
  );
};

/**
 * Checklist de entrada: icono con badge en el header que abre un panel
 * lateral, igual que el carrito de la plantilla
 * (`layout/vertical/header/Cart.tsx`). No usa un Fab porque esa esquina ya es
 * del Customizer.
 *
 * No bloquea nada: el usuario tiene su panel completo desde el primer login.
 */
const OnboardingChecklist = () => {
  const { data: onboarding } = useOnboarding();
  const { data: usuario } = useUsuarioActual();
  const marcar = useMarcarPaso();

  const [abierto, setAbierto] = useState(false);
  const [dialogoNombre, setDialogoNombre] = useState(false);

  const completados = onboarding ? contarCompletados(onboarding) : 0;
  const total = onboarding?.pasos.length ?? 0;
  const pendientes = total - completados;
  const visible = Boolean(onboarding) && !onboarding?.completado;

  useEffect(() => {
    if (!visible) return;
    try {
      if (localStorage.getItem(CLAVE_VISTO)) return;
      localStorage.setItem(CLAVE_VISTO, "1");
      setAbierto(true);
    } catch {
      // Modo incógnito o almacenamiento bloqueado: que no se abra solo es
      // preferible a romper el panel.
    }
  }, [visible]);

  if (!visible || !onboarding) return null;

  const slug = usuario?.negocio?.slug ?? null;

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
          }}
        >
          <Badge color="primary" badgeContent={pendientes}>
            <IconChecklist size="21" stroke="1.5" />
          </Badge>
        </IconButton>
      </Tooltip>

      <Drawer
        anchor="right"
        open={abierto}
        onClose={() => setAbierto(false)}
        slotProps={{ paper: { sx: { width: 360, maxWidth: "100%" } } }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          p={3}
          pb={2}
        >
          <Typography variant="h5" fontWeight={600}>
            Configura tu negocio
          </Typography>
          <IconButton
            onClick={() => setAbierto(false)}
            sx={{ color: (theme) => theme.palette.grey.A200 }}
            aria-label="Cerrar"
          >
            <IconX size="1rem" />
          </IconButton>
        </Stack>

        <Box px={3} pb={2}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            mb={1}
          >
            <Typography variant="subtitle2" color="textSecondary">
              Ya llevas buen camino
            </Typography>
            <Chip
              label={`${completados} de ${total}`}
              color="primary"
              size="small"
            />
          </Stack>
          <LinearProgress
            variant="determinate"
            value={total ? (completados / total) * 100 : 0}
            color="primary"
          />
        </Box>

        <Divider />

        <Scrollbar sx={{ height: "calc(100vh - 210px)" }}>
          {onboarding.pasos.map((paso, indice) => {
            const sinTienda = paso.clave === "sitio_publico" && !slug;
            return (
              <FilaPaso
                key={paso.clave}
                paso={paso}
                indice={indice}
                onIr={() => irA(paso)}
                deshabilitado={sinTienda}
                pista={
                  sinTienda ? "Primero ponle nombre a tu negocio" : undefined
                }
              />
            );
          })}
        </Scrollbar>

        <NombreNegocioDialog
          abierto={dialogoNombre}
          onCerrar={() => setDialogoNombre(false)}
        />
      </Drawer>
    </Box>
  );
};

export default OnboardingChecklist;
