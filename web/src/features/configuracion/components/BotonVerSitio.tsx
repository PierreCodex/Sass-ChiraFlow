"use client";
import Button from "@mui/material/Button";
import { IconExternalLink } from "@tabler/icons-react";

import { useConfiguracion } from "../hooks/useConfiguracion";
import { urlTienda } from "./EnlaceTienda";

/**
 * Atajo a la tienda desde la cabecera de Configuración.
 *
 * El bloque completo del enlace —copiar, compartir por WhatsApp— vive en la
 * pestaña "Sitio público"; aquí solo queda el gesto más frecuente: ir a verla.
 *
 * Usa el mismo `useConfiguracion` que el formulario, así que no dispara una
 * segunda petición: React Query ya tiene la respuesta en caché.
 */
const BotonVerSitio = () => {
  const { data: configuracion } = useConfiguracion();

  if (!configuracion?.slug) return null;

  return (
    <Button
      variant="outlined"
      startIcon={<IconExternalLink size={18} />}
      href={urlTienda(configuracion.slug)}
      target="_blank"
      rel="noopener noreferrer"
      sx={{ whiteSpace: "nowrap" }}
    >
      Ver mi sitio
    </Button>
  );
};

export default BotonVerSitio;
