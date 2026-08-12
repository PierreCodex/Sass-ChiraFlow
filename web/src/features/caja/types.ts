/**
 * Caja del día.
 *
 * En Laravel esto es la fila de `caja_cierres` correspondiente a hoy
 * (única por negocio + fecha). Aquí se le llama "sesión" porque representa
 * el ciclo abrir → mover → cerrar, no solo el cierre.
 *
 * ⚠️ Divergencia deliberada con el backend actual: allí `saldo` guarda primero
 * el monto inicial y al cerrar se **sobrescribe** con el monto final, así que
 * se pierde con cuánto se abrió y no hay forma de saber si la caja sigue
 * abierta. Aquí son dos campos distintos y `monto_final: null` significa
 * "abierta". Ver `docs/vistas/caja.md`.
 */
export interface CajaSesion {
  id: number;
  fecha: string; // YYYY-MM-DD
  monto_inicial: number;
  ingresos: number;
  egresos: number;
  /** null mientras la caja siga abierta. */
  monto_final: number | null;
  abierta_por: string;
  abierta_en: string; // ISO datetime
  cerrada_en: string | null;
}

export type TipoMovimientoCaja = "ingreso" | "egreso";

export interface MovimientoCaja {
  id: number;
  tipo: TipoMovimientoCaja;
  monto: number;
  concepto: string;
  fecha: string; // YYYY-MM-DD
  creado_en: string; // ISO datetime — la tabla muestra solo la hora
  usuario: string;
}

/** Lo que devuelve `GET /api/caja`: el estado completo de la pantalla. */
export interface EstadoCaja {
  fecha: string;
  /** null = todavía no se ha abierto caja hoy. */
  sesion: CajaSesion | null;
  movimientos: MovimientoCaja[];
}

export interface AbrirCajaPayload {
  monto_inicial: number;
}

export interface CerrarCajaPayload {
  monto_final: number;
}

export interface MovimientoCajaPayload {
  tipo: TipoMovimientoCaja;
  monto: number;
  concepto: string;
}

/** Saldo que debería haber en el cajón según lo registrado. */
export function saldoEsperado(sesion: CajaSesion) {
  return sesion.monto_inicial + sesion.ingresos - sesion.egresos;
}

/**
 * Contado − esperado. Positivo = sobra dinero, negativo = falta.
 * Devuelve null mientras la caja siga abierta.
 */
export function diferenciaArqueo(sesion: CajaSesion) {
  if (sesion.monto_final === null) return null;
  return sesion.monto_final - saldoEsperado(sesion);
}

export function cajaAbierta(sesion: CajaSesion | null): sesion is CajaSesion {
  return !!sesion && sesion.monto_final === null;
}
