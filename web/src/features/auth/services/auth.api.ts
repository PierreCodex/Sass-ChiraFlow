import { api, fetchCsrfCookie } from "@/lib/api/client";
import { env } from "@/config/env";
import { delay } from "@/lib/mock-utils";
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

/**
 * Mismos campos que valida `Publico\HomeController@registroPrueba` en
 * Laravel: crea el negocio en modo "prueba" y a su dueño en un solo paso.
 */
export interface RegisterPayload {
  categoria_id: number;
  categoria_otro_detalle?: string;
  cantidad_profesionales: number;
  nombre_negocio: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  documento: string;
  usuario: string;
  password: string;
  terminos: boolean;
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

  register: async (payload: RegisterPayload): Promise<Usuario> => {
    if (env.usarMocks) {
      await delay(600);
      // Equivalente a `Auth::login($user)` + redirect al dashboard: en mock
      // no hay sesión real, solo se resuelve para que el form redirija.
      return {
        id: 1,
        name: `${payload.nombre} ${payload.apellido}`,
        email: payload.email,
        avatar_url: null,
        rol: "dueno",
        negocio: { id: 1, nombre: payload.nombre_negocio },
      };
    }
    await fetchCsrfCookie();
    const { data } = await api.post<ApiResource<Usuario>>(
      "/registro-prueba",
      payload
    );
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
