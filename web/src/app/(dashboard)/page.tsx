"use client";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";

import PageContainer from "@/components/container/PageContainer";
import StatsCards from "@/features/dashboard/components/StatsCards";
import VentasChart from "@/features/dashboard/components/VentasChart";
import CitasDeHoy from "@/features/dashboard/components/CitasDeHoy";
import EnlaceTiendaDashboard from "@/features/dashboard/components/EnlaceTiendaDashboard";

export default function DashboardPage() {
  return (
    <PageContainer title="Dashboard" description="Resumen del día">
      <Box mt={3}>
        <Stack spacing={3}>
          {/*
            Lo primero de la pantalla: el enlace que el negocio reparte a sus
            clientes. Es lo que más se busca y antes no estaba en ningún sitio
            del panel.
          */}
          <EnlaceTiendaDashboard />

          <StatsCards />

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 7 }}>
              <VentasChart />
            </Grid>
            <Grid size={{ xs: 12, lg: 5 }}>
              <CitasDeHoy />
            </Grid>
          </Grid>
        </Stack>
      </Box>
    </PageContainer>
  );
}
