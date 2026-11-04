import { NextResponse, type NextRequest } from "next/server";
import { SLUG_INEXISTENTE, esHostDeTienda, slugDelHost } from "@/lib/tienda/host";

/**
 * Dos cosas, en este orden: el enrutado de las tiendas públicas y el guardia
 * de sesión del panel.
 *
 * Tiendas (Story 6.1): `pepito.tivuapp.store/…` se reescribe a
 * `/reservar/pepito/…` sin que cambie la barra del navegador. Un host de
 * tienda **nunca** llega al panel: si no nombra a un negocio (la raíz del
 * dominio, `a.b.tivuapp.store`) va a una tienda que no existe y se ve
 * «no encontrado». Los reservados no se filtran aquí: los rechaza el backend.
 *
 * Si `NEXT_PUBLIC_STORE_DOMAIN` está vacío no se reescribe nada: las tiendas
 * se sirven por ruta (`/reservar/{slug}`).
 */

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
  // La landing del SaaS y sus páginas legales.
  "/inicio",
  "/terminos",
];

function esPublica(pathname: string) {
  return RUTAS_PUBLICAS.some(
    (ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`),
  );
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";

  // La tienda pública va primero y se sirve sin sesión: el guardia no la mira.
  if (esHostDeTienda(host)) {
    const slug = slugDelHost(host) ?? SLUG_INEXISTENTE;
    const url = request.nextUrl.clone();

    /*
     * Los enlaces internos de la tienda ya llevan `/reservar/{slug}/…`. Solo
     * pasan si son de ESTA tienda: `pepito.tivuapp.store/reservar/luna`
     * serviría la tienda de otro negocio bajo la dirección de Pepito.
     */
    const propia = `/reservar/${slug}`;
    if (url.pathname === propia || url.pathname.startsWith(`${propia}/`)) {
      return NextResponse.next();
    }

    url.pathname = url.pathname.startsWith("/reservar/")
      ? `/reservar/${SLUG_INEXISTENTE}`
      : `${propia}${url.pathname === "/" ? "" : url.pathname}`;
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

  /*
   * La puerta de la web: quien llega a `/` sin sesión ve la landing, no el
   * login. Se reescribe y no se redirige, para que la dirección siga siendo
   * la raíz. Con sesión, `/` sigue siendo el panel (arriba), y la landing
   * queda a mano en `/inicio`.
   */
  if (pathname === "/") {
    const landing = request.nextUrl.clone();
    landing.pathname = "/inicio";
    return NextResponse.rewrite(landing);
  }

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
