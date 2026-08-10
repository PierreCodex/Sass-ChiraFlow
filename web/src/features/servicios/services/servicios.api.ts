import { crearRecurso } from "@/lib/api/recurso";
import { categoriasMock } from "@/features/categorias/mocks";
import { empleadosMock } from "@/features/empleados/mocks";
import type { Servicio, ServicioPayload } from "../types";
import { serviciosMock } from "../mocks";

export const serviciosApi = crearRecurso<Servicio, ServicioPayload>({
  path: "servicios",
  mocks: serviciosMock,
  camposBusqueda: ["nombre"],
  // El formulario sube imágenes: no puede ir como JSON.
  enviarComoFormData: true,
  valoresPorDefecto: { activo: true },
  // El payload manda ids y archivos; la entidad expone objetos y URLs.
  alGuardarMock: (payload: ServicioPayload) => {
    const categoria = categoriasMock.find((c) => c.id === payload.categoria_id);

    return {
      categoria: categoria
        ? { id: categoria.id, nombre: categoria.nombre }
        : null,
      empleados: empleadosMock
        .filter((e) => payload.empleado_ids?.includes(e.id))
        .map((e) => ({ id: e.id, nombre: e.nombre })),
      imagen_principal: payload.imagen_principal
        ? URL.createObjectURL(payload.imagen_principal)
        : null,
      galeria: [
        ...(payload.galeria_conservar ?? []),
        ...(payload.galeria ?? []).map((file) => URL.createObjectURL(file)),
      ],
    };
  },
});
