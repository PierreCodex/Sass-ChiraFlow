import { usarMocksPara } from "@/lib/api/mocks";
import { api } from "@/lib/api/client";
import { delay } from "@/lib/mock-utils";
import { crearRecurso } from "@/lib/api/recurso";
import { empleadosMock } from "@/features/empleados/mocks";
import { saleEnAgenda } from "@/features/empleados/types";
import { serviciosMock } from "@/features/servicios/mocks";
import { localesMock } from "../mocks";
import { gruposMock, localProfesionalMock } from "../mocks-recursos";
import type {
  Grupo,
  GrupoPayload,
  LocalProfesional,
  LocalProfesionalPayload,
} from "../types";

// Copia mutable por local, para que los cambios se vean en la sesión.
const porLocal: Record<number, LocalProfesional[]> = Object.fromEntries(
  Object.entries(localProfesionalMock).map(([id, lista]) => [
    Number(id),
    lista.map((item) => ({ ...item })),
  ])
);

export const localProfesionalApi = {
  /** Profesionales del negocio con su configuración en `localId`. */
  lista: async (localId: number): Promise<LocalProfesional[]> => {
    if (usarMocksPara("locales")) {
      await delay(250);
      return porLocal[localId] ?? [];
    }
    const { data } = await api.get<{ data: LocalProfesional[] }>(
      `/locales/${localId}/profesionales`
    );
    return data.data;
  },

  /**
   * Crea o actualiza la fila de `local_profesional`.
   *
   * En Laravel es `syncWithoutDetaching`, así que sirve igual para asignar por
   * primera vez que para editar (`LocalProfesionalController::update`).
   */
  actualizar: async (
    localId: number,
    profesionalId: number,
    payload: LocalProfesionalPayload
  ): Promise<LocalProfesional> => {
    if (usarMocksPara("locales")) {
      await delay();
      const lista = porLocal[localId] ?? [];
      const indice = lista.findIndex((item) => item.id === profesionalId);
      if (indice === -1) throw new Error("Profesional no encontrado");

      lista[indice] = { ...lista[indice], ...payload };
      return lista[indice];
    }
    const { data } = await api.put<{ data: LocalProfesional }>(
      `/locales/${localId}/profesionales/${profesionalId}`,
      // El backend espera el horario anidado: horario[apertura] / horario[cierre].
      {
        habilitado: payload.habilitado,
        nombre_publico: payload.nombre_publico,
        perfil: payload.perfil,
        horario: {
          apertura: payload.horario_apertura,
          cierre: payload.horario_cierre,
        },
      }
    );
    return data.data;
  },
};

export const gruposApi = crearRecurso<Grupo, GrupoPayload>({
  path: "grupos",
  modulo: "locales",
  mocks: gruposMock,
  camposBusqueda: ["nombre"],
  // El payload manda ids; la entidad expone objetos con nombre.
  alGuardarMock: (payload: GrupoPayload) => ({
    locales: aNombres(localesMock, payload.locales),
    profesionales: aNombres(profesionalesMock, payload.profesionales),
    servicios: aNombres(serviciosMock, payload.servicios),
  }),
});

/** Profesionales del negocio: los que se pueden asignar a un local o grupo. */
export const profesionalesMock = empleadosMock
  .filter(saleEnAgenda)
  .map((empleado) => ({ id: empleado.id, nombre: empleado.nombre }));

function aNombres<T extends { id: number; nombre: string }>(
  fuente: T[],
  ids: number[]
) {
  return fuente
    .filter((item) => ids.includes(item.id))
    .map((item) => ({ id: item.id, nombre: item.nombre }));
}
