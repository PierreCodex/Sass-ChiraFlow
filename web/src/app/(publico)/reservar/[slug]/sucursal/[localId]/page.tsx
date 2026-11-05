import { headers } from "next/headers";
import { notFound, permanentRedirect } from "next/navigation";

import { usarMocksPara } from "@/lib/api/mocks";
import { urlUpstream } from "@/lib/auth/sesion";
import { esHostDeTienda, urlTienda } from "@/lib/tienda/host";
import { tiendaLocalMock } from "@/features/publico/mocks";

/**
 * La ruta antigua de una sede, `/reservar/{negocio}/sucursal/{id}` (Story 6.2).
 * Ya no se pinta nada aquí: pregunta el slug vigente de esa sede y redirige
 * (308, permanente) a `/reservar/{negocio}/{sede}`, para que los enlaces viejos sigan
 * llegando y no haya dos direcciones para la misma página.
 */
export default async function SucursalPorId({
  params,
}: {
  params: Promise<{ slug: string; localId: string }>;
}) {
  const { slug, localId } = await params;

  let sede: string | null = null;
  if (usarMocksPara("publico")) {
    sede = tiendaLocalMock(localId)?.local.slug ?? null;
  } else {
    // Solo un 404 del backend es «no encontrado». Un 429, un 5xx o la red
    // caída son pasajeros: se lanzan y se ve la página de error, porque el
    // enlace sigue valiendo.
    const respuesta = await fetch(
      `${urlUpstream()}/publico/${encodeURIComponent(slug)}/sucursal/${encodeURIComponent(localId)}`,
      { headers: { Accept: "application/json" }, cache: "no-store" }
    );
    if (respuesta.ok) {
      const cuerpo = (await respuesta.json()) as { data?: { local?: { slug?: string } } };
      sede = cuerpo.data?.local?.slug ?? null;
    } else if (respuesta.status !== 404) {
      throw new Error(`La tienda respondió ${respuesta.status}`);
    }
  }

  if (!sede) notFound();

  const host = (await headers()).get("host") ?? "";
  permanentRedirect(esHostDeTienda(host) ? `${urlTienda(slug)}/${sede}` : `/reservar/${slug}/${sede}`);
}
