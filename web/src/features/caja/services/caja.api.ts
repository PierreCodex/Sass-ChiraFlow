import { api } from "@/lib/api/client";
import { env } from "@/config/env";
import { delay, haceDias } from "@/lib/mock-utils";
import type {
  AbrirCajaPayload,
  CajaSesion,
  CerrarCajaPayload,
  EstadoCaja,
  MovimientoCaja,
  MovimientoCajaPayload,
} from "../types";
import { movimientosMock, sesionInicial } from "../mocks";

/**
 * Quién registra el movimiento. Con el backend real lo pone Laravel a partir
 * del usuario autenticado (`user_id`); aquí se simula.
 */
const USUARIO_MOCK = "Ana Torres";

// Estado mutable de la sesión: abrir, mover y cerrar se ven reflejados
// mientras no se recargue la página.
let sesion: CajaSesion | null = sesionInicial;
let movimientos: MovimientoCaja[] = [...movimientosMock];

export const cajaApi = {
  /**
   * Estado de la caja de hoy. Un solo endpoint devuelve la sesión y sus
   * movimientos: la pantalla no sirve de nada por partes.
   */
  estado: async (): Promise<EstadoCaja> => {
    if (env.usarMocks) {
      await delay();
      return { fecha: haceDias(0), sesion, movimientos: [...movimientos] };
    }
    const { data } = await api.get<{ data: EstadoCaja }>("/caja");
    return data.data;
  },

  abrir: async (payload: AbrirCajaPayload): Promise<CajaSesion> => {
    if (env.usarMocks) {
      await delay();
      const ahora = new Date().toISOString();
      sesion = {
        id: (sesion?.id ?? 0) + 1,
        fecha: haceDias(0),
        monto_inicial: payload.monto_inicial,
        ingresos: 0,
        egresos: 0,
        monto_final: null,
        abierta_por: USUARIO_MOCK,
        abierta_en: ahora,
        cerrada_en: null,
      };
      movimientos = [];
      return sesion;
    }
    const { data } = await api.post<{ data: CajaSesion }>("/caja/abrir", payload);
    return data.data;
  },

  cerrar: async (payload: CerrarCajaPayload): Promise<CajaSesion> => {
    if (env.usarMocks) {
      await delay();
      if (!sesion) throw new Error("No hay caja abierta.");
      sesion = {
        ...sesion,
        monto_final: payload.monto_final,
        cerrada_en: new Date().toISOString(),
      };
      return sesion;
    }
    const { data } = await api.post<{ data: CajaSesion }>("/caja/cerrar", payload);
    return data.data;
  },

  /**
   * Registra un ingreso o egreso. El backend acumula el monto en
   * `ingresos`/`egresos` de la caja del día (`CajaController::movimiento`).
   */
  registrarMovimiento: async (
    payload: MovimientoCajaPayload
  ): Promise<MovimientoCaja> => {
    if (env.usarMocks) {
      await delay();
      if (!sesion) throw new Error("Abre caja primero.");

      const movimiento: MovimientoCaja = {
        id: Math.max(0, ...movimientos.map((m) => m.id)) + 1,
        tipo: payload.tipo,
        monto: payload.monto,
        concepto: payload.concepto,
        fecha: sesion.fecha,
        creado_en: new Date().toISOString(),
        usuario: USUARIO_MOCK,
      };

      movimientos = [movimiento, ...movimientos];
      sesion =
        payload.tipo === "ingreso"
          ? { ...sesion, ingresos: sesion.ingresos + payload.monto }
          : { ...sesion, egresos: sesion.egresos + payload.monto };

      return movimiento;
    }
    const { data } = await api.post<{ data: MovimientoCaja }>(
      "/caja/movimientos",
      payload
    );
    return data.data;
  },
};
