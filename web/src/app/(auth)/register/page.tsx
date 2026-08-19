'use client'
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Image from 'next/image';
import Link from 'next/link';
import Logo from '@/layout/shared/logo/Logo';
import PageContainer from '@/components/container/PageContainer';
import AuthRegister from '@/features/auth/components/AuthRegister';
import { env } from '@/config/env';

/**
 * Variante "side" de la plantilla (auth1): ilustración a la izquierda y el
 * formulario a la derecha. Se eligió sobre la tarjeta centrada (auth2) porque
 * este formulario tiene seis campos y no cabe en una tarjeta de 100vh.
 */
export default function Register() {
  return (
    <PageContainer
      title="Crear cuenta"
      description="Crea la cuenta de tu negocio y prueba la plataforma gratis"
    >
      <Grid container spacing={0} justifyContent="center" sx={{ overflowX: 'hidden' }}>
        <Grid
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
          size={{
            xs: 12,
            sm: 12,
            lg: 7,
            xl: 8
          }}>
          <Box position="relative">
            <Box px={3}>
              <Logo />
            </Box>
            <Box
              alignItems="center"
              justifyContent="center"
              height={'calc(100vh - 75px)'}
              sx={{
                display: {
                  xs: 'none',
                  lg: 'flex',
                },
              }}
            >
              <Image
                src={'/images/backgrounds/login-bg.svg'}
                alt="bg"
                width={500}
                height={500}
                style={{
                  width: '100%',
                  maxWidth: '500px',
                  maxHeight: '500px',
                }}
              />
            </Box>
          </Box>
        </Grid>
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
          <Box p={4}>
            <AuthRegister
              title={`¡Simplifica tu vida con ${env.appName}!`}
              subtext={
                <Typography variant="subtitle1" color="textSecondary" mb={2}>
                  Prueba nuestra plataforma gratis por 7 días
                </Typography>
              }
              subtitle={
                <Stack direction="row" spacing={1} mt={3}>
                  <Typography color="textSecondary" variant="h6" fontWeight="400">
                    ¿Ya tienes una cuenta?
                  </Typography>
                  <Typography
                    component={Link}
                    href="/login"
                    fontWeight="500"
                    sx={{
                      textDecoration: 'none',
                      color: 'primary.main',
                    }}
                  >
                    Inicia sesión aquí
                  </Typography>
                </Stack>
              }
            />
          </Box>
        </Grid>
      </Grid>
    </PageContainer>
  );
};
