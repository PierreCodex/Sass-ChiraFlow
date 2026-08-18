"use client";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import Logo from "@/layout/shared/logo/Logo";
import PageContainer from "@/components/container/PageContainer";
import AuthRegister from "@/features/auth/components/AuthRegister";

export default function RegisterPage() {
  return (
    <PageContainer title="Crear cuenta" description="Prueba gratis por 10 días">
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
        <Grid container spacing={0} justifyContent="center" sx={{ minHeight: "100vh", py: 4 }}>
          <Grid
            display="flex"
            justifyContent="center"
            alignItems="center"
            size={{ xs: 12, sm: 12, lg: 7, xl: 5 }}
          >
            <Card elevation={9} sx={{ p: 4, zIndex: 1, width: "100%", maxWidth: "560px" }}>
              <Box display="flex" alignItems="center" justifyContent="center" mb={1}>
                <Logo href="/inicio" />
              </Box>
              <AuthRegister
                subtitle={
                  <Stack direction="row" spacing={1} mt={3} justifyContent="center">
                    <Typography color="textSecondary" variant="body1">
                      ¿Ya tienes una cuenta?
                    </Typography>
                    <Typography
                      component={Link}
                      href="/login"
                      fontWeight={600}
                      sx={{ textDecoration: "none", color: "primary.main" }}
                    >
                      Inicia sesión aquí
                    </Typography>
                  </Stack>
                }
              />
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}
