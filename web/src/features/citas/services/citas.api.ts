import { usarMocksPara } from "@/lib/api/mocks";
import { api } from "@/lib/api/client";
import { delay } from "@/lib/mock-utils";
import { crearRecurso } from "@/lib/api/recurso";
import { serviciosMock } from "@/features/servicios/mocks";
import { empleadosMock } from "@/features/empleados/mocks";
import { productosMock } from "@/features/inventario/mocks";
import type { Cita, CitaPayload } from "../types";
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
  // El payload manda ids; la entidad expone objetos y campos calculados.
  alGuardarMock: (payload: CitaPayload) => {
    const servicio = serviciosMock.find((s) => s.id === payload.servicio_id);
    const empleado = empleadosMock.find((e) => e.id === payload.empleado_id);

    return {
      servicio: servicio
        ? {
            id: servicio.id,
            nombre: servicio.nombre,
            duracion_min: servicio.duracion_min,
            precio: servicio.precio,
            color: servicio.color,
          }
        : undefined,
      empleado: empleado
        ? { id: empleado.id, nombre: empleado.nombre }
        : undefined,
      hora_fin: calcularHoraFin(
        payload.hora_inicio,
        servicio?.duracion_min ?? 30
      ),
      productos: (payload.productos ?? []).flatMap((linea) => {
        const producto = productosMock.find((p) => p.id === linea.id);
        if (!producto) return [];
        return [
          {
            producto_id: producto.id,
            nombre: producto.nombre,
            cantidad: linea.cantidad,
            precio_unitario: producto.precio_venta,
          },
        ];
      }),
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
};
