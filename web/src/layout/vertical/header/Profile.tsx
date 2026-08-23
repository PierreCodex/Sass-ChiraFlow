"use client";
import React, { useState } from "react";
import Link from "next/link";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import {
  IconHeadset,
  IconMail,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";

import { useLogout, useUsuarioActual } from "@/features/auth/hooks/useAuth";
import { etiquetaRol, inicialesDe } from "@/features/auth/types";

/** Los tres destinos que existen de verdad en el panel. */
const ENLACES = [
  {
    href: "/configuracion/perfil",
    titulo: "Mi perfil",
    subtitulo: "Tus datos y tu contraseña",
    Icono: IconUser,
  },
  {
    href: "/configuracion",
    titulo: "Configuración",
    subtitulo: "Los ajustes de tu negocio",
    Icono: IconSettings,
  },
  {
    href: "/soporte",
    titulo: "Soporte",
    subtitulo: "Escríbenos si algo falla",
    Icono: IconHeadset,
  },
];

/**
 * Menú del usuario. Muestra a **quien ha iniciado sesión**, no al usuario de
 * la plantilla.
 *
 * El "Logout" de la plantilla era un `<Link href="/login">`: sacaba al usuario
 * de la pantalla pero dejaba **el token vivo en la base de datos y la cookie
 * puesta**. Aquí llama a `POST /api/auth/logout`, que revoca ese token en
 * Laravel y borra la cookie.
 */
const Profile = () => {
  const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
  const { data: usuario, isPending } = useUsuarioActual();
  const logout = useLogout();

  const handleClick2 = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const nombre = usuario?.name ?? "";
  const avatar = (
    <Avatar
      src={usuario?.avatar_url ?? undefined}
      alt={nombre}
      sx={{ width: 35, height: 35, fontSize: 14, fontWeight: 600 }}
    >
      {inicialesDe(nombre)}
    </Avatar>
  );

  return (
    <Box>
      <IconButton
        size="large"
        aria-label="Abrir el menú de tu cuenta"
        color="inherit"
        aria-controls="menu-usuario"
        aria-haspopup="true"
        sx={{
          ...(typeof anchorEl2 === "object" &&
            anchorEl2 !== null && { color: "primary.main" }),
        }}
        onClick={handleClick2}
      >
        {isPending ? (
          <Skeleton variant="circular" width={35} height={35} />
        ) : (
          avatar
        )}
      </IconButton>

      <Menu
        id="menu-usuario"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        sx={{ "& .MuiMenu-paper": { width: 320, p: 2 } }}
      >
        <Stack direction="row" px={1} py={1} spacing={2} alignItems="center">
          <Avatar
            src={usuario?.avatar_url ?? undefined}
            alt={nombre}
            sx={{ width: 56, height: 56, fontSize: 20, fontWeight: 600 }}
          >
            {inicialesDe(nombre)}
          </Avatar>
          <Box minWidth={0}>
            <Typography variant="subtitle2" color="textPrimary" fontWeight={600} noWrap>
              {nombre || "—"}
            </Typography>
            {usuario?.rol ? (
              <Typography variant="subtitle2" color="textSecondary">
                {etiquetaRol(usuario.rol)}
                {usuario.negocio?.nombre ? ` · ${usuario.negocio.nombre}` : ""}
              </Typography>
            ) : null}
            <Stack direction="row" spacing={1} alignItems="center" minWidth={0}>
              <IconMail width={15} height={15} style={{ flexShrink: 0 }} />
              {/* Con elipsis: un correo largo partido en dos líneas descuadra
                  la ficha entera. El completo queda en el `title`. */}
              <Typography
                variant="subtitle2"
                color="textSecondary"
                noWrap
                title={usuario?.email ?? ""}
              >
                {usuario?.email ?? ""}
              </Typography>
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ my: 1 }} />

        {ENLACES.map(({ href, titulo, subtitulo, Icono }) => (
          <MenuItem
            key={href}
            component={Link}
            href={href}
            onClick={handleClose2}
            sx={{ borderRadius: 1, py: 1.25 }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  display: "grid",
                  placeItems: "center",
                  color: "primary.main",
                  // alpha y no `primary.light`: ese tono no se invierte en
                  // modo oscuro (trampa de CLAUDE.md).
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                  flexShrink: 0,
                }}
              >
                <Icono size={19} stroke={1.6} />
              </Box>
              <Box minWidth={0}>
                <Typography variant="subtitle2" fontWeight={600} color="textPrimary">
                  {titulo}
                </Typography>
                <Typography variant="subtitle2" color="textSecondary" noWrap>
                  {subtitulo}
                </Typography>
              </Box>
            </Stack>
          </MenuItem>
        ))}

        <Box mt={2}>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            {logout.isPending ? "Saliendo…" : "Cerrar sesión"}
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Profile;
