"use client";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import {
  IconBuildingStore,
  IconCash,
  IconLayoutDashboard,
  IconLogout,
  IconMenu2,
  IconPackages,
  IconShieldLock,
} from "@tabler/icons-react";

import { sesionPlataforma, type SesionPlataforma } from "../sesion";

const ANCHO = 250;

const MENU = [
  { href: "/plataforma", titulo: "Resumen", icono: IconLayoutDashboard },
  { href: "/plataforma/negocios", titulo: "Negocios", icono: IconBuildingStore },
  { href: "/plataforma/planes", titulo: "Planes", icono: IconPackages },
  { href: "/plataforma/pagos", titulo: "Pagos de suscripción", icono: IconCash },
];

/**
 * El marco del panel de plataforma: menú propio y sesión propia, sin nada del
 * panel de negocio (ni su sidebar, ni su cookie, ni `X-Tenant`).
 */
export default function ShellPlataforma({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sesion, setSesion] = useState<SesionPlataforma | null | undefined>(undefined);
  const [menuMovil, setMenuMovil] = useState(false);

  useEffect(() => {
    const actual = sesionPlataforma.leer();
    setSesion(actual);
    if (!actual) router.replace("/plataforma/login");
  }, [router]);

  useEffect(() => setMenuMovil(false), [pathname]);

  // Mientras se comprueba la sesión no se pinta nada: evita un parpadeo del
  // panel antes de mandar al login.
  if (!sesion) return null;

  const activo = (href: string) =>
    href === "/plataforma" ? pathname === href : pathname.startsWith(href);

  const menu = (
    <Box sx={{ p: 2 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ px: 1, py: 2 }}>
        <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36 }}>
          <IconShieldLock size={20} />
        </Avatar>
        <Box>
          <Typography fontWeight={700} lineHeight={1.2}>
            ChiraFlow
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Panel de plataforma
          </Typography>
        </Box>
      </Stack>
      <List>
        {MENU.map((item) => (
          <ListItemButton
            key={item.href}
            component={Link}
            href={item.href}
            selected={activo(item.href)}
            sx={{ borderRadius: 2, mb: 0.5 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <item.icono size={20} />
            </ListItemIcon>
            <ListItemText primary={item.titulo} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: ANCHO,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: ANCHO, boxSizing: "border-box" },
        }}
      >
        {menu}
      </Drawer>
      <Drawer
        variant="temporary"
        open={menuMovil}
        onClose={() => setMenuMovil(false)}
        sx={{ display: { md: "none" }, "& .MuiDrawer-paper": { width: ANCHO } }}
      >
        {menu}
      </Drawer>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Toolbar sx={{ gap: 1 }}>
            <IconButton
              sx={{ display: { md: "none" } }}
              onClick={() => setMenuMovil(true)}
              aria-label="Abrir menú"
            >
              <IconMenu2 size={20} />
            </IconButton>
            <Chip label="Prototipo · datos de prueba" color="warning" size="small" />
            <Box flexGrow={1} />
            <Typography variant="body2" sx={{ display: { xs: "none", sm: "block" } }}>
              {sesion.nombre}
            </Typography>
            <Button
              size="small"
              color="inherit"
              startIcon={<IconLogout size={18} />}
              onClick={() => {
                sesionPlataforma.cerrar();
                router.replace("/plataforma/login");
              }}
            >
              Salir
            </Button>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: "auto" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
