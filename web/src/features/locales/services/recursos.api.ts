import { usarMocksPara } from "@/lib/api/mocks";
import { api } from "@/lib/api/client";
import { delay } from "@/lib/mock-utils";
import { crearRecurso } from "@/lib/api/recurso";
import { profesionalesMock as fichasProfesionales } from "@/features/profesionales/mocks";
import { profesionalesApi } from "@/features/profesionales/services/profesionales.api";
import { saleEnAgenda } from "@/features/profesionales/types";
import { serviciosMock } from "@/features/servicios/mocks";
import { localesMock } from "../mocks";
import { gruposMock, localProfesionalMock } from "../mocks-recursos";
import type {
  Grupo,
  GrupoPayload,
  LocalProfesional,
  LocalProfesionalPayload,
} from "../types";

// Estado compartido con la reservabilidad mock de los servicios.
const porLocal = localProfesionalMock;

function filasProfesionalesMock(localId: number): LocalProfesional[] {
  return profesionalesApi.mockItems().map((profesional) => ({
    id: profesional.id,
    habilitado: false,
    nombre_publico: null,
    perfil: null,
    horario_apertura: null,
    horario_cierre: null,
    ...porLocal[localId]?.find((fila) => fila.id === profesional.id),
    // Nombre y foto actuales incluso después de editar al profesional.
    nombre: profesional.nombre,
    foto_url: profesional.foto_url,
  }));
}

export const localProfesionalApi = {
  /** Profesionales del negocio con su configuración en `localId`. */
  lista: async (localId: number): Promise<LocalProfesional[]> => {
    if (usarMocksPara("locales")) {
      await delay(250);
      return filasProfesionalesMock(localId);
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
      const lista = filasProfesionalesMock(localId);
      const indice = lista.findIndex((item) => item.id === profesionalId);
      if (indice === -1) throw new Error("Profesional no encontrado");

      /*
        `undefined` no pisa: el mock tiene que comportarse como el parche del
        backend, o el interruptor parecería funcionar aquí y borraría datos
        al conectar.
      */
      const parche = Object.fromEntries(
        Object.entries(payload).filter(([, valor]) => valor !== undefined)
      );

      lista[indice] = { ...lista[indice], ...parche };
      // Conservar también las asignaciones de profesionales inactivos: al
      // darlos de alta otra vez recuperan la configuración de sus sedes.
      porLocal[localId] = [
        ...(porLocal[localId] ?? []).filter((fila) => fila.id !== profesionalId),
        lista[indice],
      ];
      return lista[indice];
    }
    const { horario_apertura, horario_cierre, ...resto } = payload;

    /*
      Solo lo que llega. El backend hace `syncWithoutDetaching` y toca
      únicamente las claves presentes, así que el interruptor puede mandar
      `{habilitado}` a secas sin llevarse por delante el nombre público ni el
      perfil de esa sede.

      El horario viaja anidado —`horario[apertura]`, `horario[cierre]`— porque
      así lo valida Laravel, y plano de vuelta. Solo se incluye si el
      formulario lo tocó: mandarlo vacío desde el interruptor borraría el
      horario que hubiera puesto el modal.
    */
    const cuerpo: Record<string, unknown> = { ...resto };

    if (horario_apertura !== undefined || horario_cierre !== undefined) {
      cuerpo.horario = {
        apertura: horario_apertura ?? null,
        cierre: horario_cierre ?? null,
      };
    }

    const { data } = await api.put<{ data: LocalProfesional }>(
      `/locales/${localId}/profesionales/${profesionalId}`,
      cuerpo
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
export const profesionalesMock = fichasProfesionales
  .filter(saleEnAgenda)
  .map((profesional) => ({ id: profesional.id, nombre: profesional.nombre }));

function aNombres<T extends { id: number; nombre: string }>(
  fuente: T[],
  ids: number[]
) {
  return fuente
    .filter((item) => ids.includes(item.id))
    .map((item) => ({ id: item.id, nombre: item.nombre }));
}
