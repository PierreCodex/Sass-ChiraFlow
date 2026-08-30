"use client";
import { useState } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { IconArrowLeft, IconMenu2 } from "@tabler/icons-react";

import AdminNav from "@/features/administracion/components/AdminNav";
import { env } from "@/config/env";

const ANCHO_NAV = 280;

/**
 * La vista de Administración.
 *
 * Es un caparazón aparte del panel —sin el sidebar del día a día y sin su
 * header—: una barra con "Volver", el índice a la izquierda y el panel de la
 * sección a la derecha.
 *
 * El modo claro/oscuro y la paleta **no se deciden aquí**: cuelgan del
 * `CustomizerContext` del layout raíz, el mismo que usa el panel. Si entras en
 * claro, esto se ve en claro; si el panel está en oscuro, esto también.
 */
export default function AdministracionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [navMovil, setNavMovil] = useState(false);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{
          height: 64,
          flexShrink: 0,
          px: { xs: 2, md: 3 },
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <IconButton
          sx={{ display: { xs: "inline-flex", md: "none" } }}
          aria-label="Abrir el índice de administración"
          onClick={() => setNavMovil(true)}
          size="small"
        >
          <IconMenu2 size={20} />
        </IconButton>

        <Button
          component={Link}
          href="/"
          variant="outlined"
          color="inherit"
          size="small"
          startIcon={<IconArrowLeft size={16} />}
          sx={{ borderColor: "divider", color: "text.primary", flexShrink: 0 }}
        >
          Volver
        </Button>

        <Typography variant="h6" fontWeight={600} noWrap>
          {env.appName}{" "}
          <Box
            component="span"
            sx={{ fontWeight: 400, color: "text.secondary" }}
          >
            administración
          </Box>
        </Typography>
      </Stack>

      <Box sx={{ display: "flex", flexGrow: 1, minHeight: 0 }}>
        <Box
          component="aside"
          sx={{
            display: { xs: "none", md: "block" },
            width: ANCHO_NAV,
            flexShrink: 0,
            borderRight: "1px solid",
            borderColor: "divider",
            bgcolor: (t: any) =>
              t.palette.mode === "dark"
                ? alpha(t.palette.grey[100], 0.35)
                : t.palette.grey[100],
          }}
        >
          <AdminNav />
        </Box>

        <Drawer
          anchor="left"
          open={navMovil}
          onClose={() => setNavMovil(false)}
          slotProps={{ paper: { sx: { width: ANCHO_NAV } } }}
        >
          <AdminNav onNavegar={() => setNavMovil(false)} />
        </Drawer>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minWidth: 0,
            p: { xs: 3, md: 4 },
            bgcolor: "background.paper",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
