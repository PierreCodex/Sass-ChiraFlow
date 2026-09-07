"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";

import { useUsuarioActual } from "@/features/auth/hooks/useAuth";
import { useCapacidades } from "@/features/capacidades/hooks/useCapacidades";
import {
  GRUPOS_ADMIN,
  rutaDeSeccion,
  seccionesVisibles,
} from "@/features/administracion/nav";

/**
 * `/administracion` no tiene contenido propio: entra por la primera sección
 * **que le toque a quien mira**.
 *
 * Era una constante y ya no puede serlo: la primera del índice es «Datos del
 * negocio», que un profesional no ve, así que entraba directo a un aviso de
 * «no tienes acceso» con la barra lateral vacía. Ahora hay que esperar a las
 * capacidades para saber a dónde mandarlo, y por eso es cliente.
 */
export default function AdministracionPage() {
  const router = useRouter();
  const { data: sesion } = useUsuarioActual();
  const { data: capacidades, isPending } = useCapacidades();

  useEffect(() => {
    if (isPending) return;

    const quienMira = {
      esAdminGeneral: sesion?.rol === "admin_general",
      capacidades,
    };

    for (const grupo of GRUPOS_ADMIN) {
      const [primera] = seccionesVisibles(grupo, quienMira);
      if (primera) {
        router.replace(rutaDeSeccion(grupo.slug, primera.slug));
        return;
      }
    }

    // No le toca ninguna: el índice se encarga de decirlo.
    router.replace(rutaDeSeccion(GRUPOS_ADMIN[0].slug, GRUPOS_ADMIN[0].secciones[0].slug));
  }, [isPending, capacidades, sesion, router]);

  return (
    <Stack alignItems="center" py={6}>
      <CircularProgress />
    </Stack>
  );
}
