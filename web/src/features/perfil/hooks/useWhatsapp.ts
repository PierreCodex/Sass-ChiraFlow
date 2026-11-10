import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAvisos } from "@/context/avisos";
import { whatsappApi } from "../services/whatsapp.api";

export const whatsappKeys = { actual: ["perfil", "whatsapp"] as const };

/**
 * Mientras está pendiente se vuelve a pedir cada 5 s: la persona manda el
 * código desde su celular y la tarjeta pasa sola a «Activo», sin recargar.
 */
export function useWhatsappEquipo() {
  return useQuery({
    queryKey: whatsappKeys.actual,
    queryFn: whatsappApi.ver,
    refetchInterval: (query) => (query.state.data?.estado === "pendiente" ? 5000 : false),
  });
}

export function useGuardarWhatsapp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: whatsappApi.guardar,
    onSuccess: (registro) => queryClient.setQueryData(whatsappKeys.actual, registro),
  });
}

export function useQuitarWhatsapp() {
  const queryClient = useQueryClient();
  const { avisar } = useAvisos();
  return useMutation({
    mutationFn: whatsappApi.quitar,
    onSuccess: () => {
      queryClient.setQueryData(whatsappKeys.actual, null);
      avisar("Ya no recibirás avisos por WhatsApp.");
    },
  });
}
