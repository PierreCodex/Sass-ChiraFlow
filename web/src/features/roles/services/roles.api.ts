import { api } from "@/lib/api/client";
import { usarMocksPara } from "@/lib/api/mocks";
import { delay } from "@/lib/mock-utils";
import { crearRecurso } from "@/lib/api/recurso";
import { MODULOS } from "@/features/capacidades/types";
import { rolesMock } from "../mocks";
import type { Rol, RolPayload } from "../types";

/**
 * `GET /api/roles` lo puede leer cualquier usuario del negocio —el select de
 * rol tiene que funcionarle al administrador, que sí da altas—, pero
 * `POST`/`PUT`/`DELETE` responden **403** a quien no sea el dueño: si un
 * administrador pudiera crear roles, se haría uno con todo marcado y se lo
 * asignaría.
 */
export const rolesApi = crearRecurso<Rol, RolPayload>({
  path: "roles",
  mocks: rolesMock,
  camposBusqueda: ["nombre"],
});

/**
 * El listado **con la lista de módulos**, que viaja fuera de `data`.
 *
 * Hace falta un método propio porque `crearRecurso` solo devuelve `data`: la
 * pantalla de Roles necesita además `modulos`, que es la lista completa y
 * ordenada para las filas de la matriz.
 *
 * Se usa la del servidor y no la constante local a propósito: el día que el
 * backend añada un módulo, la matriz lo pinta sola. La constante solo entra
 * en modo mock.
 */
export async function listarRolesConModulos(): Promise<{
  roles: Rol[];
  modulos: string[];
}> {
  if (usarMocksPara("roles")) {
    await delay(200);
    return { roles: rolesApi.mockItems(), modulos: [...MODULOS] };
  }

  const { data } = await api.get<{ data: Rol[]; modulos: string[] }>("/roles", {
    params: { per_page: 200 },
  });

  return { roles: data.data, modulos: data.modulos };
}
