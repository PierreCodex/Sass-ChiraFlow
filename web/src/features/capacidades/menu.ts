import type { MenuitemsType } from "@/layout/vertical/sidebar/MenuItems";
import { puedeVer, type Capacidades } from "./types";

/**
 * El menú que le toca a quien está mirando.
 *
 * Vive aquí y no en `MenuItems.ts` a propósito: allí están los datos —qué
 * pantallas hay y cómo se llaman— y aquí la decisión de quién ve qué. Mezclarlo
 * haría que añadir una entrada al menú obligara a pensar en permisos.
 *
 * Y conviene repetirlo porque es fácil de olvidar: **esconder una opción no es
 * autorización**. El backend responde 403 igual si alguien escribe la URL. Esto
 * sirve para no enseñar puertas cerradas, no para cerrarlas.
 */
export function filtrarMenu(
  items: MenuitemsType[],
  capacidades: Capacidades | undefined
): MenuitemsType[] {
  /*
    Sin capacidades todavía —la primera carga— se devuelve el menú entero.

    Es lo contrario de lo que se hace en un botón, y por una razón: aquí el
    menú es la única forma de moverse, y esconderlo medio segundo dejaría al
    usuario mirando una barra vacía en cada recarga. Un enlace de más durante
    ese instante lleva a una pantalla que dice «no tienes acceso», que es una
    consecuencia mucho más leve.
  */
  if (!capacidades) return items;

  const visibles = items.filter((item) => {
    if (item.navlabel) return true;
    if (item.modulo && !puedeVer(capacidades, item.modulo)) return false;

    if (item.children) {
      const hijos = filtrarMenu(item.children, capacidades);
      // Un submenú sin hijos visibles es una flecha que no despliega nada.
      if (hijos.length === 0) return false;
      item.children = hijos;
    }

    return true;
  });

  return sinSeccionesVacias(visibles);
}

/**
 * Quita los separadores que se quedaron sin nada debajo.
 *
 * Un subheader es un rótulo, no un enlace: si «Operación» pierde sus tres
 * entradas, dejarlo pintaría una sección vacía que parece un fallo de carga.
 */
function sinSeccionesVacias(items: MenuitemsType[]): MenuitemsType[] {
  return items.filter((item, indice) => {
    if (!item.navlabel) return true;

    const siguiente = items
      .slice(indice + 1)
      .find((otro) => !otro.navlabel || otro.subheader);

    return !!siguiente && !siguiente.navlabel;
  });
}
