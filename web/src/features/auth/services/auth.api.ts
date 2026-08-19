import { api } from "@/lib/api/client";
import type { ApiResource } from "@/lib/api/types";
import type { CategoriaNegocio, RangoProfesionales } from "../types";

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
 * Payload cerrado del registro (contrato § Registro y onboarding).
 *
 * No pide el nombre del negocio: eso lo fija el paso 1 del onboarding. El
 * teléfono viaja ya normalizado (`+51987654321`) y `nombre`/`apellido` salen
 * de partir el campo único del formulario.
 */
export interface RegisterPayload {
  tipo_negocio_id: number;
  rango_profesionales: RangoProfesionales;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password: string;
  password_confirmation: string;
}

/**
 * Endpoints de autenticación.
 *
 * `login` y `logout` van contra el **BFF de Next** (`/api/auth/*`), que es
 * quien guarda y borra la cookie httpOnly con el token de Sanctum. El resto
 * atraviesa el proxy: el token lo pone el servidor, aquí no se toca.
 */
export const authApi = {
  login: async (payload: LoginPayload) => {
    const { data } = await api.post<ApiResource<Usuario>>(
      "/auth/login",
      payload
    );
    return data.data;
  },

  /**
   * Alta de cuenta. Va directo a Laravel por el proxy y **no abre sesión**:
   * como no pasa por `/api/auth/*`, no hay cookie que escribir. Tras el alta
   * el usuario tiene que verificar su correo y después entrar por el login.
   */
  register: async (payload: RegisterPayload) => {
    const { data } = await api.post<ApiResource<Usuario>>("/register", payload);
    return data.data;
  },

  /** Alimenta el select "¿Qué tipo de negocio tienes?". Sin sesión. */
  categoriasNegocio: async () => {
    const { data } = await api.get<ApiResource<CategoriaNegocio[]>>(
      "/publico/categorias-negocio"
    );
    return data.data;
  },

  /** Reenvía el correo de verificación. Responde 200 exista o no el email. */
  reenviarVerificacion: async (email: string) => {
    await api.post("/email/reenviar", { email });
  },

  logout: async () => {
    await api.post("/auth/logout");
  },

  /** Usuario autenticado actual. Devuelve 401 si no hay sesión. */
  me: async () => {
    const { data } = await api.get<ApiResource<Usuario>>("/user");
    return data.data;
  },

  forgotPassword: async (email: string) => {
    await api.post("/forgot-password", { email });
  },
};
