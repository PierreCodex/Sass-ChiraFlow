import * as yup from "yup";

import { RANGOS_PROFESIONALES, soloDigitos } from "../types";

const valoresRango = RANGOS_PROFESIONALES.map((r) => r.valor);

/**
 * Los campos tal como se ven en pantalla. No coinciden uno a uno con el
 * payload: "nombre y apellido" es un campo que se parte en dos al enviar, y
 * el teléfono se escribe en 9 dígitos y viaja como `+51…`.
 */
export const registroSchema = yup.object({
  tipo_negocio_id: yup
    .number()
    .typeError("Elige el tipo de negocio.")
    .required("Elige el tipo de negocio."),

  rango_profesionales: yup
    .string()
    .oneOf(valoresRango, "Selecciona una opción.")
    .required("Selecciona una opción."),

  nombre_completo: yup
    .string()
    .trim()
    .required("Ingresa tu nombre y apellido.")
    .max(300, "Máximo 300 caracteres.")
    .test(
      "dos-palabras",
      "Ingresa tu nombre y tu apellido.",
      (valor) => (valor ?? "").trim().split(/\s+/).length >= 2
    ),

  email: yup
    .string()
    .trim()
    .required("Ingresa tu email.")
    .email("El email no es válido.")
    .max(150, "Máximo 150 caracteres."),

  telefono: yup
    .string()
    .required("Ingresa tu teléfono.")
    .test(
      "nueve-digitos",
      "El teléfono debe tener 9 dígitos.",
      (valor) => soloDigitos(valor ?? "").length === 9
    ),

  password: yup
    .string()
    .required("Crea tu contraseña.")
    .min(8, "Mínimo 8 caracteres."),
});

export type RegistroFormValues = yup.InferType<typeof registroSchema>;

/**
 * Los dos selects arrancan vacíos, que no es un valor válido del esquema: el
 * `as` mantiene el placeholder ("Selecciona una opción") sin abrir el tipo.
 */
export const valoresIniciales: RegistroFormValues = {
  tipo_negocio_id: undefined as unknown as number,
  rango_profesionales: "" as RegistroFormValues["rango_profesionales"],
  nombre_completo: "",
  email: "",
  telefono: "",
  password: "",
};
