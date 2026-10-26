"use client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Link from "next/link";

import Logo from "@/layout/shared/logo/Logo";
import { NavLinks } from "./Navigations";

const MobileSidebar = () => (
  <>
    <Box px={3} py={2}>
      <Logo href="/inicio" />
    </Box>
    <Box p={3}>
      <Stack direction="column" spacing={2}>
        {NavLinks.map((navlink) => (
          <Button
            key={navlink.href}
            color="inherit"
            href={navlink.href}
            sx={{ justifyContent: "start" }}
          >
            {navlink.title}
          </Button>
        ))}
        <Button component={Link} color="inherit" href="/login" sx={{ justifyContent: "start" }}>
          Iniciar sesión
        </Button>
        <Button component={Link} color="primary" variant="contained" href="/register">
          Prueba gratis
        </Button>
      </Stack>
    </Box>
  </>
);

export default MobileSidebar;
