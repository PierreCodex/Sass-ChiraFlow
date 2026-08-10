import type { Configuracion } from "./types";

export const configuracionMock: Configuracion = {
  agenda: {
    // Por defecto la agenda se encadena con la duración del servicio: es lo
    // que evita dejar huecos que nadie puede reservar.
    modo_intervalo: "duracion_servicio",
    intervalo_min: 15,
  },
};
