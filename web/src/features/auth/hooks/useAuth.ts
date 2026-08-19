import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../services/auth.api";

export const authKeys = {
  usuario: ["auth", "usuario"] as const,
  categoriasNegocio: ["auth", "categorias-negocio"] as const,
};

/**
 * Catálogo del select "Tipo de negocio". Es público y prácticamente estático:
 * se cachea toda la sesión para no repetirlo en cada render del registro.
 */
export function useCategoriasNegocio() {
  return useQuery({
    queryKey: authKeys.categoriasNegocio,
    queryFn: authApi.categoriasNegocio,
    staleTime: Infinity,
  });
}

export function useRegistro() {
  return useMutation({ mutationFn: authApi.register });
}

export function useReenviarVerificacion() {
  return useMutation({ mutationFn: authApi.reenviarVerificacion });
}

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
