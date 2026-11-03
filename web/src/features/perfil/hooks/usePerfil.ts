import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authKeys } from "@/features/auth/hooks/useAuth";
import { useAvisos } from "@/context/avisos";
import { perfilApi } from "../services/perfil.api";

/**
 * Al guardar, el usuario nuevo entra directo en la caché: el avatar del header
 * y la tarjeta del sidebar salen de ahí y cambian sin recargar.
 */
export function useActualizarPerfil() {
  const queryClient = useQueryClient();
  const { avisar } = useAvisos();

  return useMutation({
    mutationFn: perfilApi.actualizar,
    onSuccess: async (usuario) => {
      // Un GET anterior al guardado no debe volver a poner datos obsoletos.
      await queryClient.cancelQueries({ queryKey: authKeys.usuario });
      queryClient.setQueryData(authKeys.usuario, usuario);
      void queryClient.invalidateQueries({ queryKey: ["profesionales"] });
      void queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      avisar("Datos guardados correctamente.");
    },
  });
}

export function useCambiarPassword() {
  const { avisar } = useAvisos();
  return useMutation({
    mutationFn: perfilApi.cambiarPassword,
    onSuccess: () => avisar("Contraseña actualizada correctamente."),
  });
}
