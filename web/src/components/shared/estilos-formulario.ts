import type { SxProps, Theme } from "@mui/material/styles";

/**
 * Compacta los formularios dentro de un diálogo.
 *
 * `CustomFormLabel` de la plantilla trae `margin-top: 25px` fijo, pensado para
 * formularios de página completa. Dentro de un modal, ese margen sumado al
 * `spacing` de la grilla deja ~40px muertos antes de cada campo: un formulario
 * de 10 campos crece 250px de más y acaba con scroll.
 *
 * Aquí el espaciado lo pone el Grid y solo el Grid.
 */
export const formularioCompacto: SxProps<Theme> = {
  "& label": { marginTop: 0 },
};
