import { cookies } from "next/headers";
import { env } from "@/config/env";

/**
 * La sesión del panel, vista desde el servidor.
 *
 * El token de Sanctum y el inquilino al que pertenece viven en cookies
 * **httpOnly**: las escribe `app/api/auth/login`, las borra
 * `app/api/auth/logout` y las lee el proxy de `app/api/[...path]`. Nadie más.
 * El JavaScript del navegador no las ve.
 *
 * Este módulo solo se puede importar desde código de servidor (`route.ts`,
 * Server Components): `next/headers` no existe en el cliente.
 */

export const COOKIE_TOKEN = "mi_saas_token";
export const COOKIE_TENANT = "mi_saas_tenant";

/** 30 días, para el "recuérdame". Sin él, la cookie muere con la pestaña. */
const DURACION_RECUERDAME = 60 * 60 * 24 * 30;

export interface Sesion {
  token: string | null;
  /** Id del negocio; viaja como `X-Tenant` en cada request al backend. */
  tenant: string | null;
}

/** URL de Laravel a la que reenvía el BFF, sin barra final. */
export function urlUpstream() {
  return env.apiUrl.replace(/\/+$/, "");
}

export async function leerSesion(): Promise<Sesion> {
  const tarro = await cookies();
  return {
    token: tarro.get(COOKIE_TOKEN)?.value ?? null,
    tenant: tarro.get(COOKIE_TENANT)?.value ?? null,
  };
}

export async function guardarSesion(
  token: string,
  tenant: string | null,
  recordar = false
) {
  const tarro = await cookies();

  const opciones = {
    httpOnly: true,
    sameSite: "lax" as const,
    // En local se sirve por http: con `secure` la cookie no se guardaría.
    secure: env.isProd,
    path: "/",
    ...(recordar ? { maxAge: DURACION_RECUERDAME } : {}),
  };

  tarro.set(COOKIE_TOKEN, token, opciones);

  if (tenant) {
    tarro.set(COOKIE_TENANT, tenant, opciones);
  } else {
    tarro.delete(COOKIE_TENANT);
  }
}

export async function borrarSesion() {
  const tarro = await cookies();
  tarro.delete(COOKIE_TOKEN);
  tarro.delete(COOKIE_TENANT);
}

/**
 * Error en la forma que ya sabe leer `toApiError()`: `{ message, errors }`.
 * Se usa cuando el fallo es del BFF y no de Laravel.
 */
export function errorJson(message: string, status: number) {
  return Response.json({ message }, { status });
}
