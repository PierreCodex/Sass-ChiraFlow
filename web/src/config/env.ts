/**
 * Configuración leída de variables de entorno.
 * Todo lo que se use en el navegador debe llevar el prefijo NEXT_PUBLIC_.
 */
export const env = {
  /**
   * URL de Laravel, ej: `http://localhost:8000/api`.
   *
   * **Solo la usa el BFF**, en el servidor: el navegador le habla al proxy de
   * Next (`/api`), nunca a Laravel directo. `API_URL` —sin `NEXT_PUBLIC_`—
   * tiene prioridad y es lo suyo en producción: así la URL del backend deja de
   * viajar en el bundle del cliente.
   */
  apiUrl:
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8000/api",

  /** Nombre visible de la app (títulos, metadata). */
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? "tivu",

  /**
   * Dominio raíz de las tiendas públicas: `pepito.tivuapp.store` (Story 6.1).
   * Equivale a `config('tivu.dominio_tiendas')` en Laravel, y es el mismo que
   * usan el middleware y el BFF (`lib/tienda/host.ts`).
   *
   * `NEXT_PUBLIC_APP_DOMAIN` se acepta por compatibilidad. Si queda vacío,
   * las tiendas se sirven solo por ruta (`/reservar/{slug}`).
   */
  appDomain: process.env.NEXT_PUBLIC_STORE_DOMAIN || process.env.NEXT_PUBLIC_APP_DOMAIN || "",

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

  /**
   * Módulos que YA hablan con Laravel mientras el resto sigue con datos
   * ficticios: `NEXT_PUBLIC_MODULOS_CONECTADOS="categorias,servicios"`.
   *
   * `usarMocks` es global, y apagarlo de golpe tumbaría los módulos que aún no
   * tienen backend. Con esta lista se van conectando de uno en uno, según los
   * termina el otro repo. Cuando estén todos: `NEXT_PUBLIC_USE_MOCKS=false` y
   * la lista sobra.
   */
  modulosConectados: (process.env.NEXT_PUBLIC_MODULOS_CONECTADOS ?? "")
    .split(",")
    .map((modulo) => modulo.trim())
    .filter(Boolean),

  isProd: process.env.NODE_ENV === "production",
} as const;
