import { api } from "@/lib/api/client";
import { env } from "@/config/env";
import { delay } from "@/lib/mock-utils";
import { citasMock } from "@/features/citas/mocks";
import { empleadosMock } from "@/features/empleados/mocks";
import { configuracionApi } from "@/features/configuracion/services/configuracion.api";
import {
  huecosDisponibles,
  jornadaDelDia,
  pasoDeAgenda,
  type Ocupado,
} from "@/features/calendario/disponibilidad";
import type {
  LocalPublico,
  NegocioPublico,
  ReservaConfirmada,
  ReservaPayload,
  TiendaLocal,
} from "../types";
import { localesPublicos, negocioMock, tiendaLocalMock } from "../mocks";

/**
 * API de la tienda pública. **Sin autenticación**: son endpoints abiertos,
 * bajo `/publico/*` para que quede claro que no comparten middleware con el
 * panel.
 */
/**
 * Huecos libres de UN empleado, mismo motor que usa el calendario del panel.
 *
 * Lee la configuración con `configuracionApi.obtener()` (el mismo que usa el
 * formulario de Configuración) en vez del `configuracionMock` estático — así
 * el horario de atención que ve el cliente es el que el negocio realmente
 * guardó, no el valor con el que arrancó la demo. Antes de este cambio, la
 * tienda pública nunca se enteraba de que Configuración había cambiado nada.
 */
async function huecosDeEmpleado(
  empleadoId: number,
  fecha: string,
  duracionMin: number
): Promise<string[]> {
  const empleado = empleadosMock.find((item) => item.id === empleadoId);
  if (!empleado) return [];

  const configuracion = await configuracionApi.obtener();

  const jornada = jornadaDelDia(empleado, fecha, {
    apertura: configuracion.horario_apertura ?? "09:00",
    cierre: configuracion.horario_cierre ?? "20:00",
  });
  if (!jornada.trabaja) return [];

  const ocupados: Ocupado[] = citasMock
    .filter(
      (cita) =>
        cita.fecha === fecha &&
        cita.empleado?.id === empleadoId &&
        cita.estado !== "cancelada"
    )
    .map((cita) => ({ inicio: cita.hora_inicio, fin: cita.hora_fin }));

  const paso = pasoDeAgenda(configuracion.agenda, duracionMin);
  return huecosDisponibles(jornada, ocupados, duracionMin, paso);
}

