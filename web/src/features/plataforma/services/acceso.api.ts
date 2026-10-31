import { api } from "@/lib/api/client";
import type { SesionPlataforma } from "../sesion";

/**
 * Acceso al panel de plataforma contra Laravel (no es mock): contraseña y
 * después un código de 6 dígitos que llega por correo, de un solo uso.
 *
 * Rutas: `POST /plataforma/acceso/codigo` y `POST /plataforma/acceso/verificar`.
 */
export const accesoPlataformaApi = {
  pedirCodigo: async (email: string, password: string) => {
    const { data } = await api.post<{ message: string; minutos: number }>(
      "/plataforma/acceso/codigo",
      { email, password }
    );
    return data;
  },

  verificar: async (email: string, codigo: string): Promise<SesionPlataforma> => {
    const { data } = await api.post<{ data: SesionPlataforma }>(
      "/plataforma/acceso/verificar",
      { email, codigo }
    );
    return data.data;
  },
};
