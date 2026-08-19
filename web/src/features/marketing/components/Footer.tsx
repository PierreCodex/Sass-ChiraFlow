"use client";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import Link from "next/link";

import { env } from "@/config/env";

/** Mismas 3 columnas + redes + barra inferior que el footer real, con enlaces propios del SaaS. */
const footerLinks = [
  {
    id: 1,
    children: [
      { title: true, titleText: "Producto" },
      { title: false, titleText: "Características", link: "/inicio#caracteristicas" },
      { title: false, titleText: "Precios", link: "/inicio#planes" },
      { title: false, titleText: "Preguntas frecuentes", link: "/inicio#faq" },
    ],
  },
  {
    id: 2,
    children: [
      { title: true, titleText: "Cuenta" },
      { title: false, titleText: "Iniciar sesión", link: "/login" },
      { title: false, titleText: "Crear cuenta", link: "/register" },
      { title: false, titleText: "Mi Plan", link: "/mi-plan" },
    ],
  },
  {
    id: 3,
    children: [
      { title: true, titleText: "Soporte" },
      { title: false, titleText: "Centro de soporte", link: "/soporte" },
      { title: false, titleText: "Contacto", link: "/inicio#faq" },
    ],
  },
];

const Footer = () => (
  <Container maxWidth="lg" sx={{ pt: { xs: "30px", lg: "60px" } }}>
    <Grid container spacing={3} justifyContent="space-between" mb={7}>
      {footerLinks.map((columna) => (
        <Grid key={columna.id} size={{ xs: 6, sm: 4, lg: 3 }}>
          {columna.children.map((item) =>
            item.title ? (
              <Typography key={item.titleText} fontSize="17px" fontWeight={600} mb="22px">
                {item.titleText}
              </Typography>
            ) : (
              <Link key={item.titleText} href={item.link!}>
                <Typography
                  sx={{
                    display: "block",
                    padding: "10px 0",
                    fontSize: "15px",
                    color: (theme) => theme.palette.text.primary,
                    "&:hover": { color: (theme) => theme.palette.primary.main },
                  }}
                  component="span"
                >
                  {item.titleText}
                </Typography>
              </Link>
            )
          )}
        </Grid>
      ))}

      <Grid size={{ xs: 6, sm: 6, lg: 3 }}>
        <Typography fontSize="17px" fontWeight={600} mb="22px">
          Síguenos
        </Typography>
        <Stack direction="row" gap="20px">
          <Tooltip title="Facebook">
            <Link href="#">
              <Image src="/images/frontend-pages/icons/icon-facebook.svg" alt="Facebook" width={22} height={22} />
            </Link>
          </Tooltip>
          <Tooltip title="Instagram">
            <Link href="#">
              <Image src="/images/frontend-pages/icons/icon-instagram.svg" alt="Instagram" width={22} height={22} />
            </Link>
          </Tooltip>
          <Tooltip title="Twitter">
            <Link href="#">
              <Image src="/images/frontend-pages/icons/icon-twitter.svg" alt="Twitter" width={22} height={22} />
            </Link>
          </Tooltip>
        </Stack>
      </Grid>
    </Grid>

    <Divider />

    <Box py="40px" flexWrap="wrap" display="flex" justifyContent="space-between">
      <Stack direction="row" gap={1} alignItems="center">
        <Image src="/images/logos/logoIcon.svg" width={20} height={20} alt="logo" />
        <Typography variant="body1" fontSize="15px">
          © {new Date().getFullYear()} {env.appName}. Todos los derechos reservados.
        </Typography>
      </Stack>
    </Box>
  </Container>
);

export default Footer;
