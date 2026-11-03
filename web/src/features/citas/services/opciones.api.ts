import { api } from "@/lib/api/client";
import { usarMocksPara } from "@/lib/api/mocks";
import { delay } from "@/lib/mock-utils";
import { clientesApi } from "@/features/clientes/services/clientes.api";
import { productosApi } from "@/features/inventario/services/inventario.api";
import { localesApi } from "@/features/locales/services/locales.api";
import { profesionalesApi } from "@/features/profesionales/services/profesionales.api";
import { saleEnAgenda } from "@/features/profesionales/types";
import { serviciosApi } from "@/features/servicios/services/servicios.api";
import {
  OPCIONES_POR_PAGINA,
  type ColeccionOpciones,
  type FiltroOpciones,
  type OpcionesPorColeccion,
  type PaginaOpciones,
} from "../opciones";

/** Con datos ficticios: la colección entera, ya proyectada como la del backend. */
async function coleccionMock<C extends ColeccionOpciones>(
  coleccion: C
): Promise<OpcionesPorColeccion[C][]> {
  switch (coleccion) {
    case "profesionales":
      return (await profesionalesApi.all()).filter(saleEnAgenda).map((p) => ({
        id: p.id,
        nombre: p.nombre,
        color: null,
        horario: p.horario,
        excepciones: p.excepciones,
        servicios: [],
      })) as unknown as OpcionesPorColeccion[C][];
    case "servicios":
      return (await serviciosApi.all())
        .filter((s) => s.activo !== false)
        .map((s) => ({ id: s.id, nombre: s.nombre, duracion_min: s.duracion_min, precio: s.precio })) as unknown as OpcionesPorColeccion[C][];
    case "locales":
      return (await localesApi.all()).map((l) => ({
        id: l.id,
        nombre: l.nombre,
        es_principal: l.es_principal,
      })) as unknown as OpcionesPorColeccion[C][];
    case "productos":
      return (await productosApi.all())
        .filter((p) => p.activo)
        .map((p) => ({ id: p.id, nombre: p.nombre, precio_venta: p.precio_venta, stock: p.stock })) as unknown as OpcionesPorColeccion[C][];
    default:
      return (await clientesApi.all()).map((c) => ({
        id: c.id,
        nombre: c.nombre,
        telefono: c.telefono,
        email: c.email,
      })) as unknown as OpcionesPorColeccion[C][];
  }
}

export const opcionesCitaApi = {
  /**
   * Una colección de `GET /citas/opciones`, filtrada en el servidor (Story
   * 1.10): `solo=` para no calcular las demás, `{coleccion}_search` para lo
   * que se escribe y `{coleccion}_ids` para lo ya elegido.
   *
   * Si el rol no puede ver la colección (p. ej. `clientes` sin permiso), el
   * backend no la incluye y aquí vuelve vacía: el formulario sigue sirviendo.
   */
  coleccion: async <C extends ColeccionOpciones>(
    coleccion: C,
    filtro: FiltroOpciones = {}
  ): Promise<OpcionesPorColeccion[C][]> => {
    const texto = filtro.search?.trim().toLowerCase() ?? "";

    if (usarMocksPara("citas")) {
      await delay(150);
      const todos = await coleccionMock(coleccion);
      return todos
        .filter((o) => (filtro.ids?.length ? filtro.ids.includes(o.id) : true))
        .filter((o) => (texto ? o.nombre.toLowerCase().includes(texto) : true))
        .slice(0, OPCIONES_POR_PAGINA);
    }

    const { data } = await api.get<{ data: Partial<{ [K in ColeccionOpciones]: PaginaOpciones<OpcionesPorColeccion[K]> }> }>(
      "/citas/opciones",
      {
        params: {
          solo: coleccion,
          per_page: OPCIONES_POR_PAGINA,
          ...(texto ? { [`${coleccion}_search`]: filtro.search!.trim() } : {}),
          ...(filtro.ids?.length ? { [`${coleccion}_ids`]: filtro.ids.join(",") } : {}),
        },
      }
    );
    return (data.data[coleccion]?.data ?? []) as unknown as OpcionesPorColeccion[C][];
  },
};
