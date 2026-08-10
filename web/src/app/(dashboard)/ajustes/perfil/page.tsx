"use client";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

import PageContainer from "@/components/container/PageContainer";
import Breadcrumb from "@/layout/shared/breadcrumb/Breadcrumb";
import DashboardCard from "@/components/shared/DashboardCard";
import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";

const BCrumb = [
  { to: "/", title: "Inicio" },
  { to: "/ajustes", title: "Ajustes" },
  { title: "Mi perfil" },
];

export default function PerfilPage() {
  return (
    <PageContainer title="Mi perfil" description="Datos de tu cuenta">
      <Breadcrumb title="Mi perfil" items={BCrumb} />
      <DashboardCard title="Datos personales">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="nombre">Nombre</CustomFormLabel>
            <CustomTextField id="nombre" variant="outlined" fullWidth />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <CustomFormLabel htmlFor="email">Email</CustomFormLabel>
            <CustomTextField id="email" variant="outlined" fullWidth />
          </Grid>
          <Grid size={12}>
            <Stack direction="row" spacing={2} mt={2}>
              <Button variant="contained">Guardar cambios</Button>
              <Button variant="text" color="error">
                Cancelar
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </DashboardCard>
    </PageContainer>
  );
}
