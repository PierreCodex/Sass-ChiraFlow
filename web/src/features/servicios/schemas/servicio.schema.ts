import * as yup from "yup";
import type { ImagenSeleccionada } from "@/components/shared/CampoImagenes";
import { MAX_GALERIA } from "../types";

/**
 * El formulario trabaja con `ImagenSeleccionada[]` (vista previa + File).
 * La traducción al payload de la API se hace al enviar, en el propio diálogo.
 */
export const servicioSchema = yup.object({
  nombre: yup.string().trim().required("El nombre es obligatorio"),
  descripcion: yup
    .string()
    .trim()
    .transform((valor) => (valor === "" ? null : valor))
    .nullable()
    .defined(),
  color: yup.string().required(),
  categoria_id: yup
    .number()
    .transform((valor, original) => (original === "" ? null : valor))
    .nullable()
    .defined(),
  tipo: yup.string().oneOf(["normal"] as const).required(),
  precio: yup
    .number()
    .typeError("Escribe el precio")
    .min(0, "No puede ser negativo")
    .required("El precio es obligatorio"),
  duracion_min: yup
    .number()
    .typeError("Escribe los minutos")
    .integer("Debe ser un número entero")
    .min(1, "Debe ser mayor que 0")
    .required("La duración es obligatoria"),
  imagen_principal: yup.array<any, ImagenSeleccionada>().max(1).defined(),
  galeria: yup
    .array<any, ImagenSeleccionada>()
    .max(MAX_GALERIA, `Máximo ${MAX_GALERIA} imágenes`)
    .defined(),
  empleado_ids: yup.array(yup.number().required()).defined(),
});

export type ServicioFormValues = yup.InferType<typeof servicioSchema>;

export const valoresIniciales: ServicioFormValues = {
  nombre: "",
  descripcion: null,
  color: "#763EBD",
  categoria_id: null,
  tipo: "normal",
  precio: 0,
  duracion_min: 30,
  imagen_principal: [],
  galeria: [],
  empleado_ids: [],
};
