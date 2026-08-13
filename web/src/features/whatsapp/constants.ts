import type {
  EventoWhatsapp,
  GrupoVariables,
  PlantillaPredisenada,
} from "./types";

/** `PlantillaWhatsapp::eventos()`, tal cual. */
export const EVENTOS_WHATSAPP: Record<EventoWhatsapp, string> = {
  confirmacion: "Confirmación de reserva",
  recordatorio: "Recordatorio",
  cancelacion: "Cancelación",
  finalizado: "Trabajo finalizado / agradecimiento",
  bienvenida: "Mensaje de bienvenida",
  pago_linea: "Pago en línea",
  redes_sociales: "Mensaje para redes sociales",
  cumpleanos: "Descuento por cumpleaños",
  personalizado: "Personalizado",
};

/** `PlantillaWhatsapp::variables()`, agrupadas igual que en el formulario. */
export const GRUPOS_VARIABLES: GrupoVariables[] = [
  {
    titulo: "Datos de la reserva",
    variables: [
      { key: "cliente", label: "Nombre cliente" },
      { key: "apellido", label: "Apellido cliente" },
      { key: "profesional", label: "Profesional" },
      { key: "servicio", label: "Nombre servicio" },
      { key: "monto", label: "Precio reserva" },
      { key: "duracion", label: "Duración" },
      { key: "fecha", label: "Fecha reserva" },
      { key: "hora", label: "Hora reserva" },
    ],
  },
  {
    titulo: "Datos del local",
    variables: [
      { key: "negocio", label: "Nombre local" },
      { key: "direccion", label: "Ubicación local" },
      { key: "telefono", label: "Teléfono local" },
      { key: "email", label: "Email local" },
    ],
  },
  {
    titulo: "Datos de la compañía",
    variables: [
      { key: "url_agenda", label: "Sitio de agendamiento" },
      { key: "instagram", label: "Instagram" },
      { key: "facebook", label: "Facebook" },
      { key: "web", label: "Tu página web" },
    ],
  },
];

/**
 * `WhatsAppMensajeService::datosMuestra()`.
 *
 * Con el backend real esto debería venir del negocio de verdad; hoy son
 * valores fijos también en Laravel.
 */
export const DATOS_MUESTRA: Record<string, string> = {
  cliente: "Juan",
  apellido: "Pérez",
  profesional: "María",
  servicio: "Consulta",
  fecha: "11/03/2023",
  hora: "9:00",
  negocio: "Tu compañía",
  direccion: "Ubicación del local",
  telefono: "+51 999 999 999",
  email: "contacto@empresa.com",
  monto: "50.00",
  duracion: "60 min",
  url_agenda: "https://mitienda.com",
  instagram: "@mitienda",
  facebook: "facebook.com/mitienda",
  web: "https://mitienda.com",
};

/** `PlantillaWhatsapp::plantillasPredisenadas()`. Son 8; falta "personalizado". */
export const PLANTILLAS_PREDISENADAS: PlantillaPredisenada[] = [
  {
    key: "confirmacion",
    nombre: "Mensaje de confirmación",
    contenido:
      "¡Hola {{cliente}}! Tu reserva en {{negocio}} para {{servicio}} el {{fecha}} a las {{hora}} fue confirmada. Te esperamos.",
  },
  {
    key: "recordatorio",
    nombre: "Recordatorio de cita",
    contenido:
      "Hola {{cliente}}, te recordamos tu cita de {{servicio}} el {{fecha}} a las {{hora}} en {{negocio}}. Dirección: {{direccion}}.",
  },
  {
    key: "cancelacion",
    nombre: "Cancelación",
    contenido:
      "Hola {{cliente}}, lamentamos informarte que tu reserva de {{servicio}} del {{fecha}} a las {{hora}} ha sido cancelada. Contactanos si necesitás reprogramar.",
  },
  {
    key: "finalizado",
    nombre: "Trabajo finalizado / agradecimiento",
    contenido:
      "¡Gracias {{cliente}} por confiar en {{negocio}}! Esperamos que hayas disfrutado tu {{servicio}}. Tu opinión nos ayuda a crecer.",
  },
  {
    key: "pago_linea",
    nombre: "Pago en línea",
    contenido:
      "Hola {{cliente}}, tu servicio de {{servicio}} está programado para el {{fecha}} a las {{hora}}. Podés abonar de forma segura aquí: [Link de pago]. Total: {{monto}}.",
  },
  {
    key: "bienvenida",
    nombre: "Mensaje de bienvenida",
    contenido:
      "¡Bienvenido/a a {{negocio}}, {{cliente}}! Estamos encantados de que reserves con nosotros. Si tenés dudas, escribinos.",
  },
  {
    key: "redes_sociales",
    nombre: "Mensaje para redes sociales",
    contenido:
      "Hola {{cliente}}, ¿te gustó tu experiencia en {{negocio}}? Seguinos en nuestras redes y dejanos tu comentario. ¡Tu opinión es muy valiosa!",
  },
  {
    key: "cumpleanos",
    nombre: "Descuento por cumpleaños",
    contenido:
      "¡Feliz cumpleaños, {{cliente}}! 🎉 Como regalo te ofrecemos un descuento especial en tu próximo servicio en {{negocio}}. Escribinos para agendar.",
  },
];

/** Reemplaza `{{clave}}` por su valor, igual que `renderizarConDatos`. */
export function renderizarPlantilla(
  contenido: string,
  datos: Record<string, string> = DATOS_MUESTRA
) {
  return contenido.replace(/\{\{(\w+)\}\}/g, (original, clave: string) =>
    datos[clave] ?? original
  );
}

/** Enlace de WhatsApp, igual que `WhatsAppMensajeService::enlace`. */
export function enlaceWhatsapp(telefono: string, mensaje: string) {
  const numero = telefono.replace(/[^0-9]/g, "");
  if (!numero) return "#";
  return `https://api.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(mensaje)}`;
}

/** Límite de `contenido` en la validación del controlador. */
export const MAX_CONTENIDO = 2000;
