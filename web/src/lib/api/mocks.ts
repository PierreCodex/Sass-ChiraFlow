import { env } from "@/config/env";

const CONECTADOS = new Set(env.modulosConectados);

/**
 * ¿Este módulo responde con datos ficticios?
 *
 * Dos interruptores, y el global manda:
 *
 * - `NEXT_PUBLIC_USE_MOCKS=false` → **nada** de mocks, todo contra Laravel.
 * - Si no, mocks para todos **menos** los de `NEXT_PUBLIC_MODULOS_CONECTADOS`.
 *
 * Existe porque el backend llega por sprints: sin esto habría que esperar a
 * tener los 16 módulos para poder conectar el primero.
 *
 * La clave es el nombre del módulo (`clientes`, `servicios`, `caja`…), no la
 * ruta REST: un mismo módulo puede tener su CRUD y endpoints sueltos, y se
 * conectan juntos o no se conectan.
 */
export function usarMocksPara(modulo: string): boolean {
  if (!env.usarMocks) return false;
  return !CONECTADOS.has(modulo);
}
