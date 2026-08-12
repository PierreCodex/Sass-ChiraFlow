import * as yup from "yup";
import type { ImagenSeleccionada } from "@/components/shared/CampoImagenes";

const texto = (max: number, mensaje = `Máximo ${max} caracteres`) =>
  yup
    .string()
    .trim()
    .transform((valor) => (valor === "" ? null : valor))
    .max(max, mensaje)
    .nullable()
    .defined();

const coordenada = (min: number, max: number, mensaje: string) =>
  yup
    .number()
    .transform((valor, original) =>
      original === "" || original === null ? null : valor
    )
    .typeError("Debe ser un número")
    .min(min, mensaje)
    .max(max, mensaje)
    .nullable()
    .defined();

const hora = yup
  .string()
  .transform((valor) => (valor === "" ? null : valor))
  .nullable()
  .defined();

/** Réplica de las reglas de `ConfiguracionController::update`. */
export const configuracionSchema = yup.object({
  nombre: yup
    .string()
    .trim()
    .max(150, "Máximo 150 caracteres")
    .required("El nombre es obligatorio"),
  descripcion: texto(2000),
  email: texto(150).email("Escribe un correo válido"),
  telefono: texto(30),
  whatsapp: texto(30),
  direccion: texto(255),
  informacion_adicional: texto(255),
  latitud: coordenada(-90, 90, "La latitud va de -90 a 90"),
  longitud: coordenada(-180, 180, "La longitud va de -180 a 180"),
  zona_horaria: texto(80),

  horario_apertura: hora,
  horario_cierre: hora.test(
    "posterior",
    "El cierre debe ser posterior a la apertura",
    function (cierre) {
      const { horario_apertura: apertura } = this.parent;
      return !apertura || !cierre || cierre > apertura;
    }
  ),

  color_primario: texto(20),
  color_secundario: texto(20),
  logo: yup.array<any, ImagenSeleccionada>().max(1).defined(),
  cover: yup.array<any, ImagenSeleccionada>().max(1).defined(),

  sitio_publico_activo: yup.boolean().required(),
  mostrar_en_marketplace: yup.boolean().required(),
  terminos_servicio: texto(10000),

  modo_intervalo: yup
    .string()
    .oneOf(["duracion_servicio", "fijo"] as const)
    .required(),
  intervalo_min: yup
    .number()
    .typeError("Escribe los minutos")
    .integer("Debe ser un número entero")
    .min(5, "Mínimo 5 minutos")
    .max(240, "Máximo 240 minutos")
    .required(),
});

export type ConfiguracionFormValues = yup.InferType<typeof configuracionSchema>;

/** Qué pestaña contiene cada campo, para marcar la que tiene errores. */
export const CAMPOS_POR_PESTANA: Record<number, string[]> = {
  0: [
    "nombre",
    "descripcion",
    "email",
    "telefono",
    "whatsapp",
    "direccion",
    "informacion_adicional",
    "latitud",
    "longitud",
    "zona_horaria",
  ],
  1: ["horario_apertura", "horario_cierre", "modo_intervalo", "intervalo_min"],
  2: ["logo", "cover", "color_primario", "color_secundario"],
  3: ["sitio_publico_activo", "mostrar_en_marketplace", "terminos_servicio"],
};
