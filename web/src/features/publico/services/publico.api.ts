import { api } from "@/lib/api/client";
import { env } from "@/config/env";
import { delay } from "@/lib/mock-utils";
import { citasMock } from "@/features/citas/mocks";
import { empleadosMock } from "@/features/empleados/mocks";
import { configuracionMock } from "@/features/configuracion/mocks";
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
export const publicoApi = {
  /** Negocio + sus sedes activas. Alimenta el selector de sucursal. */
  negocio: async (
    slug: string
  ): Promise<{ negocio: NegocioPublico; locales: LocalPublico[] }> => {
    if (env.usarMocks) {
      await delay(300);
      if (slug !== negocioMock.slug) throw new Error("Negocio no encontrado");
      return { negocio: negocioMock, locales: localesPublicos() };
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

      const empleado = empleadosMock.find(
        (item) => item.id === params.profesional_id
      );
      if (!empleado) return [];

      const jornada = jornadaDelDia(empleado, params.fecha, {
        apertura: configuracionMock.horario_apertura ?? "09:00",
        cierre: configuracionMock.horario_cierre ?? "20:00",
      });
      if (!jornada.trabaja) return [];

      const ocupados: Ocupado[] = citasMock
        .filter(
          (cita) =>
            cita.fecha === params.fecha &&
            cita.empleado?.id === params.profesional_id &&
            cita.estado !== "cancelada"
        )
        .map((cita) => ({ inicio: cita.hora_inicio, fin: cita.hora_fin }));

      const paso = pasoDeAgenda(configuracionMock.agenda, params.duracion_min);

      return huecosDisponibles(jornada, ocupados, params.duracion_min, paso);
    }

    const { data } = await api.get<{ data: string[] }>(
      `/publico/${slug}/sucursal/${localId}/horarios`,
      { params }
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
