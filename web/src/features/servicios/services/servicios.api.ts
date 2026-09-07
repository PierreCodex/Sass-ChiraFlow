import { crearRecurso } from "@/lib/api/recurso";
import { categoriasMock } from "@/features/categorias/mocks";
import { profesionalesMock } from "@/features/profesionales/mocks";
import type { ImagenGaleria, Servicio, ServicioPayload } from "../types";
import { serviciosMock } from "../mocks";

/**
 * id → url de las fotos de la galería, **solo para el modo mock**: el payload
 * viaja con ids (`galeria_conservar`) y sin esto no habría forma de volver a
 * pintar la foto que el usuario conservó. Con el backend real lo resuelve el
 * API Resource, que emite `{ id, url }` ya montado.
 */
const galeriaMock = new Map<number, string>(
  serviciosMock.flatMap((s) => s.galeria.map((img): [number, string] => [img.id, img.url]))
);

let siguienteIdGaleria = Math.max(0, ...galeriaMock.keys()) + 1;

const registrarMock = (url: string): ImagenGaleria => {
  const imagen = { id: siguienteIdGaleria++, url };
  galeriaMock.set(imagen.id, url);
  return imagen;
};

export const serviciosApi = crearRecurso<Servicio, ServicioPayload>({
  path: "servicios",
  mocks: serviciosMock,
  camposBusqueda: ["nombre"],
  // El formulario sube imágenes: no puede ir como JSON.
  enviarComoFormData: true,
  valoresPorDefecto: { activo: true },
  /*
   * El payload manda ids y archivos; la entidad expone objetos y URLs.
   *
   * Cada campo se traduce **solo si viene**: el switch de la tabla guarda un
   * payload parcial (sin `categoria_id` ni `empleado_ids`), y devolver los
   * valores vacíos borraría de la fila lo que el switch ni siquiera tocó.
   */
  alGuardarMock: (payload: Partial<ServicioPayload>) => {
    const parcial: Partial<Servicio> = {};

    if ("categoria_id" in payload) {
      const categoria = categoriasMock.find((c) => c.id === payload.categoria_id);
      parcial.categoria = categoria
        ? { id: categoria.id, nombre: categoria.nombre }
        : null;
    }

    if ("empleado_ids" in payload) {
      parcial.empleados = profesionalesMock
        .filter((e) => payload.empleado_ids?.includes(e.id))
        .map((e) => ({ id: e.id, nombre: e.nombre }));
    }

    if (payload.imagen_principal) {
      parcial.imagen_principal = URL.createObjectURL(payload.imagen_principal);
    }

    if ("galeria" in payload || "galeria_conservar" in payload) {
      parcial.galeria = [
        ...(payload.galeria_conservar ?? []).flatMap((id) => {
          const url = galeriaMock.get(id);
          return url ? [{ id, url }] : [];
        }),
        ...(payload.galeria ?? []).map((file) =>
          registrarMock(URL.createObjectURL(file))
        ),
      ];
    }

    return parcial;
  },
});
