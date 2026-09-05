import type { NivelPermiso } from "@/features/roles/types";

/**
 * Los 14 módulos del panel, en el orden en que los manda el backend.
 *
 * Son las claves con las que se pregunta por permiso, y **no** las rutas ni
 * los títulos del menú: `empleados` sigue llamándose así aunque su pantalla se
 * llame ahora Profesionales, porque la clave la fija el backend y renombrarla
 * aquí solo la desconectaría de su matriz.
 */
export const MODULOS = [
  "dashboard",
  "citas",
  "calendario",
  "clientes",
  "servicios",
  "inventario",
  "caja",
  "reportes",
  "locales",
  "empleados",
  "whatsapp",
  "configuracion",
  "facturacion",
  "soporte",
] as const;

export type Modulo = (typeof MODULOS)[number];

/**
 * Lo que puede hacer quien está mirando, **ya resuelto por el backend**.
 *
 * Llega de `GET /api/capacidades` y no dentro del `Usuario` de `/login` por
 * arquitectura: los permisos viven en la base del negocio y el login se
 * resuelve entero en la central.
 *
 * **Es la matriz que manda.** No se deduce nada a partir del rol: si el panel
 * calculara los permisos por su cuenta acabaría habiendo dos matrices, y la
 * que decide de verdad es la de allá — el backend responde 403 igual.
 */
export interface Capacidades {
  /** Los 14 módulos siempre, con `null` donde no hay acceso. */
  permisos: Record<string, NivelPermiso | null>;
  /**
   * Ve lo suyo y no lo de sus compañeros.
   *
   * No es un permiso: habla de **sobre quién**, no de **qué**. Hoy el backend
   * lo emite pero no filtra nada — empieza a significar algo con las citas del
   * Sprint 4.
   */
  solo_propios: boolean;
  /**
   * Sedes a las que alcanza. `null` = todas.
   *
   * `null` y no la lista completa a propósito: así una lista **vacía**
   * significa de verdad «ninguna» y se distingue de «sin restricción».
   */
  locales: number[] | null;
}

/** ¿Puede al menos ver este módulo? */
export function puedeVer(
  capacidades: Capacidades | undefined,
  modulo: Modulo
): boolean {
  return !!capacidades && capacidades.permisos[modulo] != null;
}

/**
 * ¿Puede escribir en este módulo?
 *
 * `gestionar` incluye `ver`, así que esto es estrictamente más que `puedeVer`.
 */
export function puedeGestionar(
  capacidades: Capacidades | undefined,
  modulo: Modulo
): boolean {
  return capacidades?.permisos[modulo] === "gestionar";
}
