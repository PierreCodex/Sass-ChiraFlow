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
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { IconChevronDown } from "@tabler/icons-react";

import { useUsuarioActual } from "@/features/auth/hooks/useAuth";
import { useCapacidades } from "@/features/capacidades/hooks/useCapacidades";

import { GRUPOS_ADMIN, rutaDeSeccion, seccionesVisibles } from "../nav";

/**
 * El índice de Administración: un grupo por bloque de ajustes, desplegable.
 *
 * Los grupos de una sola sección no se despliegan —serían un clic de más—:
 * van como fila normal, igual que en la referencia.
 *
 * Algunas secciones son solo del dueño y no se le enseñan a los demás. Es
 * cortesía y no autorización: el backend responde 403 igual. Mientras la
 * sesión carga se ocultan, así que aparecen un instante después en vez de
 * parpadear al revés — que es el orden correcto: enseñar de menos y corregir,
 * nunca enseñar de más.
 */
export default function AdminNav({ onNavegar }: { onNavegar?: () => void }) {
  const pathname = usePathname();
  const { data: sesion } = useUsuarioActual();
  const { data: capacidades } = useCapacidades();
  const quienMira = { esAdminGeneral: sesion?.rol === "admin_general", capacidades };
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

  /*
    A quien no le toca ninguna seccion no se le deja una barra en blanco.

    Pasa de verdad: un profesional no administra nada del negocio, y hasta
    ahora aterrizaba en un panel vacio que parece un fallo de carga en vez de
    una respuesta. Se espera a que las capacidades lleguen para no decirlo
    durante el primer render.
  */
  const sinNada =
    !!capacidades &&
    GRUPOS_ADMIN.every((g) => seccionesVisibles(g, quienMira).length === 0);

  if (sinNada) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Nada que administrar
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tu rol no incluye ninguna sección de administración. Vuelve al panel
          con el botón de arriba.
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ p: 2 }} component="nav" aria-label="Secciones de administración">
      {GRUPOS_ADMIN.map((grupo) => {
        const Icono = grupo.icono;
        const secciones = seccionesVisibles(grupo, quienMira);

        // Un grupo sin secciones visibles no pinta una fila que no lleva a
        // ninguna parte.
        if (secciones.length === 0) return null;

        const unaSola = secciones.length === 1;
        const abierto = abiertos.includes(grupo.slug);
        const hrefDirecto = unaSola
          ? rutaDeSeccion(grupo.slug, secciones[0].slug)
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
                  {secciones.map((seccion) => {
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
