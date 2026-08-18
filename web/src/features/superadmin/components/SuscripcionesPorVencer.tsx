"use client";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";

import { toApiError } from "@/lib/api/client";
import { formatFecha } from "@/lib/format";
import { useResumenSuperadmin } from "../hooks/useSuperadmin";
import NegocioListaCard from "./NegocioListaCard";

const SuscripcionesPorVencer = () => {
  const { data, isPending, isError, error } = useResumenSuperadmin();

  if (isPending) return <Skeleton variant="rounded" height={340} />;
  if (isError) return <Alert severity="error">{toApiError(error).message}</Alert>;

  return (
    <NegocioListaCard
      titulo="Suscripciones por vencer"
      negocios={data.vencen_pronto}
      subtitulo={(n) =>
        n.suscripcion_vence_el ? `Vence ${formatFecha(n.suscripcion_vence_el)}` : ""
      }
      textoVacio="Ninguna suscripción vence esta semana."
    />
  );
};

export default SuscripcionesPorVencer;
