import { api } from "@/lib/api/client";
import type { ApiResource } from "@/lib/api/types";

/**
 * El WhatsApp de la persona para los avisos del equipo (Story 4.8b, contrato
 * § Avisos por WhatsApp del equipo). Siempre el de quien mira.
 */
export interface WhatsappEquipo {
  telefono: string;
  estado: "pendiente" | "activo";
  /** Solo en pendiente. */
  codigo: string | null;
  codigo_vence_at: string | null;
  /** El número del equipo de la plataforma, o null si aún no hay uno activo. */
  numero_plataforma: string | null;
  /** wa.me con «ACTIVAR <código>» ya escrito; null sin número o ya activo. */
  enlace: string | null;
  activado_at: string | null;
}

export const whatsappApi = {
  ver: async (): Promise<WhatsappEquipo | null> => {
    const { data } = await api.get<ApiResource<WhatsappEquipo | null>>("/user/whatsapp");
    return data.data;
  },

  guardar: async (telefono: string): Promise<WhatsappEquipo> => {
    const { data } = await api.put<ApiResource<WhatsappEquipo>>("/user/whatsapp", { telefono });
    return data.data;
  },

  quitar: async (): Promise<void> => {
    await api.delete("/user/whatsapp");
  },
};
