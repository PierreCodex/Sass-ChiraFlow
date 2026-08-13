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

  /**
   * Dominio raíz para las tiendas públicas por subdominio:
   * `mademoiselle.lienaben.com`. Equivale a `config('app.domain')` en Laravel.
   *
   * Si queda vacío, el middleware no reescribe nada y las tiendas se sirven
   * solo por ruta (`/reservar/{slug}`), igual que el fallback del backend.
   */
  appDomain: process.env.NEXT_PUBLIC_APP_DOMAIN ?? "",

  /**
   * Formato de números y fechas.
   *
   * Los valores por defecto son los reales del proyecto, no genéricos:
   * `.env.local` no se sube al repo, así que en un despliegue sin variables
   * configuradas (Vercel, preview) la app tiene que verse bien igual.
   */
  locale: process.env.NEXT_PUBLIC_LOCALE ?? "es-PE",

  /** Código ISO de la moneda: PEN, USD, MXN, COP… */
  currency: process.env.NEXT_PUBLIC_CURRENCY ?? "PEN",

  /**
   * Si es true, la capa de servicios devuelve datos ficticios en vez de llamar
   * a Laravel. Ponlo en false cuando el backend esté listo: los hooks y los
   * componentes no cambian.
   */
  usarMocks: process.env.NEXT_PUBLIC_USE_MOCKS !== "false",

  isProd: process.env.NODE_ENV === "production",
} as const;
