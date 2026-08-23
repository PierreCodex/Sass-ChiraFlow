import { api } from "@/lib/api/client";
import type { ApiResource } from "@/lib/api/types";
import type { Onboarding } from "../types";

export interface NombreFijado {
  nombre: string;
  slug: string;
}

/**
 * Sin rama mock: el backend del onboarding existe desde el Sprint 0 y el
 * checklist no tiene sentido con datos ficticios — su gracia es reflejar lo
 * que el negocio ya hizo de verdad.
 */
export const onboardingApi = {
  obtener: async () => {
    const { data } = await api.get<ApiResource<Onboarding>>("/onboarding");
    return data.data;
  },

  /** Paso 1. Fija el nombre y, con él, el slug definitivo e inmutable. */
  fijarNombre: async (nombre: string) => {
    const { data } = await api.post<ApiResource<NombreFijado>>(
      "/onboarding/nombre",
      { nombre },
    );
    return data.data;
  },

  /** Solo para las claves marcables desde el cliente (hoy `sitio_publico`). */
  marcarPaso: async (clave: string) => {
    const { data } = await api.put<ApiResource<Onboarding>>(
      `/onboarding/pasos/${clave}`,
    );
    return data.data;
  },
};
