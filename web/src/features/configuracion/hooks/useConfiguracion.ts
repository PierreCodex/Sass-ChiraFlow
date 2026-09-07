import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAvisos } from "@/context/avisos";
import { configuracionApi } from "../services/configuracion.api";
import type { ConfiguracionPayload } from "../types";

export const configuracionKeys = {
  all: ["configuracion"] as const,
};

/** Opciones comunes: una sola consulta para todo el que la necesite. */
const consulta = {
  queryKey: configuracionKeys.all,
  queryFn: configuracionApi.obtener,
  // Cambia muy poco y la consulta el formulario de citas en cada apertura.
  staleTime: 10 * 60 * 1000,
};

/**
 * El negocio **y** la lista de zonas horarias, que viajan juntos en el GET.
 *
 * Solo lo necesita la sección que pinta el select de zona. El resto usa
 * `useNegocio()`.
 */
export function useConfiguracion() {
  return useQuery(consulta);
}

/**
 * Solo el negocio.
 *
 * Comparte `queryKey` con el anterior, así que las 419 zonas se descargan una
 * vez y quien no las necesita ni las ve. Existe para que el calendario, las
 * citas y el enlace de la tienda no tengan que saber que ese GET trae dos
 * cosas.
 */
export function useNegocio() {
  return useQuery({ ...consulta, select: (r) => r.configuracion });
}

/**
 * Guarda un parche: solo lo que se le pasa.
 *
 * El aviso se da aquí y no en cada sección porque todas guardan igual. No usa
 * `crearHooksRecurso` porque esto no es un recurso REST —no hay listado, ni
 * id, ni alta ni baja—: es un único objeto que solo se lee y se actualiza.
 */
export function useGuardarConfiguracion() {
  const queryClient = useQueryClient();
  const { avisar } = useAvisos();

  return useMutation({
    mutationFn: (payload: ConfiguracionPayload) =>
      configuracionApi.guardar(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configuracionKeys.all });
      avisar("Cambios guardados correctamente");
    },
  });
}
