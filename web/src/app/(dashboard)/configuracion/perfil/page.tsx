"use client";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";

import PageContainer from "@/components/container/PageContainer";
import EncabezadoPagina from "@/components/shared/EncabezadoPagina";
import CambiarPassword from "@/features/perfil/components/CambiarPassword";
import DatosPersonales from "@/features/perfil/components/DatosPersonales";
import TarjetaCuenta from "@/features/perfil/components/TarjetaCuenta";

export default function PerfilPage() {
  return (
    <PageContainer title="Mi perfil" description="Los datos de tu cuenta">
      <EncabezadoPagina
        titulo="Mi perfil"
        descripcion="Tus datos y tu contraseña. Los del negocio están en Configuración."
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7, lg: 8 }}>
          <Stack spacing={3}>
            <DatosPersonales />
            <CambiarPassword />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 5, lg: 4 }}>
          <TarjetaCuenta />
        </Grid>
      </Grid>
    </PageContainer>
  );
}
