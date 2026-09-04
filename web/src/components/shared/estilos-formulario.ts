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

/**
 * Comportamiento de los diálogos en móvil: **hoja inferior**.
 *
 * Antes cada diálogo decidía por su cuenta con `fullScreen={pantallaChica}`,
 * y eso traía dos problemas:
 *
 * 1. **Espacio muerto.** El formulario de cliente son tres campos y ocupaba
 *    una pantalla de 844px con 450px en blanco. `fullScreen` mira el ancho de
 *    la pantalla, no lo que hay dentro.
 * 2. **No había cómo salir.** A pantalla completa no queda fondo que tocar y
 *    los diálogos no llevan aspa: para cerrar había que bajar hasta el botón
 *    "Cancelar", al final de un formulario largo.
 *
 * Anclado abajo, el diálogo **ocupa solo lo que necesita**: un formulario
 * corto deja ver el fondo (y se cierra tocándolo), y uno largo crece hasta el
 * 92% del alto y scrollea por dentro. Es el patrón que usa cualquier app
 * móvil, y vale igual para los 19 diálogos: se acabó decidirlo uno a uno.
 *
 * De `sm` hacia arriba no cambia nada: sigue centrado con su `maxWidth`.
 */
export const dialogoResponsive: SxProps<Theme> = (theme) => ({
  /*
   * Un hijo flex arranca con `min-height: auto`, así que **no encoge por
   * debajo de su contenido**. En un formulario largo eso empuja los botones
   * fuera del panel: en Profesionales se salían 8px y quedaban inalcanzables.
   *
   * Con `minHeight: 0` el contenido cede y scrollea, y la botonera se queda
   * anclada abajo. Vale para cualquier tamaño de pantalla, no solo móvil.
   */
  "& .MuiDialogContent-root": { minHeight: 0 },
  "& .MuiDialogActions-root": { flexShrink: 0 },

  [theme.breakpoints.down("sm")]: {
    "& .MuiDialog-container": { alignItems: "flex-end" },
    "& .MuiDialog-paper": {
      margin: 0,
      width: "100%",
      maxWidth: "100%",
      // `dvh` y no `vh`: con la barra del navegador, `100vh` se sale por abajo.
      maxHeight: "92dvh",
      borderRadius: "16px 16px 0 0",
    },
  },
});
