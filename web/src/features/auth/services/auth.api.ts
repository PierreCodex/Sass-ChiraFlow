import { api, fetchCsrfCookie } from "@/lib/api/client";
import type { ApiResource } from "@/lib/api/types";

export interface Usuario {
  id: number;
  name: string;
  email: string;
  avatar_url: string | null;
  rol: string | null;
  /** Tenant al que pertenece el usuario (el negocio/clínica). */
  negocio: { id: number; nombre: string } | null;
}

export interface LoginPayload {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

/**
 * Endpoints de autenticación contra Laravel + Sanctum (modo SPA / cookies).
 * Cada POST que abre sesión necesita primero la cookie CSRF.
 */
export const authApi = {
  login: async (payload: LoginPayload) => {
    await fetchCsrfCookie();
    const { data } = await api.post<ApiResource<Usuario>>("/login", payload);
    return data.data;
  },

  register: async (payload: RegisterPayload) => {
    await fetchCsrfCookie();
    const { data } = await api.post<ApiResource<Usuario>>("/register", payload);
    return data.data;
  },

  logout: async () => {
    await api.post("/logout");
  },

  /** Usuario autenticado actual. Devuelve 401 si no hay sesión. */
  me: async () => {
    const { data } = await api.get<ApiResource<Usuario>>("/user");
    return data.data;
  },

  forgotPassword: async (email: string) => {
    await fetchCsrfCookie();
    await api.post("/forgot-password", { email });
  },
};
