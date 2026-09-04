import type { ComponentType } from "react";

import PantallaProfesionales from "@/features/profesionales/components/PantallaProfesionales";
import PantallaUsuarios from "@/features/usuarios/components/PantallaUsuarios";

/**
 * El panel de cada sección, para las que ya lo tienen.
 *
 * `nav.ts` dice qué secciones existen y cómo se llaman; esto dice cuáles están
 * construidas. Van separados porque el índice se declaró entero de una vez y
 * los paneles llegan de uno en uno, según se conecta su módulo: la sección que
 * todavía no está aquí sigue pintando su aviso de «por maquetar» sin que haya
 * que tocar la página.
 *
 * La clave es `grupo/seccion`, los mismos slugs que forman la URL.
 */
const PANELES: Record<string, ComponentType> = {
  "equipo/usuarios": PantallaUsuarios,
  "equipo/empleados": PantallaProfesionales,
};

export function panelDeSeccion(
  grupo: string,
  seccion: string
): ComponentType | null {
  return PANELES[`${grupo}/${seccion}`] ?? null;
}
