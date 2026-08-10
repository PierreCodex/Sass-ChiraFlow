/**
 * Configuración leída de variables de entorno.
 * Todo lo que se use en el navegador debe llevar el prefijo NEXT_PUBLIC_.
 */
export const env = {
  /** URL base de la API de Laravel, ej: http://localhost:8000/api */
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api",

  /** Raíz de Laravel (sin /api). Necesaria para el CSRF cookie de Sanctum. */
  apiRoot: process.env.NEXT_PUBLIC_API_ROOT ?? "http://localhost:8000",

  /** Nombre visible de la app (títulos, metadata). */
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Mi SaaS",

  isProd: process.env.NODE_ENV === "production",
} as const;
