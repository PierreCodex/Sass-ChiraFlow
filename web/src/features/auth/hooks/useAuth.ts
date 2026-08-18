import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi, type RegisterPayload } from "../services/auth.api";

export const authKeys = {
  usuario: ["auth", "usuario"] as const,
};

/**
 * Usuario autenticado. Devuelve `undefined` mientras carga y lanza error si
 * no hay sesión (el interceptor de axios ya redirige al login en un 401).
 */
export function useUsuarioActual() {
  return useQuery({
    queryKey: authKeys.usuario,
    queryFn: authApi.me,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

/** Registra el negocio en prueba + su dueño, e inicia sesión (como `registroPrueba` en Laravel). */
export function useRegistrarNegocio() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (usuario) => {
      queryClient.setQueryData(authKeys.usuario, usuario);
      router.push("/");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      // Limpiar la caché para que el siguiente usuario no vea datos del anterior.
      queryClient.clear();
      router.push("/login");
    },
  });
}
