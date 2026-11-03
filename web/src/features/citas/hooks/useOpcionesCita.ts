import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { citasKeys } from "./useCitas";
import { opcionesCitaApi } from "../services/opciones.api";
import type { ColeccionOpciones, FiltroOpciones } from "../opciones";

/**
 * Una colección de opciones del formulario de citas, pedida al servidor
 * (Story 1.10). Cuelga de `citasKeys.all` porque es parte de citas.
 */
export function useOpcionesCita<C extends ColeccionOpciones>(
  coleccion: C,
  filtro: FiltroOpciones = {},
  activo = true
) {
  // Sin ids que buscar no se pide nada: una lista de ids vacía no es «todos».
  const conIds = filtro.ids !== undefined;
  const habilitado = activo && (!conIds || filtro.ids!.length > 0);

  return useQuery({
    queryKey: [...citasKeys.all, "opciones", coleccion, filtro.search ?? "", filtro.ids ?? null],
    queryFn: () => opcionesCitaApi.coleccion(coleccion, filtro),
    enabled: habilitado,
    staleTime: 60 * 1000,
    // Mientras llega la búsqueda nueva se sigue viendo la anterior, en vez
    // de vaciar el desplegable a cada tecla.
    placeholderData: keepPreviousData,
  });
}

/** El texto tal cual, pero solo cuando se deja de escribir un momento. */
export function useConRetardo(valor: string, ms = 300): string {
  const [retardado, setRetardado] = useState(valor);

  useEffect(() => {
    const t = setTimeout(() => setRetardado(valor), ms);
    return () => clearTimeout(t);
  }, [valor, ms]);

  return retardado;
}
