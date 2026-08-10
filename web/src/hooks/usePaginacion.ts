"use client";
import { useMemo, useState } from "react";
import type { ListParams } from "@/lib/api/types";

/**
 * Estado de paginación + búsqueda de una tabla.
 * `params` ya viene con la página en base 1, como la espera Laravel.
 */
export function usePaginacion(perPageInicial = 10) {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(perPageInicial);
  const [search, setSearch] = useState("");

  const params: ListParams = useMemo(
    () => ({
      page: page + 1,
      per_page: perPage,
      search: search.trim() || undefined,
    }),
    [page, perPage, search]
  );

  function buscar(texto: string) {
    setSearch(texto);
    setPage(0); // volver al inicio al cambiar el filtro
  }

  return { page, perPage, search, setPage, setPerPage, buscar, params };
}
