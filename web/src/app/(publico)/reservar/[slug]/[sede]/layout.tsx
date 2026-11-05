import type { ReactNode } from "react";
import { headers } from "next/headers";
import { notFound, permanentRedirect } from "next/navigation";

import { usarMocksPara } from "@/lib/api/mocks";
import { urlUpstream } from "@/lib/auth/sesion";
import { esHostDeTienda, urlTienda } from "@/lib/tienda/host";
import { restoSeguro } from "../redireccion";

/**
 * La puerta de cada sede, en el servidor (Story 6.2). Igual que la del
 * negocio: 404 de verdad si no es una sede abierta, y redirección permanente si
 * se entró por un enlace antiguo de la sede, conservando la subpágina.
 *
 * El negocio ya lo validó el layout de arriba; aquí solo la sede.
 */
export default async function SedeLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string; sede: string }>;
}) {
  const { slug, sede } = await params;

  if (usarMocksPara("publico")) return children;

  let estado: number | null = null;
  let vigente: string | null = null;
  try {
    const respuesta = await fetch(
      `${urlUpstream()}/publico/${encodeURIComponent(slug)}/sucursal/${encodeURIComponent(sede)}`,
      { headers: { Accept: "application/json" }, cache: "no-store" }
    );
    estado = respuesta.status;
    if (respuesta.ok) {
      const cuerpo = (await respuesta.json()) as { data?: { local?: { slug?: string } } };
      vigente = cuerpo.data?.local?.slug ?? null;
    }
  } catch {
    // Sin backend no se bloquea la página: el cliente mostrará su error.
  }

  if (estado === 404) notFound();

  if (vigente && vigente !== sede) {
    const cabeceras = await headers();
    const host = cabeceras.get("host") ?? "";
    // El resto que dejó el middleware empieza por `/{sede}`: se quita para
    // poner el vigente en su lugar.
    const resto = restoSeguro(cabeceras.get("x-tienda-resto")).replace(/^\/[^/?]+/, "");
    const base = esHostDeTienda(host) ? `${urlTienda(slug)}/${vigente}` : `/reservar/${slug}/${vigente}`;
    permanentRedirect(`${base}${resto}`);
  }

  return children;
}
