import { NextResponse, type NextRequest } from "next/server";

/**
 * Dos cosas, en este orden: el enrutado por subdominio de las tiendas públicas
 * y el guardia de sesión del panel.
 *
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

/**
 * Cookie httpOnly del token. Se repite el literal en vez de importarlo de
 * `lib/auth/sesion`: ese módulo usa `next/headers`, que no existe en el
 * runtime del middleware.
 */
const COOKIE_TOKEN = "mi_saas_token";

/**
 * Rutas que se ven sin sesión. Si no se excluyen, el guardia redirige el
 * propio `/login` a `/login` y se monta un bucle.
 *
 * `/reservar` es la tienda pública: nunca lleva cookie, y es también donde
 * aterriza el reescrito por subdominio.
 *
 * `/invitacion` es la landing del correo con el que alguien recién dado de
 * alta elige su contraseña. Sin ella aquí, el guardia lo mandaría al login —
 * que es exactamente lo que todavía no puede hacer.
 */
const RUTAS_PUBLICAS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/invitacion",
  "/verificar-correo",
  "/reservar",
];

function esPublica(pathname: string) {
  return RUTAS_PUBLICAS.some(
    (ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`),
  );
}

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

  // La tienda pública va primero y se sirve sin sesión: el guardia no la mira.
  if (slug) {
    const url = request.nextUrl.clone();

    // Evita reescribir dos veces si ya viene apuntando a la tienda.
    if (url.pathname.startsWith("/reservar/")) return NextResponse.next();

    url.pathname = `/reservar/${slug}${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.rewrite(url);
  }

  const { pathname } = request.nextUrl;
  if (esPublica(pathname)) return NextResponse.next();

  // Guardia del panel. **Solo mira que la cookie exista**, no que el token
  // valga: un token revocado desde otro dispositivo la pasa igual. Quien
  // manda es el 401 de Laravel, que el interceptor de axios convierte en
  // logout + vuelta al login. Esto es para que no se pinte un dashboard vacío
  // que se rompe medio segundo después.
  if (request.cookies.has(COOKIE_TOKEN)) return NextResponse.next();

  const login = request.nextUrl.clone();
  login.pathname = "/login";
  login.search = "";
  // A dónde volver después de entrar, con su query si la traía.
  login.searchParams.set("next", `${pathname}${request.nextUrl.search}`);

  return NextResponse.redirect(login);
}

export const config = {
  // Todo menos assets y rutas internas de Next.
  //
  // Ojo con el patrón: excluir "cualquier ruta con punto" (`.*\..*`) rompe la
  // compilación con Turbopack y deja el servidor devolviendo respuestas
  // vacías, sin error visible. Este es el matcher estándar de Next y funciona.
  matcher: ["/((?!api|_next/static|_next/image|images|favicon.ico).*)"],
};
