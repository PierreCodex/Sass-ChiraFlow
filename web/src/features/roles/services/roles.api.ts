import { crearRecurso } from "@/lib/api/recurso";
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
