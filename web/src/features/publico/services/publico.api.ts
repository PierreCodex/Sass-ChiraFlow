import { usarMocksPara } from "@/lib/api/mocks";
import { api } from "@/lib/api/client";
import { delay } from "@/lib/mock-utils";
import { citasMock } from "@/features/citas/mocks";
import { profesionalesMock } from "@/features/profesionales/mocks";
import { configuracionMock } from "@/features/configuracion/mocks";
import {
  huecosDisponibles,
  jornadaDelDia,
  pasoDeAgenda,
  type Ocupado,
} from "@/features/calendario/disponibilidad";
import type {
  ConfirmacionReserva,
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
    if (usarMocksPara("publico")) {
      await delay(300);
      if (slug !== negocioMock.slug) throw new Error("Negocio no encontrado");
      return { negocio: negocioMock, locales: localesPublicos() };
    }
    const { data } = await api.get<{
      data: { negocio: NegocioPublico; locales: LocalPublico[] };
    }>(`/publico/${slug}`);
    return data.data;
  },

  /**
   * Catálogo y profesionales de una sede. `sede` es su slug (Story 6.2); un
   * slug antiguo o el id también valen, y la respuesta trae el vigente en
   * `local.slug`.
   */
  tienda: async (slug: string, sede: string): Promise<TiendaLocal> => {
    if (usarMocksPara("publico")) {
      await delay(400);
      const tienda = tiendaLocalMock(sede);
      if (!tienda || slug !== negocioMock.slug) {
        throw new Error("Sucursal no encontrada");
      }
      return tienda;
    }
    const { data } = await api.get<{ data: TiendaLocal }>(
      `/publico/${slug}/sucursal/${encodeURIComponent(sede)}`
    );
    return data.data;
  },

  /**
   * Horas libres de una sede para unos servicios (Story 6.4).
   *
   * `servicios` lleva un id por unidad (dos cortes = el id dos veces); varios
   * distintos son una cita seguida con quien los preste todos. La duración la
   * calcula el servidor. Sin `profesional_id`, las horas de cualquiera que
   * pueda atender.
   *
   * En mock se calcula con el **mismo motor** que el calendario del panel
   * (`features/calendario/disponibilidad`), con la misma unión.
   */
  horarios: async (
    slug: string,
    localId: number,
    params: { fecha: string; servicios: number[]; profesional_id: number | null }
  ): Promise<string[]> => {
    if (usarMocksPara("publico")) {
      await delay(300);

      const tienda = tiendaLocalMock(String(localId));
      if (!tienda) return [];

      const catalogo = tienda.categorias.flatMap((categoria) => categoria.servicios);
      const distintos = [...new Set(params.servicios)];
      if (!distintos.every((id) => catalogo.some((servicio) => servicio.id === id))) {
        return [];
      }

      const duracion = params.servicios.reduce(
        (total, id) => total + (catalogo.find((servicio) => servicio.id === id)?.duracion_min ?? 0),
        0
      );

      const candidatos = tienda.profesionales
        .filter((profesional) => distintos.every((id) => profesional.servicios.includes(id)))
        .map((profesional) => profesional.id)
        .filter((id) => params.profesional_id === null || id === params.profesional_id);

      const horas = new Set<string>();
      for (const id of candidatos) {
        const empleado = profesionalesMock.find((item) => item.id === id);
        if (!empleado) continue;

        const jornada = jornadaDelDia(empleado, params.fecha, {
          apertura: configuracionMock.horario_apertura ?? "09:00",
          cierre: configuracionMock.horario_cierre ?? "20:00",
        });
        if (!jornada.trabaja) continue;

        const ocupados: Ocupado[] = citasMock
          .filter(
            (cita) =>
              cita.fecha === params.fecha &&
              cita.empleado?.id === id &&
              cita.estado !== "cancelada"
          )
          .map((cita) => ({ inicio: cita.hora_inicio, fin: cita.hora_fin }));

        const paso = pasoDeAgenda(configuracionMock.agenda, duracion);
        huecosDisponibles(jornada, ocupados, duracion, paso).forEach((hora) => horas.add(hora));
      }

      return [...horas].sort();
    }

    const { fecha, servicios, profesional_id } = params;
    const { data } = await api.get<{ data: string[] }>(
      `/publico/${slug}/sucursal/${localId}/horarios`,
      {
        params: {
          fecha,
          servicios,
          ...(profesional_id === null ? {} : { profesional_id }),
        },
      }
    );
    return data.data;
  },

  /** Crea la(s) cita(s). Entran como `pendiente` y `fuente: "publica"`. */
  reservar: async (
    slug: string,
    localId: number,
    payload: ReservaPayload
  ): Promise<ReservaConfirmada> => {
    if (usarMocksPara("publico")) {
      await delay(800);

      const tienda = tiendaLocalMock(String(localId))!;
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

  /**
   * Story 6.7: el enlace del correo C-11. Confirmar dos veces no cambia nada;
   * fuera de plazo responde `expirada`. Firma o código inválidos: 404.
   */
  confirmar: async (slug: string, codigo: string, firma: string): Promise<ConfirmacionReserva> => {
    if (usarMocksPara("publico")) {
      await delay(600);
      return {
        resultado: firma === "vencida" ? "expirada" : "confirmada",
        negocio: negocioMock.nombre,
        cita: {
          codigo,
          servicio: "Consulta general",
          profesional: "Dra. Carmen",
          sede: "Local 1",
          fecha: "2026-11-16",
          hora_inicio: "11:30",
        },
        sede_slug: "local-1",
      };
    }

    const { data } = await api.post<{ data: ConfirmacionReserva }>(
      `/publico/${slug}/reserva/${encodeURIComponent(codigo)}/confirmar`,
      { f: firma }
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
