import { NextResponse, type NextRequest } from "next/server";

/**
 * Enrutado por subdominio para las tiendas públicas.
 *
 * `mademoiselle.lienaben.com/…` se reescribe a `/reservar/mademoiselle/…`
 * sin que la URL cambie en la barra del navegador. Es el equivalente al
 * `Route::domain('{subdomain}.'.$appDomain)` de Laravel más el middleware
 * `ResolveSubdomainNegocio`.
 *
 * Si `NEXT_PUBLIC_APP_DOMAIN` está vacío no se reescribe nada: las tiendas se
 * sirven por ruta, que es el mismo fallback que tiene el backend.
 */

// Subdominios de infraestructura que nunca son un negocio.
// Misma lista que `ResolveSubdomainNegocio`.
const RESERVADOS = ["www", "api", "admin", "app", "mail", "ftp"];

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "";

function slugDelHost(host: string): string | null {
  if (!APP_DOMAIN) return null;

  // El puerto no forma parte del dominio.
  const limpio = host.split(":")[0].toLowerCase();

  if (limpio === APP_DOMAIN) return null;
  if (!limpio.endsWith(`.${APP_DOMAIN}`)) return null;

  const slug = limpio.slice(0, -(APP_DOMAIN.length + 1));

  // Solo un nivel: "a.b.dominio.com" no es una tienda.
  if (!slug || slug.includes(".")) return null;
  if (RESERVADOS.includes(slug)) return null;

  return slug;
}

export function middleware(request: NextRequest) {
  const slug = slugDelHost(request.headers.get("host") ?? "");
  if (!slug) return NextResponse.next();

  const url = request.nextUrl.clone();

  // Evita reescribir dos veces si ya viene apuntando a la tienda.
  if (url.pathname.startsWith("/reservar/")) return NextResponse.next();

  url.pathname = `/reservar/${slug}${url.pathname === "/" ? "" : url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Todo menos assets y rutas internas de Next.
  //
  // Ojo con el patrón: excluir "cualquier ruta con punto" (`.*\..*`) rompe la
  // compilación con Turbopack y deja el servidor devolviendo respuestas
  // vacías, sin error visible. Este es el matcher estándar de Next y funciona.
  matcher: ["/((?!api|_next/static|_next/image|images|favicon.ico).*)"],
};
