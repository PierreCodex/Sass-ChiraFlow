import type { NextRequest } from "next/server";
import { errorJson, leerSesion, urlUpstream } from "@/lib/auth/sesion";

/**
 * BFF: todo lo que el navegador pide a `/api/*` pasa por aquí y sale hacia
 * Laravel con el `Authorization: Bearer` puesto.
 *
 * El navegador nunca ve el token —vive en una cookie httpOnly— y nunca habla
 * con Laravel directamente, así que tampoco hay CORS que configurar.
 *
 * Es un reenvío tonto a propósito: no interpreta el cuerpo ni la respuesta.
 * Reenvía los bytes tal cual, y por eso funcionan igual el JSON, el
 * `multipart/form-data` de servicios y empleados, y el CSV de reportes.
 *
 * `/api/auth/login` y `/api/auth/logout` **no** llegan aquí: son rutas
 * estáticas y en el App Router ganan a este comodín. Son las únicas que tocan
 * la cookie.
 */

// El proxy depende de la cookie de cada petición: nada que prerrenderizar.
export const dynamic = "force-dynamic";

/**
 * Cabeceras que no se reenvían:
 *  - `host` iría con el dominio de Next, no con el de Laravel;
 *  - `cookie` es de este dominio, y contiene justo el token que no queremos
 *    filtrar dos veces;
 *  - `content-length` y `accept-encoding` los recalcula `fetch`.
 */
const NO_REENVIAR = new Set([
  "host",
  "connection",
  "cookie",
  "content-length",
  "accept-encoding",
]);

/** Cabeceras de la respuesta que describen el transporte, no el contenido. */
const NO_DEVOLVER = new Set([
  "content-encoding",
  "content-length",
  "transfer-encoding",
  "connection",
  // Laravel no debería mandar cookies con auth por token; si las manda, se
  // quedan aquí: la sesión del panel es la nuestra.
  "set-cookie",
]);

async function proxy(
  request: NextRequest,
  contexto: { params: Promise<{ path: string[] }> }
) {
  const { path } = await contexto.params;
  const { token, tenant } = await leerSesion();

  const destino = `${urlUpstream()}/${path.join("/")}${request.nextUrl.search}`;

  const cabeceras = new Headers();
  request.headers.forEach((valor, clave) => {
    if (!NO_REENVIAR.has(clave)) cabeceras.set(clave, valor);
  });

  // Laravel decide por el `Accept` si un 422 sale como JSON o como redirección
  // a un formulario que aquí no existe. Todo lo que pasa por el BFF es API, así
  // que no se deja a criterio de quien llame.
  cabeceras.set("Accept", "application/json");

  // Sin token la request sale igual: es lo que hace falta para la tienda
  // pública (`/api/publico/*`), que no lleva sesión.
  if (token) cabeceras.set("Authorization", `Bearer ${token}`);
  if (tenant) cabeceras.set("X-Tenant", tenant);

  const llevaCuerpo = request.method !== "GET" && request.method !== "HEAD";

  let respuesta: Response;
  try {
    respuesta = await fetch(destino, {
      method: request.method,
      headers: cabeceras,
      // arrayBuffer y no el stream: preserva el boundary del multipart y evita
      // tener que negociar `duplex` en el fetch de Node.
      body: llevaCuerpo ? await request.arrayBuffer() : undefined,
      cache: "no-store",
      // Un 302 de Laravel es un error de configuración (una ruta web colada en
      // la API), no algo que seguir a ciegas.
      redirect: "manual",
    });
  } catch {
    return errorJson("No se pudo conectar con el servidor.", 502);
  }

  const cabecerasRespuesta = new Headers();
  respuesta.headers.forEach((valor, clave) => {
    if (!NO_DEVOLVER.has(clave)) cabecerasRespuesta.set(clave, valor);
  });

  // El 401 se devuelve tal cual: el interceptor de axios lo traduce en un
  // salto a /login.
  return new Response(respuesta.body, {
    status: respuesta.status,
    statusText: respuesta.statusText,
    headers: cabecerasRespuesta,
  });
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
};
