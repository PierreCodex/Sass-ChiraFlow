"use client";
import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";

import { toApiError } from "@/lib/api/client";
import { useResumenSuperadmin } from "../hooks/useSuperadmin";
import NegocioListaCard from "./NegocioListaCard";

const NegociosRecientes = () => {
  const { data, isPending, isError, error } = useResumenSuperadmin();

  if (isPending) return <Skeleton variant="rounded" height={340} />;
  if (isError) return <Alert severity="error">{toApiError(error).message}</Alert>;

  return (
    <NegocioListaCard
      titulo="Negocios recientes"
      negocios={data.recientes}
      subtitulo={(n) => `${n.plan ?? "Sin plan"} · ${n.estado}`}
      textoVacio="Todavía no hay negocios registrados."
    />
  );
};

export default NegociosRecientes;
