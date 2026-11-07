import {
  borrarSesion,
  cabeceraIpCliente,
  errorJson,
  leerSesion,
  urlUpstream,
} from "@/lib/auth/sesion";
import { esHostDeTienda } from "@/lib/tienda/host";

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

export async function POST(request: Request) {
  // Desde una tienda no hay sesión que cerrar (Story 6.1).
  if (esHostDeTienda(request.headers.get("host") ?? "")) {
    return errorJson("No encontrado.", 404);
  }

  const { token } = await leerSesion();

  if (token) {
    try {
      await fetch(`${urlUpstream()}/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          ...cabeceraIpCliente(request),
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
