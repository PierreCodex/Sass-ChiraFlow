"use client";
import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import { styled } from "@mui/material/styles";
import { IconMenu2 } from "@tabler/icons-react";
import Link from "next/link";

import Logo from "@/layout/shared/logo/Logo";
import Navigations from "./Navigations";
import MobileSidebar from "./MobileSidebar";

/** Header real de la demo `frontend-pages/homepage`, adaptado: logo propio, links y CTA del SaaS. */
const HpHeader = () => {
  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    justifyContent: "center",
    [theme.breakpoints.up("lg")]: { minHeight: "100px" },
    backgroundColor: theme.palette.primary.light,
  }));

  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: "100%",
    paddingLeft: "0 !important",
    paddingRight: "0 !important",
    color: theme.palette.text.secondary,
    justifyContent: "space-between",
  }));

  const [open, setOpen] = useState(false);

  return (
    <AppBarStyled position="sticky" elevation={0}>
      <Container sx={{ maxWidth: "1400px !important" }}>
        <ToolbarStyled>
          <Logo href="/inicio" alto={56} />
          {/*
           * Móvil o escritorio lo decide el CSS, no `useMediaQuery`: este
           * vale `false` en el primer render, y hasta que el navegador
           * respondía la barra salía sin enlaces ni menú.
           */}
          <IconButton
            color="inherit"
            aria-label="menu"
            onClick={() => setOpen(true)}
            sx={{ display: { xs: "inline-flex", lg: "none" } }}
          >
            <IconMenu2 size={22} />
          </IconButton>
          <Stack spacing={1} direction="row" alignItems="center" sx={{ display: { xs: "none", lg: "flex" } }}>
            <Navigations />
          </Stack>
          <Stack direction="row" spacing={1.5} sx={{ display: { xs: "none", lg: "flex" } }}>
            <Button component={Link} color="inherit" href="/login">
              Iniciar sesión
            </Button>
            <Button component={Link} color="primary" variant="contained" href="/register">
              Prueba gratis
            </Button>
          </Stack>
        </ToolbarStyled>
      </Container>
      <Drawer
        anchor="left"
        open={open}
        variant="temporary"
        onClose={() => setOpen(false)}
        slotProps={{
          paper: { sx: { width: 270, border: "0 !important", boxShadow: (theme) => theme.shadows[8] } },
        }}
      >
        <MobileSidebar />
      </Drawer>
    </AppBarStyled>
  );
};

export default HpHeader;
