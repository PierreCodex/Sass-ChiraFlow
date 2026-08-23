"use client";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { IconBuildingStore, IconShieldCheck } from "@tabler/icons-react";

import BlankCard from "@/components/shared/BlankCard";
import { useUsuarioActual } from "@/features/auth/hooks/useAuth";
import { etiquetaRol, inicialesDe } from "@/features/auth/types";

import { permisosDelRol } from "../types";

/**
 * Quién eres y qué puedes hacer.
 *
 * El rol no se edita desde aquí —nadie se asciende a sí mismo— pero saberlo
 * evita la pregunta de soporte más repetida: "¿por qué no me deja entrar a
 * X?". Los permisos se explican en una línea, en vez de dejar la etiqueta
 * suelta.
 */
const TarjetaCuenta = () => {
  const { data: usuario, isPending } = useUsuarioActual();

  if (isPending) return <Skeleton variant="rounded" height={280} />;

  return (
    <BlankCard>
      <Box p={3}>
        <Stack spacing={2} alignItems="center" textAlign="center">
          <Avatar
            src={usuario?.avatar_url ?? undefined}
            alt={usuario?.name ?? ""}
            sx={{ width: 88, height: 88, fontSize: 30, fontWeight: 600 }}
          >
            {inicialesDe(usuario?.name)}
          </Avatar>

          <Box>
            <Typography variant="h6" fontWeight={600}>
              {usuario?.name ?? "—"}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {usuario?.email ?? ""}
            </Typography>
          </Box>

          <Chip
            icon={<IconShieldCheck size={16} />}
            label={etiquetaRol(usuario?.rol)}
            color="primary"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Stack>

        {permisosDelRol(usuario?.rol) ? (
          <Box
            sx={(theme) => ({
              mt: 3,
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.06),
            })}
          >
            <Typography variant="body2" color="textSecondary">
              {permisosDelRol(usuario?.rol)}
            </Typography>
          </Box>
        ) : null}

        {usuario?.negocio?.nombre ? (
          <>
            <Divider sx={{ my: 3 }} />
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ display: "flex", color: "text.secondary" }}>
                <IconBuildingStore size={20} />
              </Box>
              <Box minWidth={0}>
                <Typography variant="body2" color="textSecondary">
                  Tu negocio
                </Typography>
                <Typography variant="subtitle2" fontWeight={600} noWrap>
                  {usuario.negocio.nombre}
                </Typography>
              </Box>
            </Stack>
          </>
        ) : null}
      </Box>
    </BlankCard>
  );
};

export default TarjetaCuenta;
