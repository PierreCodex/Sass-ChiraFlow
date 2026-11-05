import type { ReactNode } from "react";
import { headers } from "next/headers";
import { notFound, permanentRedirect } from "next/navigation";

import { usarMocksPara } from "@/lib/api/mocks";
import { urlUpstream } from "@/lib/auth/sesion";
import { esHostDeTienda, urlTienda } from "@/lib/tienda/host";
import { BaseTiendaProvider } from "@/features/publico/base-tienda";
import { restoSeguro } from "./redireccion";

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
export default async function TiendaLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cabeceras = await headers();
  const enSubdominio = esHostDeTienda(cabeceras.get("host") ?? "");

  /*
    Story 6.2: los enlaces internos de la tienda salen limpios en su subdominio
    (`pepito.tivuapp.store/balta`) y por ruta en desarrollo
    (`/reservar/pepito/balta`). Lo decide este layout, que ve el host.
  */
  const conBase = (
    <BaseTiendaProvider base={enSubdominio ? "" : `/reservar/${slug}`}>{children}</BaseTiendaProvider>
  );

  if (usarMocksPara("publico")) return conBase;

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
    // En su subdominio se va a la dirección nueva; por ruta, a la ruta nueva.
    const base = enSubdominio ? urlTienda(vigente) : `/reservar/${vigente}`;
    permanentRedirect(`${base}${restoSeguro(cabeceras.get("x-tienda-resto"))}`);
  }

  return conBase;
}
