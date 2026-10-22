import type { Comprobante } from "./types";

/**
 * Mocks de comprobantes, **guardados en `localStorage`** como los de pagos:
 * el comprobante se emite desde un pago verificado, y ambos tienen que
 * sobrevivir a una recarga para que el prototipo se pueda enseñar.
 */

const CLAVE_COMPROBANTES = "mock:comprobantes:lista";
/** El RUC no existe en `tenants` (D-09): se recuerda aquí entre emisiones. */
const CLAVE_RUC = "mock:comprobantes:ruc";

function leer<T>(clave: string, porDefecto: T): T {
  if (typeof window === "undefined") return porDefecto;
  try {
    const crudo = window.localStorage.getItem(clave);
    return crudo ? (JSON.parse(crudo) as T) : porDefecto;
  } catch {
    return porDefecto;
  }
}

function escribir(clave: string, valor: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    // Almacenamiento bloqueado: el prototipo sigue, solo no recuerda.
  }
}

export const almacenComprobantes = {
  lista: () => leer<Comprobante[]>(CLAVE_COMPROBANTES, []),
  guardarLista: (lista: Comprobante[]) => escribir(CLAVE_COMPROBANTES, lista),
  ruc: () => leer<string | null>(CLAVE_RUC, null),
  guardarRuc: (ruc: string | null) => escribir(CLAVE_RUC, ruc),
};
