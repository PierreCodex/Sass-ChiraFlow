import type { NextRequest } from "next/server";
import type { Usuario } from "@/features/auth/services/auth.api";
import { errorJson, guardarSesion, urlUpstream } from "@/lib/auth/sesion";

/**
 * Login: el único sitio, junto con `logout`, que toca la cookie de sesión.
 *
 * El navegador manda las credenciales aquí; el token de Sanctum se queda en el
 * servidor, dentro de una cookie httpOnly. Lo que vuelve al cliente es solo el
 * usuario, con la misma forma que cualquier otro recurso: `{ data: … }`.
 *
 * Contrato que se le pide a Laravel —todavía por construir— en
 * `POST {API_URL}/login`:
 *
 * ```json
 * { "data": { "token": "17|xxxxx", "usuario": { "id": 1, "name": "…", … } } }
 * ```
 *
 * El 422 con `errors` por campo sube tal cual al formulario.
 */

export const dynamic = "force-dynamic";

interface RespuestaLogin {
  data?: { token?: string; usuario?: Usuario };
}

export async function POST(request: NextRequest) {
  let cuerpoEntrante: { remember?: boolean; [campo: string]: unknown };
  try {
    cuerpoEntrante = await request.json();
  } catch {
    return errorJson("El cuerpo de la petición no es JSON válido.", 400);
  }

  const { remember, ...credenciales } = cuerpoEntrante;

  let respuesta: Response;
  try {
    respuesta = await fetch(`${urlUpstream()}/login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credenciales),
      cache: "no-store",
    });
  } catch {
    return errorJson("No se pudo conectar con el servidor.", 502);
  }

  // Credenciales incorrectas, validación, cuenta suspendida…: que lo pinte el
  // formulario con el mensaje que mande Laravel.
  if (!respuesta.ok) {
    return new Response(respuesta.body, {
      status: respuesta.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const cuerpo = (await respuesta.json()) as RespuestaLogin;
  const token = cuerpo.data?.token;
  const usuario = cuerpo.data?.usuario;

  if (!token || !usuario) {
    return errorJson("La API no devolvió un token de sesión.", 502);
  }

  await guardarSesion(
    token,
    usuario.negocio ? String(usuario.negocio.id) : null,
    remember === true
  );

  return Response.json({ data: usuario });
}
