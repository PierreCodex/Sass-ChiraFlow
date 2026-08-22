import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authKeys } from "@/features/auth/hooks/useAuth";
import { onboardingApi } from "../services/onboarding.api";

export const onboardingKeys = {
  estado: ["onboarding"] as const,
};

/**
 * Estado del checklist. `retry: false` porque en las pantallas sin sesión no
 * hay nada que reintentar, y el interceptor de axios ya se encarga del 401.
 */
export function useOnboarding() {
  return useQuery({
    queryKey: onboardingKeys.estado,
    queryFn: onboardingApi.obtener,
    retry: false,
    // Los pasos 2-5 los marca el backend como efecto lateral de otros
    // endpoints, así que el estado se releé al volver a la pestaña.
    refetchOnWindowFocus: true,
  });
}

export function useFijarNombre() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: onboardingApi.fijarNombre,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: onboardingKeys.estado });
      // El nombre del negocio viaja dentro del usuario (`usuario.negocio`),
      // que es de donde lo lee el panel.
      queryClient.invalidateQueries({ queryKey: authKeys.usuario });
    },
  });
}

export function useMarcarPaso() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: onboardingApi.marcarPaso,
    onSuccess: (onboarding) => {
      queryClient.setQueryData(onboardingKeys.estado, onboarding);
    },
  });
}
