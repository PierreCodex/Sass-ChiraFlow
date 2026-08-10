import axios, { AxiosError } from "axios";
import { env } from "@/config/env";

/**
 * Cliente HTTP único contra la API de Laravel.
 *
 * Está configurado para Sanctum en modo SPA (cookies):
 *  - withCredentials: true  -> envía la cookie de sesión
 *  - withXSRFToken: true    -> reenvía el header X-XSRF-TOKEN que Laravel espera
 *
 * Si en su lugar usas tokens Bearer, borra esas dos opciones y descomenta
 * el bloque del interceptor de request marcado como "TOKEN BEARER".
 */
export const api = axios.create({
  baseURL: env.apiUrl,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// --- TOKEN BEARER (alternativa a cookies) ---------------------------------
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

/**
 * Sanctum exige pedir la cookie CSRF antes del primer POST (login, register…).
 * Llamar una vez desde el formulario de login.
 */
export async function fetchCsrfCookie() {
  await axios.get(`${env.apiRoot}/sanctum/csrf-cookie`, {
    withCredentials: true,
  });
}

/** Forma del error de validación 422 de Laravel. */
export interface LaravelValidationError {
  message: string;
  errors: Record<string, string[]>;
}

export interface ApiError {
  status: number;
  message: string;
  /** Errores por campo, listos para pasar a react-hook-form. */
  errors?: Record<string, string[]>;
}

/** Normaliza cualquier error de axios a una forma predecible. */
export function toApiError(error: unknown): ApiError {
  const axiosError = error as AxiosError<Partial<LaravelValidationError>>;

  if (axiosError.response) {
    return {
      status: axiosError.response.status,
      message:
        axiosError.response.data?.message ?? "Ocurrió un error inesperado.",
      errors: axiosError.response.data?.errors,
    };
  }

  return {
    status: 0,
    message: "No se pudo conectar con el servidor.",
  };
}

// Sesión expirada -> de vuelta al login.
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const onAuthPage =
      typeof window !== "undefined" &&
      ["/login", "/register", "/forgot-password"].includes(
        window.location.pathname
      );

    if (status === 401 && !onAuthPage && typeof window !== "undefined") {
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);
