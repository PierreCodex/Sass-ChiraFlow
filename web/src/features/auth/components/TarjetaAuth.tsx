import type { ReactNode } from "react";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

import Logo from "@/layout/shared/logo/Logo";

/**
 * La tarjeta centrada de la plantilla (variante `auth2`), que es la que usan
 * login y recuperación. El registro usa la variante "side" porque sus seis
 * campos no caben aquí; estas pantallas son cortas y encajan.
 */
const TarjetaAuth = ({ children }: { children: ReactNode }) => (
  <Box
    sx={{
      position: "relative",
      "&:before": {
        content: '""',
        background: "radial-gradient(#d2f1df, #d3d7fa, #bad8f4)",
        backgroundSize: "400% 400%",
        animation: "gradient 15s ease infinite",
        position: "absolute",
        height: "100%",
        width: "100%",
        opacity: "0.3",
      },
    }}
  >
    <Grid container spacing={0} justifyContent="center" sx={{ height: "100vh" }}>
      <Grid
        display="flex"
        justifyContent="center"
        alignItems="center"
        size={{ xs: 12, sm: 12, lg: 5, xl: 4 }}
      >
        <Card
          elevation={9}
          sx={{ p: 4, zIndex: 1, width: "100%", maxWidth: "450px" }}
        >
          <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
            <Logo />
          </Box>
          {children}
        </Card>
      </Grid>
    </Grid>
  </Box>
);

export default TarjetaAuth;
