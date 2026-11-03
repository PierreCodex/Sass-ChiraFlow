import { api } from "@/lib/api/client";
import type { ApiResource } from "@/lib/api/types";
import type { Usuario } from "@/features/auth/services/auth.api";
import type { PasswordPayload, PerfilPayload } from "../types";

/** Lectura y escrituras reales mediante el BFF; el navegador no recibe tokens. */
export const perfilApi = {
  actualizar: async (payload: PerfilPayload): Promise<Usuario> => {
    const { data } = await api.put<ApiResource<Usuario>>("/user", payload);
    return data.data;
  },

  cambiarPassword: async (payload: PasswordPayload): Promise<void> => {
    await api.put("/user/password", payload);
  },
};
