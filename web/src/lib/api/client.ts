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
  codigo: string;
}

/**
 * Los dos 403 que el panel tiene que saber distinguir.
 *
 * Son cosas distintas y llevan avisos distintos: `sin_permiso` es «tu rol no
 * llega aquí» y no lo arregla quien lo ve; `suscripcion_vencida` es «renueva
 * el plan» y sí tiene un botón detrás. Sin el `codigo` habría que adivinar por
 * el texto del mensaje, que es exactamente lo que se rompe al traducirlo.
 *
 * El backend garantiza que la pared de cobro gana: en un negocio suspendido
 * sale `suscripcion_vencida` aunque además falte el permiso, porque es el
 * error sobre el que alguien puede actuar.
 */
export type CodigoError = "sin_permiso" | "suscripcion_vencida";

export interface ApiError {
  status: number;
  message: string;
  /** Errores por campo, listos para pasar a react-hook-form. */
  errors?: Record<string, string[]>;
  /** Discriminante de los 403. Ausente en el resto. */
  codigo?: CodigoError | string;
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
      codigo: axiosError.response.data?.codigo,
    };
  }

  return {
    status: 0,
    message: "No se pudo conectar con el servidor.",
  };
}

/**
 * Rutas que se ven sin sesión: en ellas un 401 es una respuesta normal, no una
 * sesión caída, y redirigir sería un bucle.
 */
const RUTAS_PUBLICAS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verificar-correo",
];

/** Evita que dos peticiones en vuelo disparen dos logouts y dos saltos. */
let cerrandoSesion = false;

/**
 * Sesión caída -> limpiar y de vuelta al login.
 *
 * El 401 es el camino **autoritativo**: el guardia del middleware solo mira si
 * la cookie está, no si el token sigue vivo. Un token revocado desde otro
 * dispositivo, borrado en la BD o de una cuenta desactivada pasa el guardia y
 * muere aquí.
 *
 * Por eso no basta con saltar al login: hay que pedirle al BFF que borre la
 * cookie muerta, o el guardia la seguiría viendo y dejaría entrar al panel
 * para volver a fallar. `keepalive` para que la petición sobreviva a la
 * navegación que viene justo detrás.
 *
 * El 403 **no** entra aquí: es "correo sin verificar" y tiene su propio flujo
 * en el formulario de login.
 */
async function sesionCaida() {
  if (cerrandoSesion) return;
  cerrandoSesion = true;

  try {
    await fetch("/api/auth/logout", { method: "POST", keepalive: true });
  } catch {
    // Si no se pudo limpiar, se va al login igual: quedarse en un panel
    // muerto es peor que una cookie de más.
  }

  const destino = `${window.location.pathname}${window.location.search}`;
  const login = new URL("/login", window.location.origin);
  login.searchParams.set("next", destino);
  login.searchParams.set("sesion", "expirada");

  window.location.replace(login.toString());
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const enElNavegador = typeof window !== "undefined";
    const enRutaPublica =
      enElNavegador &&
      RUTAS_PUBLICAS.some(
        (ruta) =>
          window.location.pathname === ruta ||
          window.location.pathname.startsWith(`${ruta}/`),
      );

    if (error.response?.status === 401 && enElNavegador && !enRutaPublica) {
      void sesionCaida();
    }

    return Promise.reject(error);
  }
);
