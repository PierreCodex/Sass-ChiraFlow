import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";

import PageContainer from "@/components/container/PageContainer";
import Breadcrumb from "@/layout/shared/breadcrumb/Breadcrumb";
import StatsCards from "@/features/superadmin/components/StatsCards";
import IngresosPlataformaChart from "@/features/superadmin/components/IngresosPlataformaChart";
import NegociosNuevosChart from "@/features/superadmin/components/NegociosNuevosChart";
import NegociosRecientes from "@/features/superadmin/components/NegociosRecientes";
import SuscripcionesPorVencer from "@/features/superadmin/components/SuscripcionesPorVencer";

const BCrumb = [{ title: "Dashboard" }];

export default function SuperadminDashboardPage() {
  return (
    <PageContainer title="Super Admin" description="Dashboard de la plataforma">
      <Breadcrumb title="Dashboard" subtitle="Resumen de toda la plataforma" items={BCrumb} />
      <Stack spacing={3}>
        <StatsCards />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <IngresosPlataformaChart />
          </Grid>
          <Grid size={{ xs: 12, lg: 5 }}>
            <NegociosNuevosChart />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <NegociosRecientes />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <SuscripcionesPorVencer />
          </Grid>
        </Grid>
      </Stack>
    </PageContainer>
  );
}
