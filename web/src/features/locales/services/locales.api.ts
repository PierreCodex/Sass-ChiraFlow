import { crearRecurso } from "@/lib/api/recurso";
import { previsualizarSlug } from "@/features/onboarding/slug";
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
    ...(payload.slug ? { slug: payload.slug } : {}),
  }),
  /*
    Como el backend (Story 6.2): una sede nueva sin enlace lo deriva del nombre
    la primera vez y lo GUARDA (se escribe en el objeto de la memoria), para
    que renombrarla después no lo cambie.
  */
  alLeerMock: (local) => {
    if (!local.slug) local.slug = previsualizarSlug(local.nombre) || "sede";
    return local;
  },
});
