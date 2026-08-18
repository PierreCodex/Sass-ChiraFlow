import * as yup from "yup";
import { categoriasNegocioMock } from "../mocks";

const OTROS_ID = categoriasNegocioMock.find((c) => c.slug === "otros")!.id;

/**
 * Mismas reglas que `Publico\HomeController@registroPrueba` en Laravel:
 * categoría, cantidad de profesionales, datos del negocio, datos del dueño,
 * teléfono con código de país, contraseña fuerte (min 8, mayúscula,
 * minúscula, número, símbolo) y aceptar términos.
 */
export const registroSchema = yup.object({
  categoria_id: yup
    .number()
    .typeError("Selecciona una categoría")
    .required("Selecciona una categoría"),
  categoria_otro_detalle: yup.string().when("categoria_id", {
    is: OTROS_ID,
    then: (schema) =>
      schema.trim().required("Cuéntanos de qué trata tu negocio").max(500),
    otherwise: (schema) => schema.strip(),
  }),
  cantidad_profesionales: yup
    .number()
    .typeError("Selecciona una opción")
    .required("Selecciona una opción"),
  nombre_negocio: yup.string().trim().required("El nombre del negocio es obligatorio").max(150),
  nombre: yup.string().trim().required("Tu nombre es obligatorio").max(150),
  apellido: yup.string().trim().required("Tu apellido es obligatorio").max(150),
  email: yup.string().trim().email("Escribe un correo válido").required("El correo es obligatorio"),
  telefono_pais: yup.string().required(),
  telefono_numero: yup
    .string()
    .trim()
    .required("El teléfono es obligatorio")
    .matches(/^[0-9]{6,14}$/, "Solo números, sin espacios (6 a 14 dígitos)"),
  documento: yup.string().trim().required("El documento es obligatorio").max(30),
  usuario: yup
    .string()
    .trim()
    .required("El usuario es obligatorio")
    .min(3, "Mínimo 3 caracteres")
    .max(100)
    .matches(/^[a-zA-Z0-9_-]+$/, "Solo letras, números, guiones y guion bajo"),
  password: yup
    .string()
    .required("La contraseña es obligatoria")
    .min(8, "Mínimo 8 caracteres")
    .matches(/[A-Z]/, "Debe tener una mayúscula")
    .matches(/[a-z]/, "Debe tener una minúscula")
    .matches(/[0-9]/, "Debe tener un número")
    .matches(/[^A-Za-z0-9]/, "Debe tener un símbolo"),
  terminos: yup
    .boolean()
    .oneOf([true], "Debes aceptar los términos y la política de privacidad")
    .required(),
});

export type RegistroFormValues = yup.InferType<typeof registroSchema>;

export const valoresInicialesRegistro: RegistroFormValues = {
  categoria_id: 0,
  categoria_otro_detalle: "",
  cantidad_profesionales: 0,
  nombre_negocio: "",
  nombre: "",
  apellido: "",
  email: "",
  telefono_pais: "+51",
  telefono_numero: "",
  documento: "",
  usuario: "",
  password: "",
  terminos: false,
};
