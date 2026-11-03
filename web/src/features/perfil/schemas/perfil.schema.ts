import * as yup from "yup";

import { soloDigitos } from "@/features/auth/types";

export const perfilSchema = yup.object({
  nombre: yup.string().trim().required("Escribe tu nombre.").max(150, "El nombre admite hasta 150 caracteres."),
  apellido: yup.string().trim().required("Escribe tu apellido.").max(150, "El apellido admite hasta 150 caracteres."),
  // Como en el registro: el +51 es fijo y no se escribe; se piden los 9
  // dígitos y al guardar se manda +51987654321, que es lo que valida el backend.
  telefono: yup
    .string()
    .trim()
    .test(
      "nueve-digitos",
      "El teléfono debe tener 9 dígitos.",
      (valor) => !valor || soloDigitos(valor).length === 9,
    )
    .default(""),
  documento: yup.string().trim().max(20, "El documento admite hasta 20 caracteres.").matches(/^[A-Za-z0-9-]+$/, {
    message: "El documento solo admite letras, números y guiones.",
    excludeEmptyString: true,
  }).default(""),
});

export type PerfilFormValues = yup.InferType<typeof perfilSchema>;

export const passwordSchema = yup.object({
  password_actual: yup.string().required("Escribe tu contraseña actual."),
  password: yup
    .string()
    .required("Escribe la nueva contraseña.")
    .min(8, "Mínimo 8 caracteres.")
    .notOneOf([yup.ref("password_actual")], "La nueva contraseña debe ser distinta de la actual."),
  password_confirmation: yup
    .string()
    .required("Repite la nueva contraseña.")
    .oneOf([yup.ref("password")], "Las contraseñas no coinciden."),
});

export type PasswordFormValues = yup.InferType<typeof passwordSchema>;
