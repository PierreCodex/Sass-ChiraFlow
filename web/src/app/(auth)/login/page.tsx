'use client'
import Link from 'next/link';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// components
import Logo from '@/layout/shared/logo/Logo';
import PageContainer from '@/components/container/PageContainer';
import AuthLogin from '@/features/auth/components/AuthLogin';

export default function Login2() {

  return (
    <PageContainer
      title="Iniciar sesión"
      description="Entra al panel de tu negocio"
    >
      <Box
        sx={{
          position: 'relative',
          '&:before': {
            content: '""',
            background: 'radial-gradient(#d2f1df, #d3d7fa, #bad8f4)',
            backgroundSize: '400% 400%',
            animation: 'gradient 15s ease infinite',
            position: 'absolute',
            height: '100%',
            width: '100%',
            opacity: '0.3',
          },
        }}
      >
        <Grid container spacing={0} justifyContent="center" sx={{ height: '100vh' }}>
          <Grid
            display="flex"
            justifyContent="center"
            alignItems="center"
            size={{
              xs: 12,
              sm: 12,
              lg: 5,
              xl: 4
            }}>
            <Card elevation={9} sx={{ p: 4, zIndex: 1, width: '100%', maxWidth: '450px' }}>
              <Box display="flex" alignItems="center" justifyContent="center">
                <Logo />
              </Box>
              <AuthLogin
                subtitle={
                  <Stack direction="row" spacing={1} justifyContent="center" mt={3}>
                    <Typography color="textSecondary" variant="h6" fontWeight="500">
                      ¿Aún no tienes cuenta?
                    </Typography>
                    <Typography
                      component={Link}
                      href="/register"
                      fontWeight="500"
                      sx={{
                        textDecoration: 'none',
                        color: 'primary.main',
                      }}
                    >
                      Crea la de tu negocio
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
};