export const publicoApi = {
  /** Negocio + sus sedes activas. Alimenta el selector de sucursal. */
  negocio: async (
    slug: string
  ): Promise<{ negocio: NegocioPublico; locales: LocalPublico[] }> => {
    if (env.usarMocks) {
      await delay(300);
      if (slug !== negocioMock.slug) throw new Error("Negocio no encontrado");

      // Mismo motivo que en `huecosDeEmpleado`: el QR y sus instrucciones se
      // configuran en el panel (Configuración → Pagos QR) y hay que leerlos
      // en vivo, no del snapshot fijo con el que arrancó `negocioMock`.
      const configuracion = await configuracionApi.obtener();
      const negocio: NegocioPublico = {
        ...negocioMock,
        pago_qr_activo: configuracion.pago_qr_activo,
        pago_qr_url: configuracion.pago_qr_url,
        pago_qr_instrucciones: configuracion.pago_qr_instrucciones,
      };

      return { negocio, locales: localesPublicos() };
    }
    const { data } = await api.get<{
      data: { negocio: NegocioPublico; locales: LocalPublico[] };
    }>(`/publico/${slug}`);
    return data.data;
  },

  /** Catálogo y profesionales de una sede. */
  tienda: async (slug: string, localId: number): Promise<TiendaLocal> => {
    if (env.usarMocks) {
      await delay(400);
      const tienda = tiendaLocalMock(localId);
      if (!tienda || slug !== negocioMock.slug) {
        throw new Error("Sucursal no encontrada");
      }
      return tienda;
    }
    const { data } = await api.get<{ data: TiendaLocal }>(
      `/publico/${slug}/sucursal/${localId}`
    );
    return data.data;
  },

  /**
   * Horas libres de un profesional para una fecha y una duración.
   *
   * En mock se calcula con el **mismo motor** que usa el calendario del panel
   * (`features/calendario/disponibilidad`), así los huecos que ve el cliente
   * son exactamente los que respeta el admin: jornada, breaks, excepciones y
   * citas ya tomadas.
   */
  horarios: async (
    slug: string,
    localId: number,
    params: { profesional_id: number; fecha: string; duracion_min: number }
  ): Promise<string[]> => {
    if (env.usarMocks) {
      await delay(300);
      return huecosDeEmpleado(params.profesional_id, params.fecha, params.duracion_min);
    }

    const { data } = await api.get<{ data: string[] }>(
      `/publico/${slug}/sucursal/${localId}/horarios`,
      { params }
    );
    return data.data;
  },

  /**
   * Horas libres de una fecha, **sin fijar profesional todavía**: la unión
   * de los huecos de todos los profesionales dados. Es lo que permite
   * mostrar "Fecha y hora" antes que "Profesional" en el wizard — una hora
   * aparece libre si por lo menos uno de ellos puede atenderla.
   */
  horariosAgregados: async (
    slug: string,
    localId: number,
    params: { profesional_ids: number[]; fecha: string; duracion_min: number }
  ): Promise<string[]> => {
    if (env.usarMocks) {
      await delay(300);
      const porEmpleado = await Promise.all(
        params.profesional_ids.map((id) =>
          huecosDeEmpleado(id, params.fecha, params.duracion_min)
        )
      );
      const union = new Set<string>();
      porEmpleado.forEach((horas) => horas.forEach((hora) => union.add(hora)));
      return Array.from(union).sort();
    }

    const { data } = await api.get<{ data: string[] }>(
      `/publico/${slug}/sucursal/${localId}/horarios-agregados`,
      { params: { ...params, profesional_ids: params.profesional_ids.join(",") } }
    );
    return data.data;
  },

  /**
   * De una lista de profesionales, cuáles siguen libres a una fecha+hora ya
   * elegidas. Alimenta el paso "Profesional" cuando va después de "Fecha y
   * hora": no tiene sentido ofrecer a alguien que ya está ocupado justo ahí.
   */
  profesionalesLibres: async (
    slug: string,
    localId: number,
    params: {
      profesional_ids: number[];
      fecha: string;
      hora_inicio: string;
      duracion_min: number;
    }
  ): Promise<number[]> => {
    if (env.usarMocks) {
      await delay(200);
      const libres = await Promise.all(
        params.profesional_ids.map(async (id) => {
          const horas = await huecosDeEmpleado(id, params.fecha, params.duracion_min);
          return horas.includes(params.hora_inicio) ? id : null;
        })
      );
      return libres.filter((id): id is number => id !== null);
    }

    const { data } = await api.get<{ data: number[] }>(
      `/publico/${slug}/sucursal/${localId}/profesionales-libres`,
      { params: { ...params, profesional_ids: params.profesional_ids.join(",") } }
    );
    return data.data;
  },

  /** Crea la(s) cita(s). Entran como `pendiente` y `fuente: "publica"`. */
  reservar: async (
    slug: string,
    localId: number,
    payload: ReservaPayload
  ): Promise<ReservaConfirmada> => {
    if (env.usarMocks) {
      await delay(800);

      const tienda = tiendaLocalMock(localId)!;
      const servicios = tienda.categorias.flatMap(
        (categoria) => categoria.servicios
      );

      const citas = payload.servicios.map((linea, indice) => {
        const servicio = servicios.find((item) => item.id === linea.id)!;
        const profesional = tienda.profesionales.find(
          (item) => item.id === linea.profesional_id
        );
        const minutos = servicio.duracion_min * linea.cantidad;

        return {
          id: indice + 1,
          servicio: servicio.nombre,
          profesional: profesional?.nombre ?? "Por asignar",
          fecha: linea.fecha,
          hora_inicio: linea.hora_inicio,
          hora_fin: sumarMinutos(linea.hora_inicio, minutos),
        };
      });

      // En modo "unica" el backend crea una sola cita encadenando todo.
      const unificadas =
        payload.modo === "unica" && citas.length > 1
          ? [
              {
                ...citas[0],
                servicio: citas.map((cita) => cita.servicio).join(" + "),
                hora_fin: sumarMinutos(
                  citas[0].hora_inicio,
                  payload.servicios.reduce((suma, linea) => {
                    const servicio = servicios.find(
                      (item) => item.id === linea.id
                    )!;
                    return suma + servicio.duracion_min * linea.cantidad;
                  }, 0)
                ),
              },
            ]
          : citas;

      return {
        codigo: `R-${Date.now().toString().slice(-6)}`,
        modo: payload.modo,
        total: payload.servicios.reduce((suma, linea) => {
          const servicio = servicios.find((item) => item.id === linea.id)!;
          return suma + servicio.precio * linea.cantidad;
        }, 0),
        citas: unificadas,
      };
    }

    const { data } = await api.post<{ data: ReservaConfirmada }>(
      `/publico/${slug}/sucursal/${localId}/reservar`,
      payload
    );
    return data.data;
  },
};

function sumarMinutos(hora: string, minutos: number) {
  const [h, m] = hora.split(":").map(Number);
  const total = h * 60 + m + minutos;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(
    total % 60
  ).padStart(2, "0")}`;
}
