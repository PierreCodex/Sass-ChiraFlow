import type { EstadoCita } from "./types";

type ColorChip = "primary" | "warning" | "info" | "success" | "error" | "default";

/**
 * Etiqueta y color de cada estado. Única fuente de verdad para toda la app.
 *
 * Los seis del ENUM real de la tabla `citas`. Eran cuatro hasta el 2026-09-06:
 * `en_curso` y `no_asistio` existían en la base desde el principio.
 *
 * Sobre los colores, que no son decorativos:
 *
 * - **El rojo es para `no_asistio`, no para `cancelada`.** Cancelar es un
 *   desenlace ordenado —alguien avisó— y la inasistencia es la que cuesta
 *   dinero y la que mide Reportes. Con las dos en rojo, el color dejaba de
 *   decir cuál de las dos hay que perseguir.
 * - `en_curso` se lleva el color del tema porque es el único que describe
 *   AHORA MISMO: en la lista del día es lo primero que se busca.
 */
export const ESTADOS_CITA: Record<
  EstadoCita,
  { label: string; color: ColorChip }
> = {
  pendiente: { label: "Pendiente", color: "warning" },
  confirmada: { label: "Confirmada", color: "info" },
  en_curso: { label: "En curso", color: "primary" },
  completada: { label: "Completada", color: "success" },
  cancelada: { label: "Cancelada", color: "default" },
  no_asistio: { label: "No asistió", color: "error" },
};

/** De dónde salió la reserva (columna `fuente` de la tabla `citas`). */
export const FUENTES_CITA: Record<string, string> = {
  web: "Web",
  panel: "Panel",
  publica: "Página pública",
};
