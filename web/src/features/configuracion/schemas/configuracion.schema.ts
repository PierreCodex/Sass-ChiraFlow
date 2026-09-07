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

const hexColor = yup
  .string()
  .trim()
  .transform((valor) => (valor === "" ? null : valor))
  .matches(/^#[0-9a-fA-F]{6}$/, {
    message: "El color debe ser un hexadecimal de 6 dígitos, como #4f46e5",
    excludeEmptyString: true,
  })
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
  /*
    Ya no es texto libre: el backend la valida como zona IANA de verdad, así
    que «Lima» o «GMT-5» dan 422. Las opciones llegan en el propio GET, y hay
    test allá de que el PUT acepta TODAS las que ofrece — un select que
    propusiera algo rechazable sería peor que un campo de texto, porque el
    usuario elige de una lista y aun así se le dice que no.

    Se exige porque cada timestamp del negocio se interpreta en esta zona: con
    una vacía nadie ve un error, solo citas a la hora equivocada.
  */
  zona_horaria: yup.string().required("Elige una zona horaria"),

  horario_apertura: hora,
  horario_cierre: hora.test(
    "posterior",
    "El cierre debe ser posterior a la apertura",
    function (cierre) {
      const { horario_apertura: apertura } = this.parent;
      return !apertura || !cierre || cierre > apertura;
    }
  ),

  // Hex de 6 obligatorio: la columna es char(7) y con MySQL estricto
  // cualquier otra cosa sería un 500. El input[type=color] ya manda esa forma.
  color_primario: hexColor,
  color_secundario: hexColor,
  logo: yup.array<any, ImagenSeleccionada>().max(1).defined(),
  cover: yup.array<any, ImagenSeleccionada>().max(1).defined(),

  sitio_publico_activo: yup.boolean().required(),
  mostrar_en_marketplace: yup.boolean().required(),
  terminos_servicio: texto(10000),

  modo_intervalo: yup
    .string()
    .oneOf(["duracion_servicio", "fijo"] as const)
    .required(),
  /*
    5-120, no 240: es lo que acepta el backend, y el tope viejo daba un 422
    después de pasar la validación de aquí.

    Y solo se exige con la rejilla fija; con `duracion_servicio` el paso lo pone
    el servicio y el backend lo ignora aunque se mande.
  */
  intervalo_min: yup
    .number()
    .transform((valor, original) => (original === "" ? undefined : valor))
    .typeError("Escribe los minutos")
    .integer("Debe ser un número entero")
    .min(5, "Mínimo 5 minutos")
    .max(120, "Máximo 120 minutos")
    .when("modo_intervalo", {
      is: "fijo",
      then: (esquema) =>
        esquema.required("Di cada cuántos minutos se ofrece un turno"),
      otherwise: (esquema) => esquema.notRequired(),
    })
    .defined(),
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
