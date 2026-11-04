/**
 * Qué host es una tienda (Story 6.1, AD-15). Lo usan el middleware y el BFF:
 * la MISMA regla en los dos sitios, o uno dejaría pasar lo que el otro cierra.
 *
 * Sin dependencias de Node: el middleware corre en el runtime de Edge.
 */

/**
 * Dominio raíz de las tiendas: `tivuapp.store` → `pepito.tivuapp.store`.
 *
 * `NEXT_PUBLIC_APP_DOMAIN` se acepta por compatibilidad con los `.env` de
 * antes. Vacío en desarrollo: las tiendas se sirven solo por ruta
 * (`/reservar/{slug}`).
 */
export const DOMINIO_TIENDAS = (
  process.env.NEXT_PUBLIC_STORE_DOMAIN ||
  process.env.NEXT_PUBLIC_APP_DOMAIN ||
  ""
).toLowerCase();

/**
 * Slug reservado al que se manda un host de tienda que no nombra a ningún
 * negocio (`tivuapp.store`, `a.b.tivuapp.store`): está en `SlugsReservados`
 * del backend, así que nunca es una tienda y la página dice «no encontrado».
 */
export const SLUG_INEXISTENTE = "tienda";

function sinPuerto(host: string) {
  return host.split(":")[0].toLowerCase();
}

/** ¿Llega esta petición por el dominio de las tiendas (raíz o subdominio)? */
export function esHostDeTienda(host: string): boolean {
  if (!DOMINIO_TIENDAS) return false;
  const limpio = sinPuerto(host);
  return limpio === DOMINIO_TIENDAS || limpio.endsWith(`.${DOMINIO_TIENDAS}`);
}

/**
 * El slug de `pepito.tivuapp.store`, o `null` si el host no nombra a un
 * negocio: raíz del dominio o más de un nivel (`a.b.tivuapp.store`).
 *
 * No filtra reservados: eso lo decide el backend, y con un reservado la
 * tienda simplemente no existe.
 */
export function slugDelHost(host: string): string | null {
  if (!esHostDeTienda(host)) return null;
  const limpio = sinPuerto(host);
  if (limpio === DOMINIO_TIENDAS) return null;

  const slug = limpio.slice(0, -(DOMINIO_TIENDAS.length + 1));
  return slug && !slug.includes(".") ? slug : null;
}

/** La dirección pública de un negocio, para enlaces y redirecciones. */
export function urlTienda(slug: string, protocolo = "https:"): string {
  return DOMINIO_TIENDAS ? `${protocolo}//${slug}.${DOMINIO_TIENDAS}` : `/reservar/${slug}`;
}
