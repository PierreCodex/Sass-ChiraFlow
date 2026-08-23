import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authKeys } from "@/features/auth/hooks/useAuth";
import { perfilApi } from "../services/perfil.api";

/**
 * Al guardar, el usuario nuevo entra directo en la caché: el avatar del header
 * y la tarjeta del sidebar salen de ahí y cambian sin recargar.
 */
export function useActualizarPerfil() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: perfilApi.actualizar,
    onSuccess: (usuario) => {
      queryClient.setQueryData(authKeys.usuario, usuario);
    },
  });
}

export function useCambiarPassword() {
  return useMutation({ mutationFn: perfilApi.cambiarPassword });
}
