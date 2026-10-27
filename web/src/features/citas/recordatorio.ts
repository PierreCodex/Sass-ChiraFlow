import { formatFechaLarga } from "@/lib/format";
import { enlaceWhatsapp } from "@/lib/whatsapp";

import { nombreDeServicios, type Cita } from "./types";

interface Negocio {
  nombre: string;
  direccion: string | null;
}

/** El texto del recordatorio, tal como le llega al cliente. */
export function mensajeRecordatorio(cita: Cita, negocio: Negocio | null | undefined) {
  const nombre = cita.cliente_nombre.trim().split(/\s+/)[0] || "";
  const lineas = [
    `Hola ${nombre} 👋`,
    `Te recordamos tu cita${negocio?.nombre ? ` en *${negocio.nombre}*` : ""}:`,
    "",
    `📅 ${formatFechaLarga(cita.fecha)}`,
    `🕒 ${cita.hora_inicio}`,
    `💇 ${nombreDeServicios(cita)} con ${cita.empleado.nombre}`,
    negocio?.direccion ? `📍 ${negocio.direccion}` : null,
    `🔖 Código de reserva: ${cita.codigo}`,
    "",
    "Si no puedes venir, respóndenos por aquí para reprogramarla. ¡Te esperamos!",
  ];
  return lineas.filter((linea) => linea !== null).join("\n");
}

/**
 * El enlace para mandarlo, o `null` si no se puede: sin celular válido, o
 * con la cita ya cerrada (recordar una cita cancelada solo confunde).
 */
export function enlaceRecordatorio(cita: Cita, negocio: Negocio | null | undefined) {
  if (["cancelada", "completada", "no_asistio"].includes(cita.estado)) return null;
  return enlaceWhatsapp(cita.cliente_telefono, mensajeRecordatorio(cita, negocio));
}
