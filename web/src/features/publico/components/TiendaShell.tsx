"use client";
import React from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ThemeProvider, createTheme, type Theme } from "@mui/material/styles";

interface Props {
  nombre: string;
  /** Color de marca del local. Si viene, tiñe el primario de la tienda. */
  color?: string | null;
  logoUrl?: string | null;
  subtitulo?: string;
  /** Portada a pantalla completa. Sustituye a la cabecera de marca. */
  portada?: React.ReactNode;
  /** Oculta la barra de marca: la usa quien ya trae `portada`. */
  compacto?: boolean;
  children: React.ReactNode;
}

/** Iniciales del negocio para el avatar cuando no hay logo. */
function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .filter((parte) => parte.length > 2)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}

/**
 * Marco de la tienda: cabecera con la marca del negocio y pie legal.
 *
 * El `color` del local sobrescribe `primary` sobre el tema de la plantilla,
 * así cada negocio se ve suyo sin que haya que mantener un tema aparte:
 * botones, chips y estados heredan su color solos.
 */
const TiendaShell = ({
  nombre,
  color,
  logoUrl,
  subtitulo,
  portada,
  compacto = false,
  children,
}: Props) => {
  const conMarca = (outer: Theme) =>
    color
      ? createTheme(outer, {
          palette: {
            primary: {
              main: color,
              // Los tonos claro/oscuro los deriva MUI del main.
            },
          },
        })
      : outer;

  return (
    <ThemeProvider theme={conMarca}>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "grey.100",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {portada ?? null}

        {!compacto ? (
          <Box
            component="header"
            sx={{
              bgcolor: "background.paper",
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Container maxWidth="lg">
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ py: 2 }}
              >
                <Avatar
                  src={logoUrl ?? undefined}
                  sx={{ bgcolor: "primary.main", width: 44, height: 44 }}
                >
                  {iniciales(nombre)}
                </Avatar>
                <Box minWidth={0}>
                  <Typography variant="h5" fontWeight={700} noWrap>
                    {nombre}
                  </Typography>
                  {subtitulo ? (
                    <Typography variant="body2" color="textSecondary" noWrap>
                      {subtitulo}
                    </Typography>
                  ) : null}
                </Box>
              </Stack>
            </Container>
          </Box>
        ) : null}

        <Box component="main" flex={1}>
          {children}
        </Box>

        <Box
          component="footer"
          sx={{
            py: 3,
            textAlign: "center",
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="caption" color="textSecondary">
            Reservas gestionadas con {process.env.NEXT_PUBLIC_APP_NAME ?? "Mi SaaS"}
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default TiendaShell;
