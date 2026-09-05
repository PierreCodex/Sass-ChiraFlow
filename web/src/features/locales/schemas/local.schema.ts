import * as yup from "yup";
import type { ImagenSeleccionada } from "@/components/shared/CampoImagenes";

const textoOpcional = yup
  .string()
  .trim()
  .transform((valor) => (valor === "" ? null : valor))
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

export const localSchema = yup.object({
  nombre: yup.string().trim().required("El nombre es obligatorio"),
  direccion: textoOpcional,
  descripcion_publica: textoOpcional,
  telefono: textoOpcional,
  email: textoOpcional.email("Escribe un correo válido"),
  latitud: coordenada(-90, 90, "La latitud va de -90 a 90"),
  longitud: coordenada(-180, 180, "La longitud va de -180 a 180"),
  // Hex de 6: la columna es `char(7)` y con MySQL estricto cualquier otra
  // cosa sería un 500. El input[type=color] ya manda esa forma.
  color: yup
    .string()
    .required()
    .matches(/^#[0-9a-fA-F]{6}$/, "El color debe ser un hexadecimal de 6 dígitos"),
  horario_desde: textoOpcional,
  /*
    El cierre después de la apertura. El backend lo valida desde el Sprint 3 y
    devuelve 422; comprobarlo aquí evita el viaje, pero sobre todo evita
    guardar un horario imposible — la ficha señalaba un local real con
    «21:00 – 16:07», del que saldrían huecos imposibles al calcular
    disponibilidad.
  */
  horario_hasta: textoOpcional.test(
    "posterior",
    "La hora de cierre debe ser posterior a la de apertura",
    function (hasta) {
      const { horario_desde: desde } = this.parent;
      return !desde || !hasta || hasta > desde;
    }
  ),
  banner: yup.array<any, ImagenSeleccionada>().max(1).defined(),
  logo: yup.array<any, ImagenSeleccionada>().max(1).defined(),
});

export type LocalFormValues = yup.InferType<typeof localSchema>;

export const valoresIniciales: LocalFormValues = {
  nombre: "",
  direccion: null,
  descripcion_publica: null,
  telefono: null,
  email: null,
  latitud: null,
  longitud: null,
  color: "#763EBD",
  horario_desde: "09:00",
  horario_hasta: "18:00",
  banner: [],
  logo: [],
};
