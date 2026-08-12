import { crearRecurso } from "@/lib/api/recurso";
import type { Local, LocalPayload } from "../types";
import { localesMock } from "../mocks";

export const localesApi = crearRecurso<Local, LocalPayload>({
  path: "locales",
  mocks: localesMock,
  camposBusqueda: ["nombre", "direccion"],
  // Sube banner y logo: no puede ir como JSON.
  enviarComoFormData: true,
  valoresPorDefecto: { es_principal: false, banner_url: null, logo_url: null },
  // El payload manda archivos; la entidad expone URLs.
  alGuardarMock: (payload: LocalPayload) => ({
    banner_url: payload.banner ? URL.createObjectURL(payload.banner) : null,
    logo_url: payload.logo ? URL.createObjectURL(payload.logo) : null,
  }),
});
