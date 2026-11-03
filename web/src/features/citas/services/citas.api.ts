import { usarMocksPara } from "@/lib/api/mocks";
import { api } from "@/lib/api/client";
import { delay } from "@/lib/mock-utils";
import { crearRecurso } from "@/lib/api/recurso";
import { serviciosMock } from "@/features/servicios/mocks";
import { profesionalesMock } from "@/features/profesionales/mocks";
import { productosMock } from "@/features/inventario/mocks";
import type { Cita, CitaPayload, EventoCita, LineaServicio } from "../types";
import { citasMock } from "../mocks";

/** hora_inicio + duración -> hora_fin. Con el backend real lo calcula Laravel. */
function calcularHoraFin(horaInicio: string, duracionMin: number) {
  const [horas, minutos] = horaInicio.split(":").map(Number);
  const total = horas * 60 + minutos + duracionMin;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const recurso = crearRecurso<Cita, CitaPayload>({
  path: "citas",
  mocks: citasMock,
  camposBusqueda: ["cliente_nombre", "cliente_telefono"],
  // Con el backend real el filtro viaja como `?estado=`; aqui se resuelve
  // igual para que la pantalla se comporte de la misma forma en las dos ramas.
  filtrosMock: (cita, params) => !params.estado || cita.estado === params.estado,
  // El payload manda ids; la entidad expone objetos y campos calculados.
  alGuardarMock: (payload: CitaPayload) => {
    const servicio = serviciosMock.find((s) => s.id === payload.servicio_id);
    const empleado = profesionalesMock.find((e) => e.id === payload.empleado_id);

    const linea: LineaServicio | null = servicio
      ? {
          id: servicio.id,
          nombre: servicio.nombre,
          duracion_min: servicio.duracion_min,
          precio: servicio.precio,
          cantidad: 1,
          color: servicio.color,
        }
      : null;

    const productos = (payload.productos ?? []).flatMap((fila) => {
      const producto = productosMock.find((p) => p.id === fila.id);
      if (!producto) return [];
      return [
        {
          producto_id: producto.id,
          nombre: producto.nombre,
          cantidad: fila.cantidad,
          precio_unitario: producto.precio_venta,
        },
      ];
    });

    return {
      servicios: linea ? [linea] : [],
      servicio: linea,
      empleado: empleado
        ? { id: empleado.id, nombre: empleado.nombre }
        : undefined,
      hora_fin: calcularHoraFin(
        payload.hora_inicio,
        servicio?.duracion_min ?? 30
      ),
      productos,
      // `monto` son solo los servicios; el total suma lo vendido.
      monto_total:
        payload.monto +
        productos.reduce((suma, p) => suma + p.precio_unitario * p.cantidad, 0),
      // Lo pone el backend; desde el panel siempre es el panel.
      canal: "panel" as const,
      creada_por: { id: 1, nombre: "Manuel Ganoza" },
    };
  },
});

export const citasApi = {
  ...recurso,

  /**
   * Todas las citas de un día, sin paginar. Es lo que consume el calendario.
   */
  porFecha: async (fecha: string): Promise<Cita[]> => {
    if (usarMocksPara("citas")) {
      await delay(250);
      return recurso.mockItems().filter((cita) => cita.fecha === fecha);
    }
    const { data } = await api.get<{ data: Cita[] }>("/citas", {
      params: { fecha, per_page: 200 },
    });
    return data.data;
  },

  /**
   * El historial de la cita (Story 1.13), del más antiguo al más reciente.
   * Una cita no acumula cientos de cambios: una página de 100 basta.
   */
  historial: async (id: number): Promise<EventoCita[]> => {
    if (usarMocksPara("citas")) {
      await delay(250);
      const cita = recurso.mockItems().find((c) => c.id === id);
      if (!cita) return [];

      const creada: EventoCita = {
        id: id * 10,
        tipo: "creada",
        momento: `${cita.fecha}T08:00:00-05:00`,
        actor: cita.creada_por
          ? { tipo: "usuario", nombre: cita.creada_por.nombre }
          : { tipo: "cliente", nombre: cita.cliente_nombre },
        cambios: {},
      };
      if (cita.estado === "pendiente") return [creada];

      // Con datos ficticios: si ya no está pendiente, alguien la movió.
      return [
        creada,
        {
          id: id * 10 + 1,
          tipo: "modificada",
          momento: `${cita.fecha}T08:30:00-05:00`,
          actor: { tipo: "usuario", nombre: "Ana Torres" },
          cambios: { estado: { antes: "pendiente", despues: cita.estado } },
        },
      ];
    }
    const { data } = await api.get<{ data: EventoCita[] }>(`/citas/${id}/historial`, {
      params: { per_page: 100 },
    });
    return data.data;
  },
};
