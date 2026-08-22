import axios, { AxiosError } from "axios";

/**
 * Cliente HTTP único. **No habla con Laravel: habla con el BFF de Next.**
 *
 * La base es relativa (`/api`), o sea el mismo origen que la app. De ahí para
 * adentro se ocupa `app/api/[...path]/route.ts`, que adjunta el
 * `Authorization: Bearer` y el `X-Tenant` antes de reenviar a Laravel.
 *
 * Por eso aquí no hay nada de sesión:
 *  - el token vive en una cookie **httpOnly** que solo lee el BFF; este código,
 *    que corre en el navegador, no puede verlo ni por error;
 *  - no hay `withCredentials` ni `withXSRFToken` que valgan: al ser mismo
 *    origen, la cookie viaja sola y no hay CSRF de Sanctum que negociar.
 *
 * El interceptor de request que adjuntaba el Bearer **no va aquí**. Un token
 * accesible desde JS es un token que cualquier script de terceros puede leer;
 * esa lógica es del servidor y vive en el BFF.
 */
export const api = axios.create({
  baseURL: "/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

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
      [
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/verificar-correo",
      ].includes(window.location.pathname);

    if (status === 401 && !onAuthPage && typeof window !== "undefined") {
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);
