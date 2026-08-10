"use client";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";

import PageContainer from "@/components/container/PageContainer";
import StatsCards from "@/features/dashboard/components/StatsCards";
import VentasChart from "@/features/dashboard/components/VentasChart";
import CitasDeHoy from "@/features/dashboard/components/CitasDeHoy";

export default function DashboardPage() {
  return (
    <PageContainer title="Dashboard" description="Resumen del día">
      <Box mt={3}>
        <StatsCards />

        <Grid container spacing={3} mt={0}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <VentasChart />
          </Grid>
          <Grid size={{ xs: 12, lg: 5 }}>
            <CitasDeHoy />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}
