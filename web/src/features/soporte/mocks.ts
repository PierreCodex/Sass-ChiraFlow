import { haceDias } from "@/lib/mock-utils";
import type { Ticket } from "./types";

/** `haceDias` con hora, para poder ordenar por fecha de creación. */
function haceDiasALas(dias: number, hora: string) {
  return `${haceDias(dias)}T${hora}:00`;
}

export const ticketsMock: Ticket[] = [
  {
    id: 5,
    asunto: "No me llegan los recordatorios de WhatsApp",
    mensaje:
      "Desde el lunes las clientas dicen que no reciben el recordatorio del día anterior. En el panel las citas figuran confirmadas.",
    respuesta: null,
    estado: "abierto",
    prioridad: "alta",
    autor: "Ana Torres",
    respondido_por: null,
    creado_en: haceDiasALas(0, "09:12"),
    actualizado_en: haceDiasALas(0, "09:12"),
  },
  {
    id: 4,
    asunto: "¿Cómo cambio el horario de un profesional solo un día?",
    mensaje:
      "Carmen entra a las 11:00 los jueves de este mes, pero no quiero cambiarle el horario fijo. ¿Hay forma de hacerlo solo para esa fecha?",
    respuesta:
      "Sí. En Profesionales → editar → pestaña Horario, abajo tienes «Excepciones». Agrega la fecha y marca el horario especial de ese día; el horario semanal se mantiene igual.",
    estado: "cerrado",
    prioridad: "media",
    autor: "Ana Torres",
    respondido_por: "Equipo de soporte",
    creado_en: haceDiasALas(4, "16:40"),
    actualizado_en: haceDiasALas(3, "10:05"),
  },
  {
    id: 3,
    asunto: "Error al subir la galería de un servicio",
    mensaje:
      "Cuando subo la cuarta foto en «Blanqueamiento dental» se queda cargando y no guarda. Con tres fotos sí funciona.",
    respuesta:
      "Estamos revisándolo con el equipo técnico. Como solución temporal, sube las fotos de tres en tres y guarda entre medias.",
    estado: "en_proceso",
    prioridad: "media",
    autor: "Luis Peña",
    respondido_por: "Equipo de soporte",
    creado_en: haceDiasALas(8, "11:22"),
    actualizado_en: haceDiasALas(7, "09:30"),
  },
  {
    id: 2,
    asunto: "Quiero agregar un segundo local",
    mensaje:
      "Vamos a abrir una sede en San Isidro el mes que viene. ¿El plan actual me permite dos locales o tengo que subir de plan?",
    respuesta:
      "Tu plan actual incluye un local. Para el segundo necesitas el plan Profesional; puedes cambiarlo desde Mi Plan y la diferencia se prorratea.",
    estado: "cerrado",
    prioridad: "baja",
    autor: "Ana Torres",
    respondido_por: "Equipo de soporte",
    creado_en: haceDiasALas(15, "18:05"),
    actualizado_en: haceDiasALas(14, "08:50"),
  },
  {
    id: 1,
    asunto: "Solicito capacitación para el personal nuevo",
    mensaje:
      "Entran dos recepcionistas la próxima semana. ¿Tienen material o una sesión para enseñarles a usar el sistema?",
    respuesta:
      "Te enviamos la guía en PDF al correo de la cuenta. Si prefieren sesión en vivo, escríbenos y coordinamos media hora.",
    estado: "cerrado",
    prioridad: "baja",
    autor: "Ana Torres",
    respondido_por: "Equipo de soporte",
    creado_en: haceDiasALas(29, "12:15"),
    actualizado_en: haceDiasALas(28, "15:00"),
  },
];
