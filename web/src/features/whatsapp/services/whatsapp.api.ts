import { env } from "@/config/env";
import { crearRecurso } from "@/lib/api/recurso";
import { DATOS_MUESTRA, enlaceWhatsapp, renderizarPlantilla } from "../constants";
import type {
  PlantillaWhatsapp,
  PlantillaWhatsappPayload,
  PruebaWhatsappPayload,
} from "../types";
import { plantillasMock } from "../mocks";

const recurso = crearRecurso<PlantillaWhatsapp, PlantillaWhatsappPayload>({
  path: "plantillas-whatsapp",
  mocks: plantillasMock,
  camposBusqueda: ["nombre", "contenido"],
  valoresPorDefecto: { activo: true },
});

export const plantillasWhatsappApi = {
  ...recurso,

  /**
   * `PlantillaWhatsappController::store` hace
   * `updateOrCreate(['negocio_id', 'evento'])`: la tabla tiene índice único
   * por (negocio, evento), así que crear una plantilla para un evento que ya
   * existe **la reemplaza**. El mock hace lo mismo para no dar una falsa
   * sensación de que se pueden acumular.
   */
  create: async (payload: PlantillaWhatsappPayload) => {
    // Con el backend real esto lo resuelve Laravel: se envía POST y ya.
    if (!env.usarMocks) return recurso.create(payload);

    const previa = recurso
      .mockItems()
      .find((item) => item.evento === payload.evento);

    return previa
      ? recurso.update(previa.id, payload)
      : recurso.create(payload);
  },

  /**
   * Abre WhatsApp con el mensaje ya renderizado con los datos de muestra.
   *
   * En Laravel es `POST /plantillas-whatsapp/enviar-prueba`, que hace un
   * `redirect()->away()` a api.whatsapp.com. Redirigir la SPA entera para eso
   * sería absurdo: el enlace se arma en el cliente y se abre en otra pestaña.
   * La plantilla del enlace es idéntica (`WhatsAppMensajeService::enlace`).
   */
  enviarPrueba: ({ telefono, contenido }: PruebaWhatsappPayload) => {
    const mensaje = renderizarPlantilla(contenido, DATOS_MUESTRA);
    const url = enlaceWhatsapp(telefono, mensaje);
    if (url === "#") throw new Error("El teléfono no tiene dígitos válidos.");
    window.open(url, "_blank", "noopener,noreferrer");
  },
};
