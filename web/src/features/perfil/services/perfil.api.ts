import { api } from "@/lib/api/client";
import { usarMocksPara } from "@/lib/api/mocks";
import type { ApiResource } from "@/lib/api/types";
import { delay } from "@/lib/mock-utils";
import type { Usuario } from "@/features/auth/services/auth.api";
import type { PasswordPayload, PerfilPayload } from "../types";

/**
 * Mi perfil **lee de verdad aunque el módulo esté en mocks**: `GET /user`
 * existe desde el Sprint 0 y lo sirve `useUsuarioActual`. Lo que todavía no
 * existe en Laravel es la escritura (`PUT /user`, `PUT /user/password`), así
 * que solo eso tiene rama mock.
 */
export const perfilApi = {
  actualizar: async (payload: PerfilPayload): Promise<Usuario> => {
    if (usarMocksPara("perfil")) {
      await delay();
      const { data } = await api.get<ApiResource<Usuario>>("/user");
      return {
        ...data.data,
        name: `${payload.nombre} ${payload.apellido}`.trim(),
        nombre: payload.nombre,
        apellido: payload.apellido,
        telefono: payload.telefono,
        documento: payload.documento,
        avatar_url: payload.foto,
      };
    }

    const { data } = await api.put<ApiResource<Usuario>>("/user", payload);
    return data.data;
  },

  cambiarPassword: async (payload: PasswordPayload): Promise<void> => {
    if (usarMocksPara("perfil")) {
      await delay();
      return;
    }

    await api.put("/user/password", payload);
  },
};
