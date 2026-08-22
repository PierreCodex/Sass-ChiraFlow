import { Suspense } from "react";

import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";

import PageContainer from "@/components/container/PageContainer";
import ResetPasswordForm from "@/features/auth/components/ResetPasswordForm";
import TarjetaAuth from "@/features/auth/components/TarjetaAuth";

/**
 * Destino del enlace del correo de recuperación
 * (`/reset-password?token=…&email=…`). Pública, como la verificación.
 */
export default function ResetPasswordPage() {
  return (
    <PageContainer
      title="Nueva contraseña"
      description="Elige una contraseña nueva para tu cuenta"
    >
      <TarjetaAuth>
        <Suspense
          fallback={
            <Stack alignItems="center" py={3}>
              <CircularProgress />
            </Stack>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </TarjetaAuth>
    </PageContainer>
  );
}
