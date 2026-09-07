import { usarMocksPara } from "@/lib/api/mocks";
import { api } from "@/lib/api/client";
import { delay } from "@/lib/mock-utils";
import { crearRecurso } from "@/lib/api/recurso";
import { rolesMock } from "@/features/roles/mocks";
import { profesionalesMock } from "../mocks";
import type {
  Profesional,
  ProfesionalPayload,
  ResumenPlanProfesionales,
} from "../types";

/**
 * Quien presta los servicios.
 *
 * Al revés que `/usuarios`, esto **no exige ser dueño**: dar de alta a un
 * barbero no reparte poder sobre el sistema, y el preset de Administrador
 * trae `empleados: gestionar` justo para esto.
 *
 * Sigue siendo multipart por la foto, que es lo único que sube.
 */
const recurso = crearRecurso<Profesional, ProfesionalPayload>({
  path: "profesionales",
  mocks: profesionalesMock,
  // El correo vive dentro de `usuario` y puede no existir, así que el buscador
  // en modo mock filtra por lo que toda ficha tiene. Con el backend real el
  // `search` sí cruza a la otra base para buscar por correo.
  camposBusqueda: ["nombre", "cargo"],
  enviarComoFormData: true,
  valoresPorDefecto: { activo: true, atiende: true, foto_url: null, usuario: null },
  /*
    El payload manda la casilla «darle acceso» como `usuario: {email, rol_id}`
    y la entidad devuelve la cuenta ya resuelta. Con el backend real lo hace el
    Resource; aquí se compone para que la tabla pinte el correo recién puesto.
  */
  alGuardarMock: (payload: ProfesionalPayload) => {
    const parche: Partial<Profesional> = {
      foto_url: payload.foto ? URL.createObjectURL(payload.foto) : undefined,
    };

    if (payload.usuario) {
      const rol = rolesMock.find((r) => r.id === payload.usuario!.rol_id);
      parche.usuario = {
        id: Date.now(),
        email: payload.usuario.email,
        activo: true,
        rol_id: payload.usuario.rol_id,
        rol: rol ? { id: rol.id, nombre: rol.nombre, clave: rol.clave } : null,
      };
    }

    return parche;
  },
});

export const profesionalesApi = {
  ...recurso,

  /**
   * Cupo del plan, para la tarjeta "Profesionales activos en tu plan · 3 de 5".
   *
   * El listado ya lo adjunta en `resumen`, junto a `data` y `meta`; este
   * endpoint se mantiene para que el formulario lo consulte sin recargar la
   * tabla.
   */
  resumenPlan: async (): Promise<ResumenPlanProfesionales> => {
    if (usarMocksPara("profesionales")) {
      await delay(200);
      // mockItems() y no profesionalesMock: así el contador refleja las altas
      // y bajas hechas durante la sesión.
      //
      // Cuenta las fichas ACTIVAS y nada más. Ni roles ni `atiende`: quien
      // está en esta tabla presta servicios, y punto. Una cuenta sin ficha
      // —la recepcionista— no aparece por aquí y no ocupa plaza.
      return {
        profesionales_activos: recurso.mockItems().filter((p) => p.activo).length,
        limite_profesionales: 5,
      };
    }
    const { data } = await api.get<{ data: ResumenPlanProfesionales }>(
      "/profesionales/resumen"
    );
    return data.data;
  },
};
