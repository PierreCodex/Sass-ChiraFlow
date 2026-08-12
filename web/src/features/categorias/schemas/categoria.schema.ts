import * as yup from "yup";
import type { ImagenSeleccionada } from "@/components/shared/CampoImagenes";

/**
 * Réplica de las reglas de `CategoriaServicioController`:
 *
 *   nombre      required, max:100, único por negocio
 *   descripcion nullable, max:255
 *   color       nullable, max:20
 *   orden       nullable, integer, min:0
 *   imagen      nullable, image, max:2048 (2 MB)
 */
export const categoriaSchema = yup.object({
  nombre: yup
    .string()
    .trim()
    .max(100, "Máximo 100 caracteres")
    .required("El nombre es obligatorio"),
  descripcion: yup
    .string()
    .trim()
    .transform((valor) => (valor === "" ? null : valor))
    .max(255, "Máximo 255 caracteres")
    .nullable()
    .defined(),
  color: yup.string().nullable().defined(),
  orden: yup
    .number()
    .transform((valor, original) => (original === "" ? 0 : valor))
    .typeError("Escribe un número")
    .integer("Debe ser un número entero")
    .min(0, "No puede ser negativo")
    .required(),
  imagen: yup.array<any, ImagenSeleccionada>().max(1).defined(),
});

export type CategoriaFormValues = yup.InferType<typeof categoriaSchema>;

export const valoresIniciales: CategoriaFormValues = {
  nombre: "",
  descripcion: null,
  color: "#5D87FF",
  orden: 0,
  imagen: [],
};
