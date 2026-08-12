import * as yup from "yup";
import type { ImagenSeleccionada } from "@/components/shared/CampoImagenes";
import { TIPOS_CON_SESIONES } from "../constants";
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
  tipo: yup.string().oneOf(["normal", "sesiones", "clases", "paquete"] as const).required(),
  max_sesiones: yup
    .number()
    .transform((valor, original) =>
      original === "" || original === null ? null : valor
    )
    .typeError("Escribe un número")
    .integer("Debe ser un número entero")
    .min(1, "Debe ser mayor que 0")
    .nullable()
    .defined()
    // Obligatorio solo en los tipos que se venden por sesiones.
    .test("requerido-por-tipo", "Indica cuántas sesiones incluye", function (valor) {
      if (!TIPOS_CON_SESIONES.includes(this.parent.tipo)) return true;
      return valor !== null && valor !== undefined;
    }),
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
  max_sesiones: null,
  precio: 0,
  duracion_min: 30,
  imagen_principal: [],
  galeria: [],
  empleado_ids: [],
};
