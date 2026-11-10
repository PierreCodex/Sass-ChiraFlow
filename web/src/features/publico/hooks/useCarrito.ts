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
export interface CambiosCarrito {
  /** Nombres de los servicios que ya no se pueden reservar en la sede. */
  quitados: string[];
  /** Nombres de los que cambiaron de precio o de duración. */
  actualizados: string[];
}

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

  /**
   * Story 6.5: el catálogo se refresca mientras el cliente elige. Lo que ya
   * no está (oculto, desactivado, sin quien lo preste en la sede) sale de la
   * selección, y lo que cambió de precio o duración se pone al día. Devuelve
   * qué pasó, para decírselo. Si nada cambió, la selección no se toca (el
   * asistente se reinicia cuando cambian las líneas).
   */
  const sincronizar = useCallback(
    (catalogo: ServicioPublico[]): CambiosCarrito => {
      const vigente = new Map(catalogo.map((servicio) => [servicio.id, servicio]));
      const cambios: CambiosCarrito = { quitados: [], actualizados: [] };
      const siguientes: LineaCarrito[] = [];

      for (const linea of lineas) {
        const nuevo = vigente.get(linea.servicio.id);
        if (!nuevo) {
          cambios.quitados.push(linea.servicio.nombre);
        } else if (
          nuevo.precio !== linea.servicio.precio ||
          nuevo.duracion_min !== linea.servicio.duracion_min
        ) {
          cambios.actualizados.push(nuevo.nombre);
          siguientes.push({ ...linea, servicio: nuevo });
        } else {
          siguientes.push(linea);
        }
      }

      if (cambios.quitados.length || cambios.actualizados.length) {
        setLineas(siguientes);
      }
      return cambios;
    },
    [lineas]
  );

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
    sincronizar,
    cantidadDe,
    ...totales,
  };
}
