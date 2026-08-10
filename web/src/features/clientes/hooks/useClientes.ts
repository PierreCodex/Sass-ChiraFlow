import { crearHooksRecurso } from "@/lib/query/recurso-hooks";
import type { Cliente, ClientePayload } from "../types";
import { clientesApi } from "../services/clientes.api";

export const {
  keys: clientesKeys,
  useLista: useClientes,
  useTodos: useTodosLosClientes,
  useDetalle: useCliente,
  useCrear: useCrearCliente,
  useActualizar: useActualizarCliente,
  useEliminar: useEliminarCliente,
} = crearHooksRecurso<Cliente, ClientePayload>("clientes", clientesApi);
