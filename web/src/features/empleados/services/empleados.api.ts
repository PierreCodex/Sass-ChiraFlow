import { usarMocksPara } from "@/lib/api/mocks";
import { api } from "@/lib/api/client";
import { delay } from "@/lib/mock-utils";
import { crearRecurso } from "@/lib/api/recurso";
import { rolesMock } from "@/features/roles/mocks";
import { empleadosMock } from "../mocks";
import type {
  Empleado,
  EmpleadoPayload,
  ResumenPlanEmpleados,
} from "../types";

const recurso = crearRecurso<Empleado, EmpleadoPayload>({
  path: "empleados",
  mocks: empleadosMock,
  camposBusqueda: ["nombre", "email", "cargo"],
  // Sube la foto del profesional: no puede ir como JSON.
  enviarComoFormData: true,
  valoresPorDefecto: { activo: true, atiende: true, foto_url: null },
  // El payload manda `rol_id` y `email`; la entidad devuelve el rol resuelto y
  // el `usuario` con el correo dentro. Con el backend real lo hace el Resource.
  alGuardarMock: (payload: EmpleadoPayload) => {
    const rol = rolesMock.find((r) => r.id === payload.rol_id);
    return {
      usuario: payload.email,
      foto_url: payload.foto ? URL.createObjectURL(payload.foto) : undefined,
      rol: rol
        ? { id: rol.id, nombre: rol.nombre, clave: rol.clave }
        : undefined,
    };
  },
});

export const empleadosApi = {
  ...recurso,

  /**
   * Cupo de profesionales del plan, para la tarjeta "Profesionales activos en
   * tu plan · 3 de 5".
   *
   * Alternativa si prefieres ahorrarte la request: devolverlo dentro de
   * `GET /api/empleados` con `->additional(['resumen' => [...]])`.
   */
  resumenPlan: async (): Promise<ResumenPlanEmpleados> => {
    if (usarMocksPara("empleados")) {
      await delay(200);
      // mockItems() y no empleadosMock: así el contador refleja las altas
      // y bajas hechas durante la sesión.
      //
      // Cuenta a quien está activo Y atiende, no por rol: los usuarios del
      // panel son ilimitados y los profesionales no, así que el dueño
      // también ocupa su plaza y una recepcionista sin agenda no ocupa
      // ninguna.
      return {
        profesionales_activos: recurso
          .mockItems()
          .filter((e) => e.activo && e.atiende).length,
        limite_profesionales: 5,
      };
    }
    const { data } = await api.get<{ data: ResumenPlanEmpleados }>(
      "/empleados/resumen"
    );
    return data.data;
  },
};
