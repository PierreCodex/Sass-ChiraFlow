import { crearRecurso } from "@/lib/api/recurso";
import { negociosMock } from "../mocks";
import type { NegocioResumen } from "../types";

/**
 * CRUD de negocios/tenants desde el superadmin. Espejo de
 * `SuperAdmin\NegocioController` en Laravel: mismo path, mismo filtro por
 * `estado` (activa/suspendida/prueba) además de la búsqueda por texto.
 */
export const negociosApi = crearRecurso<NegocioResumen>({
  path: "superadmin/negocios",
  mocks: negociosMock,
  camposBusqueda: ["nombre", "slug"],
  filtrosMock: (negocio, params) =>
    !params.estado || negocio.estado === params.estado,
});
