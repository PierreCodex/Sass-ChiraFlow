import { usarMocksPara } from "@/lib/api/mocks";
import { api } from "@/lib/api/client";
import { aFormData } from "@/lib/api/form-data";
import { delay } from "@/lib/mock-utils";
import { configuracionMock, zonasHorariasMock } from "../mocks";
import type {
  Configuracion,
  ConfiguracionPayload,
  RespuestaConfiguracion,
} from "../types";

let memoria: Configuracion = configuracionMock;

/** ¿Este parche lleva archivos? Decide JSON o multipart. */
function llevaArchivos(payload: ConfiguracionPayload): boolean {
  return payload.logo instanceof File || payload.cover instanceof File;
}

export const configuracionApi = {
  obtener: async (): Promise<RespuestaConfiguracion> => {
    if (usarMocksPara("configuracion")) {
      await delay(150);
      return { configuracion: memoria, zonasHorarias: zonasHorariasMock };
    }
    const { data } = await api.get<{
      data: Configuracion;
      zonas_horarias: string[];
    }>("/configuracion");

    return { configuracion: data.data, zonasHorarias: data.zonas_horarias };
  },

  /**
   * Guarda **solo lo que se le pasa**. Cada sección de Administración manda su
   * trozo y el backend toca únicamente las claves presentes.
   *
   * JSON cuando no hay archivos, y multipart solo cuando los hay. No es un
   * capricho: en multipart todo viaja como cadena, así que un `null` se
   * convierte en `""` y depende de que el backend lo vuelva a mapear a null
   * campo por campo. En JSON un null es un null. Se paga el multipart solo
   * donde hace falta —la sección de Marca, la única con logo y portada—, y sus
   * otros campos (los colores) nunca van vacíos.
   */
  guardar: async (payload: ConfiguracionPayload): Promise<Configuracion> => {
    if (usarMocksPara("configuracion")) {
      await delay();
      const { logo, cover, logo_eliminar, cover_eliminar, ...resto } = payload;

      memoria = {
        ...memoria,
        ...resto,
        logo_url: logo
          ? URL.createObjectURL(logo)
          : logo_eliminar
            ? null
            : memoria.logo_url,
        cover_url: cover
          ? URL.createObjectURL(cover)
          : cover_eliminar
            ? null
            : memoria.cover_url,
      };
      return memoria;
    }

    if (llevaArchivos(payload)) {
      // PHP no parsea multipart en PUT: se envía POST con _method=PUT.
      const { data } = await api.post<{ data: Configuracion }>(
        "/configuracion",
        aFormData({ ...payload, _method: "PUT" }),
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return data.data;
    }

    const { data } = await api.put<{ data: Configuracion }>(
      "/configuracion",
      payload
    );
    return data.data;
  },
};
