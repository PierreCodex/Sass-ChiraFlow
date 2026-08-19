import { borrarSesion, leerSesion, urlUpstream } from "@/lib/auth/sesion";

/**
 * Logout: revoca el token en Laravel y borra la cookie.
 *
 * Las dos cosas, y en ese orden. Borrar solo la cookie dejaría un token vivo
 * en la base de datos; revocar solo en Laravel dejaría al navegador mandando
 * un token muerto en cada request.
 *
 * Se le pide a Laravel `POST {API_URL}/logout` con el Bearer, borrando **ese**
 * token (`$request->user()->currentAccessToken()->delete()`), no todos: cerrar
 * sesión en el móvil no debería echar a nadie del escritorio.
 */

export const dynamic = "force-dynamic";

export async function POST() {
  const { token } = await leerSesion();

  if (token) {
    try {
      await fetch(`${urlUpstream()}/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });
    } catch {
      // Si el backend no responde, la sesión del navegador se cierra igual:
      // dejar al usuario dentro porque falló la revocación es peor.
    }
  }

  await borrarSesion();

  return new Response(null, { status: 204 });
}
