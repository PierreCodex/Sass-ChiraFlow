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
  color: yup.string().required(),
  horario_desde: textoOpcional,
  horario_hasta: textoOpcional,
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
