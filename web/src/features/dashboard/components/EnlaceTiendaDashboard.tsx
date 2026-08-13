"use client";
import Skeleton from "@mui/material/Skeleton";

import EnlaceTienda from "@/features/configuracion/components/EnlaceTienda";
import { useConfiguracion } from "@/features/configuracion/hooks/useConfiguracion";

/**
 * Enlace a la tienda pública, en el dashboard.
 *
 * El componente vive en Configuración porque el `slug` es del negocio; aquí
 * solo se le pasan los datos. Si falla la carga no se pinta nada: el
 * dashboard no puede romperse por esto.
 */
const EnlaceTiendaDashboard = () => {
  const { data, isPending, isError } = useConfiguracion();

  if (isPending) return <Skeleton variant="rounded" height={116} />;
  if (isError || !data) return null;

  return <EnlaceTienda slug={data.slug} nombreNegocio={data.nombre} />;
};

export default EnlaceTiendaDashboard;
