import { useQuery } from "@tanstack/react-query";
import { crearHooksRecurso } from "@/lib/query/recurso-hooks";
import { listarRolesConModulos, rolesApi } from "../services/roles.api";
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

/**
 * Lo que necesita la pantalla de Roles: los roles y la lista de módulos.
 *
 * Va aparte de `useRoles()` —que alimenta los selects— porque solo esta
 * pantalla necesita `modulos`, y pedirlo en todas partes sería arrastrar una
 * lista de catorce claves por cada desplegable de rol del panel.
 */
export function useRolesConModulos() {
  return useQuery({
    queryKey: [...rolesKeys.all, "con-modulos"],
    queryFn: listarRolesConModulos,
    staleTime: 5 * 60 * 1000,
  });
}
