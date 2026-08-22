import { Suspense } from "react";

import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";

import PageContainer from "@/components/container/PageContainer";
import TarjetaAuth from "@/features/auth/components/TarjetaAuth";
import VerificacionCorreo from "@/features/auth/components/VerificacionCorreo";

/**
 * Destino del enlace del correo de verificación. **Pública**: el registro no
 * abre sesión, así que aquí no hay cookie ni guard que valgan.
 *
 * El `Suspense` no es decorativo: `useSearchParams` suspende el árbol cliente
 * durante el prerender y sin él la build falla.
 */
export default function VerificarCorreoPage() {
  return (
    <PageContainer
      title="Verificar correo"
      description="Confirma tu correo para activar tu cuenta"
    >
      <TarjetaAuth>
        <Suspense
          fallback={
            <Stack alignItems="center" py={3}>
              <CircularProgress />
            </Stack>
          }
        >
          <VerificacionCorreo />
        </Suspense>
      </TarjetaAuth>
    </PageContainer>
  );
}
