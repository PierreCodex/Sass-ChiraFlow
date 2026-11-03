"use client";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { IconBuildingStore, IconShieldCheck } from "@tabler/icons-react";

import BlankCard from "@/components/shared/BlankCard";
import { useUsuarioActual } from "@/features/auth/hooks/useAuth";
import { inicialesDe } from "@/features/auth/types";
import { useNombreDelRol } from "@/features/capacidades/hooks/useCapacidades";

/** Identidad y rol informativo; las capacidades del servidor deciden el acceso. */
const TarjetaCuenta = () => {
  const { data: usuario, isPending } = useUsuarioActual();
  // El rol del NEGOCIO (Story 1.11), no el central.
  const rol = useNombreDelRol();

  if (isPending) return <Skeleton variant="rounded" height={280} />;
  if (!usuario) return null;

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
            label={rol}
            color="primary"
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Stack>

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
