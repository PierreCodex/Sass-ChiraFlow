import { api } from "@/lib/api/client";
import type { ApiResource, ListParams, Paginated } from "@/lib/api/types";
import type { Cliente, ClientePayload } from "../types";

/**
 * Única capa que conoce las URLs de Laravel para este módulo.
 * Los componentes nunca llaman a `api` directamente: usan los hooks.
 */
export const clientesApi = {
  list: async (params: ListParams = {}) => {
    const { data } = await api.get<Paginated<Cliente>>("/clientes", { params });
    return data;
  },

  get: async (id: number) => {
    const { data } = await api.get<ApiResource<Cliente>>(`/clientes/${id}`);
    return data.data;
  },

  create: async (payload: ClientePayload) => {
    const { data } = await api.post<ApiResource<Cliente>>("/clientes", payload);
    return data.data;
  },

  update: async (id: number, payload: Partial<ClientePayload>) => {
    const { data } = await api.put<ApiResource<Cliente>>(
      `/clientes/${id}`,
      payload
    );
    return data.data;
  },

  remove: async (id: number) => {
    await api.delete(`/clientes/${id}`);
  },
};
