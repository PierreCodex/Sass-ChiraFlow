"use client";
import { createContext, useCallback, useContext, type ReactNode } from "react";

/**
 * Dónde empieza la tienda en la barra del navegador (Story 6.2).
 *
 * - En su subdominio, `pepito.tivuapp.store`: la base es `""` y la sede Balta
 *   es `/balta`.
 * - Por ruta (desarrollo, o sin dominio de tiendas): `/reservar/pepito`, y la
 *   sede es `/reservar/pepito/balta`.
 *
 * La decide el layout de servidor de la tienda, que es el que ve el host. Así
 * el enlace sale igual al pintar en el servidor y en el navegador.
 */
const BaseTienda = createContext<string | null>(null);

export function BaseTiendaProvider({ base, children }: { base: string; children: ReactNode }) {
  return <BaseTienda.Provider value={base}>{children}</BaseTienda.Provider>;
}

/**
 * Construye una dirección dentro de la tienda: `ruta("/balta")`,
 * `ruta("")` para la portada. Sin proveedor (no debería pasar) cae a la forma
 * por ruta, que funciona en los dos casos.
 */
export function useRutaTienda(slug: string) {
  const base = useContext(BaseTienda) ?? `/reservar/${slug}`;
  return useCallback((resto: string) => `${base}${resto}` || "/", [base]);
}
