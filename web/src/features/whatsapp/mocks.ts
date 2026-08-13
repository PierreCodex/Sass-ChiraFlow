import type { PlantillaWhatsapp } from "./types";

export const plantillasMock: PlantillaWhatsapp[] = [
  {
    id: 1,
    nombre: "Confirmación de reserva",
    evento: "confirmacion",
    contenido:
      "¡Hola {{cliente}}! Tu reserva en {{negocio}} para {{servicio}} el {{fecha}} a las {{hora}} fue confirmada. Te esperamos en {{direccion}}.",
    activo: true,
  },
  {
    id: 2,
    nombre: "Recordatorio del día anterior",
    evento: "recordatorio",
    contenido:
      "Hola {{cliente}}, te recordamos tu cita de {{servicio}} con {{profesional}} el {{fecha}} a las {{hora}}. Si no puedes asistir, avísanos al {{telefono}}.",
    activo: true,
  },
  {
    id: 3,
    nombre: "Aviso de cancelación",
    evento: "cancelacion",
    contenido:
      "Hola {{cliente}}, tu reserva de {{servicio}} del {{fecha}} a las {{hora}} fue cancelada. Puedes reagendar en {{url_agenda}}.",
    activo: true,
  },
  {
    id: 4,
    nombre: "Agradecimiento post-atención",
    evento: "finalizado",
    contenido:
      "¡Gracias {{cliente}} por confiar en {{negocio}}! Cuéntanos cómo te fue con tu {{servicio}}. Síguenos en {{instagram}}.",
    activo: false,
  },
];
