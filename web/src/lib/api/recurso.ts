import { api } from "@/lib/api/client";
import type { ApiResource, ListParams, Paginated } from "@/lib/api/types";
import { usarMocksPara } from "@/lib/api/mocks";
import { delay, paginar } from "@/lib/mock-utils";
import { aFormData } from "@/lib/api/form-data";

interface ConfigRecurso<T> {
  /** Ruta en Laravel, sin barra inicial. Ej: "clientes" -> /api/clientes */
  path: string;
  /**
   * Nombre del módulo para el interruptor de mocks. Por defecto el `path`,
   * que basta casi siempre; se pone a mano cuando no coinciden (`grupos`
   * pertenece a `locales`, `soporte/tickets` a `soporte`).
   */
  modulo?: string;
  /** Datos ficticios que se sirven mientras usarMocksPara(modulo) sea true. */
  mocks: T[];
  /** Campos sobre los que filtra el buscador en modo mock. */
  camposBusqueda?: (keyof T)[];
  /**
   * Campos calculados por el backend que el payload no trae (contadores,
   * fechas derivadas). Solo se usan en modo mock, al crear.
   */
  valoresPorDefecto?: Partial<T>;
  /**
   * Traduce el payload a la forma de la entidad cuando no coinciden — el caso
   * típico es enviar `categoria_id` y recibir `categoria` como objeto.
   * Solo modo mock: con el backend real esto lo resuelve el API Resource.
   */
  alGuardarMock?: (payload: any) => Partial<T>;
  /**
   * El formulario incluye archivos: create/update se envían como
   * multipart/form-data en vez de JSON.
   */
  enviarComoFormData?: boolean;
  /**
   * Filtros extra del listado (`estado`, `prioridad`…) en modo mock. Se aplica
   * antes de buscar y paginar. Con el backend real los mismos parámetros
   * viajan como query params y los resuelve Laravel.
   */
  filtrosMock?: (item: T, params: ListParams) => boolean;
}

/**
 * Genera el CRUD estándar de un recurso REST de Laravel.
 *
 * Mientras el módulo esté en modo mock, cada método responde con los datos
 * ficticios; al conectarlo, exactamente los mismos métodos pasan a pegarle a
 * la API sin tocar hooks ni componentes. Quién está conectado lo decide
 * `usarMocksPara()` — ver `lib/api/mocks.ts`.
 */
export function crearRecurso<T extends { id: number }, P = Partial<T>>(
  config: ConfigRecurso<T>
) {
  const {
    path,
    modulo = path,
    mocks,
    camposBusqueda = [],
    valoresPorDefecto = {},
    alGuardarMock,
    enviarComoFormData = false,
    filtrosMock,
  } = config;

  // Copia mutable: create/update/remove afectan a la sesión actual.
  let memoria = [...mocks];

  return {
    /**
     * Estado actual en memoria. **Solo modo mock**: sirve para que los
     * endpoints derivados (contadores, resúmenes) reflejen las altas y bajas
     * de la sesión. Con el backend real esto lo calcula Laravel.
     */
    mockItems: () => memoria,

    list: async (params: ListParams = {}): Promise<Paginated<T>> => {
      if (usarMocksPara(modulo)) {
        await delay();
        const filtrados = filtrosMock
          ? memoria.filter((item) => filtrosMock(item, params))
          : memoria;
        return paginar(filtrados, params, camposBusqueda);
      }
      const { data } = await api.get<Paginated<T>>(`/${path}`, { params });
      return data;
    },

    /** Colección completa sin paginar (para selects y filtros). */
    all: async (): Promise<T[]> => {
      if (usarMocksPara(modulo)) {
        await delay(200);
        return memoria;
      }
      const { data } = await api.get<ApiResource<T[]>>(`/${path}`, {
        params: { per_page: 200 },
      });
      return data.data;
    },

    get: async (id: number): Promise<T> => {
      if (usarMocksPara(modulo)) {
        await delay(200);
        const encontrado = memoria.find((item) => item.id === id);
        if (!encontrado) throw new Error("No encontrado");
        return encontrado;
      }
      const { data } = await api.get<ApiResource<T>>(`/${path}/${id}`);
      return data.data;
    },

    create: async (payload: P): Promise<T> => {
      if (usarMocksPara(modulo)) {
        await delay();
        const nuevo = {
          ...valoresPorDefecto,
          ...(payload as any),
          ...(alGuardarMock?.(payload) ?? {}),
          id: Math.max(0, ...memoria.map((i) => i.id)) + 1,
        } as T;
        memoria = [nuevo, ...memoria];
        return nuevo;
      }
      if (enviarComoFormData) {
        const { data } = await api.post<ApiResource<T>>(
          `/${path}`,
          aFormData(payload as any),
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        return data.data;
      }

      const { data } = await api.post<ApiResource<T>>(`/${path}`, payload);
      return data.data;
    },

    update: async (id: number, payload: Partial<P>): Promise<T> => {
      if (usarMocksPara(modulo)) {
        await delay();
        memoria = memoria.map((item) =>
          item.id === id
            ? ({
                ...item,
                ...(payload as any),
                ...(alGuardarMock?.(payload) ?? {}),
              } as T)
            : item
        );
        return memoria.find((item) => item.id === id)!;
      }
      if (enviarComoFormData) {
        // PHP no parsea multipart en PUT: se envía POST con _method=PUT.
        const { data } = await api.post<ApiResource<T>>(
          `/${path}/${id}`,
          aFormData({ ...(payload as any), _method: "PUT" }),
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        return data.data;
      }

      const { data } = await api.put<ApiResource<T>>(`/${path}/${id}`, payload);
      return data.data;
    },

    remove: async (id: number): Promise<void> => {
      if (usarMocksPara(modulo)) {
        await delay();
        memoria = memoria.filter((item) => item.id !== id);
        return;
      }
      await api.delete(`/${path}/${id}`);
    },
  };
}

export type Recurso<T extends { id: number }, P = Partial<T>> = ReturnType<
  typeof crearRecurso<T, P>
>;
