import { usarMocksPara } from "@/lib/api/mocks";
import { api } from "@/lib/api/client";
import { delay } from "@/lib/mock-utils";
import { almacenPagos } from "../mocks";
import type { ConfigPagos, PagoReserva } from "../types";

/**
 * API del cobro con QR.
 *
 * ⚠️ **Prototipo**: ninguna de estas rutas existe en Laravel ni en
 * `api-contract.md`. Son la propuesta para cuando se construya la Épica 7 con
 * varios métodos de pago; mientras el módulo `pagos` no esté en
 * `NEXT_PUBLIC_MODULOS_CONECTADOS`, todo responde desde `localStorage`.
 */
export const pagosApi = {
  /** Configuración del panel (Administración → General → Cobros con QR). */
  config: async (): Promise<ConfigPagos> => {
    if (usarMocksPara("pagos")) {
      await delay(250);
      return almacenPagos.config();
    }
    const { data } = await api.get<{ data: ConfigPagos }>("/pagos/config");
    return data.data;
  },

  guardarConfig: async (config: ConfigPagos): Promise<ConfigPagos> => {
    if (usarMocksPara("pagos")) {
      await delay(400);
      almacenPagos.guardarConfig(config);
      return config;
    }
    const { data } = await api.put<{ data: ConfigPagos }>("/pagos/config", config);
    return data.data;
  },

  /** Lo que ve la tienda: la misma configuración, sin nada interno. */
  configPublica: async (slug: string): Promise<ConfigPagos> => {
    if (usarMocksPara("pagos")) {
      await delay(200);
      return almacenPagos.config();
    }
    const { data } = await api.get<{ data: ConfigPagos }>(`/publico/${slug}/pagos`);
    return data.data;
  },

  /** El pago de una reserva, por su código (lo usa la tienda). */
  pagoDeReserva: async (slug: string, codigo: string): Promise<PagoReserva | null> => {
    if (usarMocksPara("pagos")) {
      await delay(200);
      return almacenPagos.pagos().find((pago) => pago.codigo === codigo) ?? null;
    }
    const { data } = await api.get<{ data: PagoReserva }>(
      `/publico/${slug}/reservas/${codigo}/pago`
    );
    return data.data;
  },

  /**
   * El cliente sube su captura, sin sesión: le basta el código de la reserva.
   * En el backend real la imagen se valida por firma, se re-codifica y va a
   * disco privado (Story 7.3).
   */
  subirComprobante: async (
    slug: string,
    codigo: string,
    datos: { metodo_id: number; comprobante: File; codigo_operacion: string | null }
  ): Promise<PagoReserva> => {
    if (usarMocksPara("pagos")) {
      await delay(700);
      const comprobante = await aDataUrl(datos.comprobante);
      const metodo = almacenPagos
        .config()
        .metodos.find((item) => item.id === datos.metodo_id);
      return actualizarPago(codigo, {
        estado: "comprobante_subido",
        metodo_id: datos.metodo_id,
        metodo_nombre: metodo?.nombre ?? null,
        comprobante_url: comprobante,
        codigo_operacion: datos.codigo_operacion,
        motivo: null,
      });
    }
    const form = new FormData();
    form.append("metodo_id", String(datos.metodo_id));
    form.append("comprobante", datos.comprobante);
    if (datos.codigo_operacion) form.append("codigo_operacion", datos.codigo_operacion);
    const { data } = await api.post<{ data: PagoReserva }>(
      `/publico/${slug}/reservas/${codigo}/comprobante`,
      form
    );
    return data.data;
  },

  /** Pagos para la encargada, los más recientes primero. */
  listar: async (): Promise<PagoReserva[]> => {
    if (usarMocksPara("pagos")) {
      await delay(300);
      return [...almacenPagos.pagos()].sort((a, b) =>
        b.creado_en.localeCompare(a.creado_en)
      );
    }
    const { data } = await api.get<{ data: PagoReserva[] }>("/pagos");
    return data.data;
  },

  /** Aprobar: el pago queda verificado y la cita, confirmada (Story 7.4). */
  aprobar: async (codigo: string): Promise<PagoReserva> => {
    if (usarMocksPara("pagos")) {
      await delay(400);
      return actualizarPago(codigo, { estado: "verificado", motivo: null });
    }
    const { data } = await api.post<{ data: PagoReserva }>(`/pagos/${codigo}/aprobar`);
    return data.data;
  },

  /** Captura ilegible: la cita sigue reservada y el cliente tiene un plazo nuevo. */
  pedirOtra: async (codigo: string, motivo: string): Promise<PagoReserva> => {
    if (usarMocksPara("pagos")) {
      await delay(400);
      const plazo = almacenPagos.config().plazo_min;
      return actualizarPago(codigo, {
        estado: "pendiente",
        motivo,
        comprobante_url: null,
        codigo_operacion: null,
        vence_a: new Date(Date.now() + plazo * 60_000).toISOString(),
      });
    }
    const { data } = await api.post<{ data: PagoReserva }>(
      `/pagos/${codigo}/pedir-otra`,
      { motivo }
    );
    return data.data;
  },

  /** El pago no existe: se cancela la cita y se libera el hueco. */
  rechazar: async (codigo: string, motivo: string): Promise<PagoReserva> => {
    if (usarMocksPara("pagos")) {
      await delay(400);
      return actualizarPago(codigo, { estado: "rechazado", motivo });
    }
    const { data } = await api.post<{ data: PagoReserva }>(`/pagos/${codigo}/rechazar`, {
      motivo,
    });
    return data.data;
  },
};

/**
 * Registra el pago pendiente de una reserva recién creada. Solo existe en el
 * mock: en el backend real lo crea el propio `POST /reservar`.
 */
export function registrarPagoMock(pago: PagoReserva) {
  const otros = almacenPagos.pagos().filter((item) => item.codigo !== pago.codigo);
  almacenPagos.guardarPagos([pago, ...otros]);
}

function actualizarPago(codigo: string, cambios: Partial<PagoReserva>): PagoReserva {
  const pagos = almacenPagos.pagos();
  const actual = pagos.find((pago) => pago.codigo === codigo);
  if (!actual) throw new Error("No encontramos esa reserva.");
  const nuevo = { ...actual, ...cambios };
  almacenPagos.guardarPagos(pagos.map((pago) => (pago.codigo === codigo ? nuevo : pago)));
  return nuevo;
}

function aDataUrl(archivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(String(lector.result));
    lector.onerror = () => reject(new Error("No pudimos leer la imagen."));
    lector.readAsDataURL(archivo);
  });
}
