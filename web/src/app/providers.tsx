"use client";
import React, { useContext } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { QueryClientProvider } from "@tanstack/react-query";

import RTL from "@/layout/shared/customizer/RTL";
import { ThemeSettings } from "@/utils/theme/Theme";
import { CustomizerContext } from "@/context/customizerContext";
import { getQueryClient } from "@/lib/query-client";
import { AvisosProvider } from "@/context/avisos";
import "@/utils/i18n";

/**
 * Todos los providers de cliente de la app.
 * El orden importa: emotion cache -> theme -> RTL -> data layer -> avisos.
 * Los avisos van dentro del tema (usan Alert) y por fuera de las pantallas,
 * para que cualquiera pueda pedir uno.
 */
const Providers = ({ children }: { children: React.ReactNode }) => {
  const theme = ThemeSettings();
  const { activeDir } = useContext(CustomizerContext);
  const queryClient = getQueryClient();

  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={theme}>
        <RTL direction={activeDir}>
          <CssBaseline />
          <QueryClientProvider client={queryClient}>
            <AvisosProvider>{children}</AvisosProvider>
          </QueryClientProvider>
        </RTL>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
};

export default Providers;
