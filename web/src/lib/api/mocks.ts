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

/**
 * ¿Esta sección del panel todavía no existe de verdad? Sin backend
 * (`usarMocksPara`) y sin permiso para enseñar datos ficticios
 * (`NEXT_PUBLIC_MOSTRAR_DATOS_FICTICIOS=false`, producción). La pantalla
 * muestra entonces `ModuloProximamente` en vez de los mocks.
 */
export function moduloEnConstruccion(modulo: string): boolean {
  return usarMocksPara(modulo) && !env.mostrarDatosFicticios;
}
