import { api } from "@/lib/api/client";
import type { ApiResource } from "@/lib/api/types";
import type { CategoriaNegocio, RangoProfesionales } from "../types";

export interface Usuario {
  id: number;
  /** `nombre + apellido`, ya compuesto, para pintar. */
  name: string;
  /** Sueltos, que es como se editan en Mi perfil. */
  nombre?: string;
  apellido?: string | null;
  email: string;
  telefono?: string | null;
  /** DNI del titular. Opcional. */
  documento?: string | null;
  avatar_url: string | null;
  rol: string | null;
  /**
   * Tenant al que pertenece el usuario (el negocio/clínica).
   *
   * `nombre` y `slug` son null hasta que el paso 1 del onboarding los fija;
   * el `slug` es lo que permite construir el enlace de la tienda.
   */
  negocio: { id: string; nombre: string | null; slug?: string | null } | null;
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

/** Parámetros firmados que el correo de verificación pone en la URL. */
export interface VerificarEmailParams {
  id: string;
  hash: string;
  expires: string;
  signature: string;
}

export interface ResetPasswordPayload {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

/**
 * Misma forma que el reset, y aun así un tipo aparte: el destino es otro.
 *
 * A quien se da de alta en el panel no se le escribe la contraseña —la cuenta
 * nace con una aleatoria que no conoce nadie— y le llega una invitación con
 * enlace de 7 días. Detrás hay un **broker distinto** del de recuperación, con
 * su propia tabla y su propia caducidad: canjear este token en
 * `/reset-password` no funciona, y al revés tampoco.
 */
export type AceptarInvitacionPayload = ResetPasswordPayload;

/** Respuesta de los endpoints que solo traen un mensaje. */
export interface RespuestaMensaje {
  message: string;
}

/**
 * El reenvío trae siempre el `retry_after` en segundos: en el 200 para armar
 * la cuenta atrás del botón y en el 429 para corregirla. Nunca hardcodear 60.
 */
export interface RespuestaReenvio extends RespuestaMensaje {
  retry_after: number;
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

  /**
   * Verifica el correo con los cuatro parámetros firmados del enlace, tal
   * como llegaron: `expires` es un timestamp Unix y `signature` un HMAC, así
   * que tocar cualquiera de los dos invalida la firma.
   *
   * Es idempotente: recargar la página vuelve a devolver 200.
   */
  verificarEmail: async (params: VerificarEmailParams) => {
    const { data } = await api.post<RespuestaMensaje>(
      "/email/verificar",
      params
    );
    return data;
  },

  /**
   * Reenvía el correo de verificación. Responde **200 exista o no el email**:
   * no sirve para saber si una cuenta está registrada.
   */
  reenviarVerificacion: async (email: string) => {
    const { data } = await api.post<RespuestaReenvio>("/email/reenviar", {
      email,
    });
    return data;
  },

  /** Fija la contraseña nueva con el token del correo de recuperación. */
  resetPassword: async (payload: ResetPasswordPayload) => {
    const { data } = await api.post<RespuestaMensaje>(
      "/reset-password",
      payload
    );
    return data;
  },

  /**
   * El invitado elige su contraseña y su cuenta queda usable.
   *
   * Ojo con la ruta: **`/invitacion/aceptar`, no `/reset-password`**. Son
   * brokers distintos con caducidades distintas (7 días aquí, 60 minutos
   * allá), así que cruzarlos devuelve «la invitación no es válida» sobre un
   * token que sí lo era.
   *
   * De paso deja el correo verificado: llegar hasta aquí exige haber abierto
   * un enlace enviado a esa dirección, que es justo lo que la verificación
   * demuestra.
   */
  aceptarInvitacion: async (payload: AceptarInvitacionPayload) => {
    const { data } = await api.post<RespuestaMensaje>(
      "/invitacion/aceptar",
      payload
    );
    return data;
  },

  logout: async () => {
    await api.post("/auth/logout");
  },

  /** Usuario autenticado actual. Devuelve 401 si no hay sesión. */
  me: async () => {
    const { data } = await api.get<ApiResource<Usuario>>("/user");
    return data.data;
  },

  /** Pide el enlace de recuperación. 200 exista o no la cuenta. */
  forgotPassword: async (email: string) => {
    const { data } = await api.post<RespuestaMensaje>("/forgot-password", {
      email,
    });
    return data;
  },
};
