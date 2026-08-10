import type { ListParams, Paginated } from "@/lib/api/types";

/** Simula latencia de red para ver los estados de carga reales. */
export function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Filtra por texto y pagina una colección en memoria, devolviendo exactamente
 * la misma forma que `->paginate()` de Laravel.
 */
export function paginar<T extends Record<string, any>>(
  items: T[],
  params: ListParams = {},
  camposBusqueda: (keyof T)[] = []
): Paginated<T> {
  const page = params.page ?? 1;
  const perPage = params.per_page ?? 10;
  const search = params.search?.trim().toLowerCase();

  const filtrados =
    search && camposBusqueda.length
      ? items.filter((item) =>
          camposBusqueda.some((campo) =>
            String(item[campo] ?? "").toLowerCase().includes(search)
          )
        )
      : items;

  const total = filtrados.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const desde = (page - 1) * perPage;
  const data = filtrados.slice(desde, desde + perPage);

  return {
    data,
    links: { first: null, last: null, prev: null, next: null },
    meta: {
      current_page: page,
      from: total ? desde + 1 : null,
      last_page: lastPage,
      path: "",
      per_page: perPage,
      to: total ? Math.min(desde + perPage, total) : null,
      total,
    },
  };
}

/** Fecha ISO de hace `n` días (o dentro de `n` días si es negativo). */
export function haceDias(n: number) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - n);
  return fecha.toISOString().slice(0, 10);
}

/** Entero pseudo-aleatorio estable por índice, para que no cambie en cada render. */
export function pseudoAleatorio(semilla: number, min: number, max: number) {
  const x = Math.sin(semilla * 9973) * 10000;
  const fraccion = x - Math.floor(x);
  return Math.floor(fraccion * (max - min + 1)) + min;
}
