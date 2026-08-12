import type { Configuracion } from "./types";

export const configuracionMock: Configuracion = {
  nombre: "CLINICA EL ROSAL",
  descripcion:
    "Atención médica, odontología y laboratorio con más de 10 años de experiencia.",
  email: "contacto@elrosal.pe",
  telefono: "01 445 8890",
  whatsapp: "981 912 809",
  direccion: "Av. Arequipa 1250, Lince",
  informacion_adicional: "Estacionamiento disponible para pacientes.",
  latitud: -5.1936,
  longitud: -80.6328,
  zona_horaria: "America/Lima",

  // Mismos valores por defecto que usa el controlador.
  horario_apertura: "09:00",
  horario_cierre: "20:00",

  color_primario: "#7c3aed",
  color_secundario: "#0ea5e9",
  logo_url: null,
  cover_url: null,

  sitio_publico_activo: true,
  mostrar_en_marketplace: false,
  terminos_servicio: null,

  agenda: {
    // Por defecto la agenda se encadena con la duración del servicio: es lo
    // que evita dejar huecos que nadie puede reservar.
    modo_intervalo: "duracion_servicio",
    intervalo_min: 15,
  },
};
