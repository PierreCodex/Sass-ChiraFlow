"use client";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { styled, useTheme } from "@mui/material/styles";
import { useContext } from "react";

import Header from "@/layout/vertical/header/Header";
import Sidebar from "@/layout/vertical/sidebar/Sidebar";
import Customizer from "@/layout/shared/customizer/Customizer";
import { CustomizerContext } from "@/context/customizerContext";
import config from "@/context/config";
import { superadminMenuItems } from "@/layout/superadmin/menuItems";

const MainWrapper = styled("div")(() => ({
  display: "flex",
  minHeight: "100vh",
  width: "100%",
}));

const PageWrapper = styled("div")(() => ({
  display: "flex",
  flexGrow: 1,
  paddingBottom: "60px",
  flexDirection: "column",
  zIndex: 1,
  width: "100%",
  backgroundColor: "transparent",
}));

/**
 * Layout del panel superadmin: mismos componentes reales de Modernize que usa
 * `app/(dashboard)/layout.tsx` (Sidebar, Header, Customizer) — solo cambia el
 * menú y a dónde apunta el logo. Nada de sidebar/topbar inventados a mano:
 * así se ve igual al resto de la app, con su propio tema claro/oscuro.
 */
export default function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapse } = useContext(CustomizerContext);
  const MiniSidebarWidth = config.miniSidebarWidth;
  const theme = useTheme();

  return (
    <MainWrapper>
      <Sidebar items={superadminMenuItems} logoHref="/superadmin" />

      <PageWrapper
        className="page-wrapper"
        sx={{
          ...(isCollapse === "mini-sidebar" && {
            [theme.breakpoints.up("lg")]: {
              ml: `${MiniSidebarWidth}px`,
            },
          }),
        }}
      >
        <Header />

        <Container sx={{ maxWidth: "100%!important" }}>
          <Box sx={{ minHeight: "calc(100vh - 170px)" }}>{children}</Box>
        </Container>
        <Customizer />
      </PageWrapper>
    </MainWrapper>
  );
}
