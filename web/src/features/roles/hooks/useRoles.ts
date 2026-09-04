import { crearHooksRecurso } from "@/lib/query/recurso-hooks";
import { rolesApi } from "../services/roles.api";
import type { Rol, RolPayload } from "../types";

export const {
  keys: rolesKeys,
  useLista: useRolesPaginados,
  useTodos: useRoles,
  useDetalle: useRol,
  useCrear: useCrearRol,
  useActualizar: useActualizarRol,
  useEliminar: useEliminarRol,
} = crearHooksRecurso<Rol, RolPayload>("roles", rolesApi, { singular: "Rol" });
