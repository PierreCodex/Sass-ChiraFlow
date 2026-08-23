import { usarMocksPara } from "@/lib/api/mocks";
import { api } from "@/lib/api/client";
import { delay } from "@/lib/mock-utils";
import { crearRecurso } from "@/lib/api/recurso";
import { ROL_QUE_CONSUME_PLAN } from "../constants";
import { empleadosMock } from "../mocks";
import type {
  Empleado,
  EmpleadoPayload,
  ResumenPlanEmpleados,
} from "../types";

const recurso = crearRecurso<Empleado, EmpleadoPayload>({
  path: "empleados",
  mocks: empleadosMock,
  camposBusqueda: ["nombre", "usuario", "cargo"],
  // Sube la foto del profesional: no puede ir como JSON.
  enviarComoFormData: true,
  valoresPorDefecto: { activo: true, foto_url: null },
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
      return {
        profesionales_activos: recurso
          .mockItems()
          .filter((e) => e.rol === ROL_QUE_CONSUME_PLAN && e.activo).length,
        limite_profesionales: 5,
      };
    }
    const { data } = await api.get<{ data: ResumenPlanEmpleados }>(
      "/empleados/resumen"
    );
    return data.data;
  },
};
