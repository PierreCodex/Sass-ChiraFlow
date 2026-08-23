"use client";
import { useContext } from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { IconPower } from "@tabler/icons-react";

import { CustomizerContext } from "@/context/customizerContext";
import { useLogout, useUsuarioActual } from "@/features/auth/hooks/useAuth";
import { etiquetaRol, inicialesDe } from "@/features/auth/types";

/**
 * Tarjeta del usuario al pie del sidebar.
 *
 * Como el menú del header: enseña a quien ha entrado y **cierra sesión de
 * verdad**. El botón de la plantilla era un `<Link href="/login">`, que dejaba
 * el token vivo en Laravel y la cookie puesta.
 */
export const Profile = () => {
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));
  const { isSidebarHover, isCollapse } = useContext(CustomizerContext);
  const hideMenu = lgUp ? isCollapse == "mini-sidebar" && !isSidebarHover : "";

  const { data: usuario, isPending } = useUsuarioActual();
  const logout = useLogout();

  const nombre = usuario?.name ?? "";
  // Solo el nombre de pila: en 200 px de sidebar, "María de los Ángeles
  // Quispe Rojas" no cabe de ninguna manera.
  const nombreCorto = nombre.split(/\s+/)[0] ?? "";

  return (
    <Box
      display={"flex"}
      alignItems="center"
      gap={2}
      sx={{ m: 3, p: 2, bgcolor: `${"secondary.light"}` }}
    >
      {!hideMenu ? (
        <>
          {isPending ? (
            <Skeleton variant="circular" width={40} height={40} />
          ) : (
            <Avatar
              src={usuario?.avatar_url ?? undefined}
              alt={nombre}
              sx={{ height: 40, width: 40, fontSize: 15, fontWeight: 600 }}
            >
              {inicialesDe(nombre)}
            </Avatar>
          )}

          <Box minWidth={0}>
            <Typography variant="h6" noWrap>
              {isPending ? <Skeleton width={70} /> : nombreCorto}
            </Typography>
            <Typography variant="caption" noWrap>
              {isPending ? <Skeleton width={50} /> : etiquetaRol(usuario?.rol)}
            </Typography>
          </Box>

          <Box sx={{ ml: "auto" }}>
            <Tooltip title="Cerrar sesión" placement="top">
              <span>
                <IconButton
                  color="primary"
                  onClick={() => logout.mutate()}
                  disabled={logout.isPending}
                  aria-label="Cerrar sesión"
                  size="small"
                >
                  <IconPower size="20" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </>
      ) : (
        ""
      )}
    </Box>
  );
};
