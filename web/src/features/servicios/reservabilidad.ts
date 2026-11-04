import type { Servicio } from "./types";

/** Solo redacta los datos de la API: no reproduce la regla de reservas. */
export function avisoReservabilidad(servicio: Servicio) {
  if (!servicio.activo) return null;
  const { reservable, sedes_sin_quien_lo_preste: sedes } = servicio.reservabilidad;
  if (reservable && sedes.length === 0) return null;

  const nombres = new Intl.ListFormat("es", { type: "conjunction" }).format(
    sedes.map((sede) => sede.nombre)
  );
  return {
    titulo: reservable ? "Faltan profesionales en algunas sedes" : "No se puede reservar",
    etiqueta: reservable ? "Revisar sedes" : "No reservable",
    detalle: sedes.length
      ? `Nadie que preste este servicio atiende en ${nombres}. Asigna un profesional activo que lo preste y atienda, y habilítalo en esas sedes.`
      : "Asigna un profesional activo que preste este servicio y atienda. Si tienes sedes, comprueba que el servicio se ofrezca y el profesional esté habilitado en alguna de ellas.",
  };
}
