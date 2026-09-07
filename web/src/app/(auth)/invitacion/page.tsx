import { Suspense } from "react";

import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";

import PageContainer from "@/components/container/PageContainer";
import AceptarInvitacionForm from "@/features/auth/components/AceptarInvitacionForm";
import TarjetaAuth from "@/features/auth/components/TarjetaAuth";

/**
 * Destino del enlace del correo de invitación
 * (`/invitacion?token=…&email=…`). Pública, como el reset y la verificación:
 * quien llega aquí todavía no puede iniciar sesión — es justo lo que viene a
 * arreglar—, así que el guardia de `middleware.ts` la deja pasar.
 */
export default function InvitacionPage() {
  return (
    <PageContainer
      title="Crea tu contraseña"
      description="Elige la contraseña con la que entrarás al panel"
    >
      <TarjetaAuth>
        <Suspense
          fallback={
            <Stack alignItems="center" py={3}>
              <CircularProgress />
            </Stack>
          }
        >
          <AceptarInvitacionForm />
        </Suspense>
      </TarjetaAuth>
    </PageContainer>
  );
}
