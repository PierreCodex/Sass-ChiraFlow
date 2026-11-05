import type { ReactNode } from "react";
import { headers } from "next/headers";
import { notFound, permanentRedirect } from "next/navigation";

import { usarMocksPara } from "@/lib/api/mocks";
import { urlUpstream } from "@/lib/auth/sesion";
import { esHostDeTienda, urlTienda } from "@/lib/tienda/host";

/**
 * La puerta de cada tienda, en el servidor (Story 6.1).
 *
 * Las páginas de la tienda son de cliente; esto corre antes, una vez por
 * petición, para lo que el cliente no puede hacer bien:
 *
 * - **404 de verdad** si no es una tienda abierta (inexistente, reservado,
 *   suspendido…): la respuesta del backend es la misma en todos los casos, y
 *   aquí también.
 * - **Redirección permanente** si se entró por un slug antiguo: el backend
 *   devuelve el vigente en `negocio.slug` y los enlaces viejos de WhatsApp
 *   acaban en la dirección nueva, sin contenido duplicado.
 *
 * Con datos ficticios no hay nada que comprobar.
 */
/**
 * La subpágina y la consulta que dejó el middleware (`x-tienda-resto`), solo si
 * es una ruta relativa de verdad: nada que empiece por `//` ni tenga esquema,
 * para que la redirección nunca pueda mandar fuera de la tienda.
 */
function restoSeguro(resto: string | null): string {
  if (!resto) return "";
  if (resto.startsWith("//") || resto.includes("\\") || !/^[/?]/.test(resto)) return "";
  return resto;
}

export default async function TiendaLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (usarMocksPara("publico")) return children;

  let estado: number | null = null;
  let vigente: string | null = null;
  try {
    const respuesta = await fetch(`${urlUpstream()}/publico/${encodeURIComponent(slug)}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    estado = respuesta.status;
    if (respuesta.ok) {
      const cuerpo = (await respuesta.json()) as { data?: { negocio?: { slug?: string } } };
      vigente = cuerpo.data?.negocio?.slug ?? null;
    }
  } catch {
    // Sin backend no se bloquea la página: el cliente mostrará su propio error.
  }

  if (estado === 404) notFound();

  if (vigente && vigente !== slug) {
    const cabeceras = await headers();
    const host = cabeceras.get("host") ?? "";
    // En su subdominio se va a la dirección nueva; por ruta, a la ruta nueva.
    const base = esHostDeTienda(host) ? urlTienda(vigente) : `/reservar/${vigente}`;
    permanentRedirect(`${base}${restoSeguro(cabeceras.get("x-tienda-resto"))}`);
  }

  return children;
}
