import type { Configuracion } from "./types";

export const configuracionMock: Configuracion = {
  nombre: "CLINICA EL ROSAL",
  slug: "clinica-el-rosal",
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

  // Los de las columnas de `tenants`. Los que decia la ficha (#7c3aed /
  // #0ea5e9) eran del Laravel anterior.
  color_primario: "#4f46e5",
  color_secundario: "#06b6d4",
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

/**
 * Un puñado de zonas, no las 419 que manda el backend.
 *
 * Con mocks solo hace falta que el desplegable tenga varias regiones y se
 * pueda buscar; la lista real llega con el `GET` y es la que manda.
 */
export const zonasHorariasMock: string[] = [
  "America/Lima",
  "America/Bogota",
  "America/Mexico_City",
  "America/Argentina/Buenos_Aires",
  "America/Santiago",
  "America/New_York",
  "Europe/Madrid",
  "Europe/London",
  "UTC",
];
