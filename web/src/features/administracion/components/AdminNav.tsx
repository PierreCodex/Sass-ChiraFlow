"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { alpha } from "@mui/material/styles";
import { IconChevronDown } from "@tabler/icons-react";

import { GRUPOS_ADMIN, rutaDeSeccion } from "../nav";

/**
 * El índice de Administración: un grupo por bloque de ajustes, desplegable.
 *
 * Los grupos de una sola sección no se despliegan —serían un clic de más—:
 * van como fila normal, igual que en la referencia.
 */
export default function AdminNav({ onNavegar }: { onNavegar?: () => void }) {
  const pathname = usePathname();
  const grupoActivo = GRUPOS_ADMIN.find((g) =>
    pathname.startsWith(`/administracion/${g.slug}`),
  );
  // Abierto por defecto: el grupo de la sección que se está viendo.
  const [abiertos, setAbiertos] = useState<string[]>(
    grupoActivo ? [grupoActivo.slug] : [],
  );

  const alternar = (slug: string) =>
    setAbiertos((previos) =>
      previos.includes(slug)
        ? previos.filter((s) => s !== slug)
        : [...previos, slug],
    );

  return (
    <List sx={{ p: 2 }} component="nav" aria-label="Secciones de administración">
      {GRUPOS_ADMIN.map((grupo) => {
        const Icono = grupo.icono;
        const unaSola = grupo.secciones.length === 1;
        const abierto = abiertos.includes(grupo.slug);
        const hrefDirecto = unaSola
          ? rutaDeSeccion(grupo.slug, grupo.secciones[0].slug)
          : undefined;
        const activoDirecto = hrefDirecto === pathname;

        return (
          <Box key={grupo.slug}>
            <ListItemButton
              {...(hrefDirecto
                ? { component: Link, href: hrefDirecto, onClick: onNavegar }
                : { onClick: () => alternar(grupo.slug) })}
              selected={activoDirecto}
              sx={estiloFila}
            >
              <ListItemIcon sx={{ minWidth: 34, color: "inherit" }}>
                <Icono size={19} stroke={1.5} />
              </ListItemIcon>
              <ListItemText
                primary={grupo.titulo}
                slotProps={{
                  primary: { variant: "body2", fontWeight: 500 },
                }}
              />
              {unaSola ? null : (
                <IconChevronDown
                  size={16}
                  stroke={1.5}
                  style={{
                    flexShrink: 0,
                    transition: "transform .2s",
                    transform: abierto ? "rotate(180deg)" : "none",
                  }}
                />
              )}
            </ListItemButton>

            {unaSola ? null : (
              <Collapse in={abierto} timeout="auto" unmountOnExit>
                <List disablePadding>
                  {grupo.secciones.map((seccion) => {
                    const href = rutaDeSeccion(grupo.slug, seccion.slug);
                    return (
                      <ListItemButton
                        key={seccion.slug}
                        component={Link}
                        href={href}
                        selected={pathname === href}
                        onClick={onNavegar}
                        sx={{ ...estiloFila, pl: 5.5 }}
                      >
                        <ListItemText
                          primary={seccion.titulo}
                          slotProps={{
                            primary: { variant: "body2" },
                          }}
                        />
                      </ListItemButton>
                    );
                  })}
                </List>
              </Collapse>
            )}
          </Box>
        );
      })}
    </List>
  );
}

/*
  Seleccionado en relleno suave, no en `primary.light`: en modo oscuro esa
  variante de la paleta de Modernize no se invierte y el texto encima queda
  ilegible (está anotado en CLAUDE.md).
*/
const estiloFila = {
  borderRadius: 1,
  mb: 0.25,
  py: 0.9,
  color: "text.secondary",
  "&:hover": { bgcolor: "action.hover" },
  "&.Mui-selected": {
    bgcolor: (t: any) => alpha(t.palette.primary.main, 0.12),
    color: "primary.main",
    fontWeight: 600,
    "&:hover": {
      bgcolor: (t: any) => alpha(t.palette.primary.main, 0.16),
    },
  },
};
