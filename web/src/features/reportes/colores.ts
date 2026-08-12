/**
 * Colores de las gráficas del reporte.
 *
 * Los dos períodos aparecen en dos gráficas distintas, así que el par tiene
 * que ser el mismo en ambas: si el "anterior" cambia de color entre gráficas,
 * la comparación deja de leerse.
 *
 * El par está **validado**, no elegido a ojo: separación en visión normal y en
 * los tres tipos de daltonismo, banda de luminosidad y contraste contra la
 * superficie. El modo oscuro usa su propio paso del mismo ramp coral (el
 * `#FA896B` del tema claro queda demasiado claro sobre `#171c23`), que es la
 * forma correcta de portar una paleta: re-escalonar, no invertir.
 *
 * Superficies usadas al validar: `#ffffff` en claro y `#2A3447` en oscuro —
 * el fondo real de las tarjetas, no el del `body`.
 *
 * | Par | Modo | ΔE normal | ΔE peor CVD |
 * |---|---|---|---|
 * | `#5D87FF` / `#FA896B` | claro | 31.1 | 24.0 (protan) |
 * | `#5D87FF` / `#E2674A` | oscuro | 30.9 | 26.1 (protan) |
 *
 * Descartados por el validador: azul + gris (ΔE 13.6, indistinguibles),
 * azul + violeta (contraste 2.6:1 en oscuro), azul + celeste (ΔE 14.4).
 */
export const COLORES_PERIODO = {
  light: { actual: "#5D87FF", anterior: "#FA896B" },
  dark: { actual: "#5D87FF", anterior: "#E2674A" },
} as const;

/**
 * Ramp secuencial del mapa de calor: **un solo tono**, de claro a oscuro.
 * Nunca un arcoíris — el color aquí codifica cantidad, no identidad.
 */
export const RAMPA_OCUPACION = {
  light: ["#F2F6FA", "#DCE6FF", "#A9C0FF", "#7BA0FF", "#5D87FF", "#4570EA"],
  dark: ["#222B3A", "#2C3A57", "#3A5289", "#4A6DC0", "#5D87FF", "#89A9FF"],
} as const;

export type ModoTema = "light" | "dark";
