"use client";
import { useCallback, useMemo, useState } from "react";
import type { LineaCarrito, ServicioPublico } from "../types";
import { duracionCarrito, totalCarrito, unidadesCarrito } from "../types";

/**
 * Carrito de servicios de la tienda.
 *
 * Vive en memoria, no en la URL. La app actual lo guarda en la query string
 * (`?servicios[0][id]=…`) porque cada cambio recarga la página; aquí no hace
 * falta y evita URLs ilegibles.
 */
export function useCarrito() {
  const [lineas, setLineas] = useState<LineaCarrito[]>([]);

  const agregar = useCallback((servicio: ServicioPublico) => {
    setLineas((actuales) => {
      const existente = actuales.find(
        (linea) => linea.servicio.id === servicio.id
      );
      if (existente) {
        return actuales.map((linea) =>
          linea.servicio.id === servicio.id
            ? { ...linea, cantidad: linea.cantidad + 1 }
            : linea
        );
      }
      return [...actuales, { servicio, cantidad: 1 }];
    });
  }, []);

  /** Pone la cantidad exacta; 0 o menos quita la línea. */
  const cambiarCantidad = useCallback((servicioId: number, cantidad: number) => {
    setLineas((actuales) =>
      cantidad <= 0
        ? actuales.filter((linea) => linea.servicio.id !== servicioId)
        : actuales.map((linea) =>
            linea.servicio.id === servicioId
              ? { ...linea, cantidad: Math.min(50, cantidad) }
              : linea
          )
    );
  }, []);

  const quitar = useCallback((servicioId: number) => {
    setLineas((actuales) =>
      actuales.filter((linea) => linea.servicio.id !== servicioId)
    );
  }, []);

  const vaciar = useCallback(() => setLineas([]), []);

  const cantidadDe = useCallback(
    (servicioId: number) =>
      lineas.find((linea) => linea.servicio.id === servicioId)?.cantidad ?? 0,
    [lineas]
  );

  const totales = useMemo(
    () => ({
      unidades: unidadesCarrito(lineas),
      monto: totalCarrito(lineas),
      duracion: duracionCarrito(lineas),
    }),
    [lineas]
  );

  return {
    lineas,
    agregar,
    cambiarCantidad,
    quitar,
    vaciar,
    cantidadDe,
    ...totales,
  };
}
