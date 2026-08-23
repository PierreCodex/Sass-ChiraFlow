import * as yup from "yup";

export const perfilSchema = yup.object({
  nombre: yup.string().trim().required("Escribe tu nombre.").max(150),
  apellido: yup.string().trim().required("Escribe tu apellido.").max(150),
  telefono: yup.string().trim().max(30).default(""),
  // Sin `matches` de 8 dígitos: el DNI es peruano, pero un extranjero con
  // carné de extranjería tiene 9 o 12. Que el backend decida el formato.
  documento: yup.string().trim().max(30).default(""),
  // Igual que en Configuración: CampoImagenes trabaja con un array aunque el
  // máximo sea uno.
  foto: yup
    .array()
    .of(yup.object({ url: yup.string().required() }))
    .default([]),
});

export type PerfilFormValues = yup.InferType<typeof perfilSchema>;

export const passwordSchema = yup.object({
  password_actual: yup.string().required("Escribe tu contraseña actual."),
  password: yup
    .string()
    .required("Escribe la nueva contraseña.")
    .min(8, "Mínimo 8 caracteres."),
  password_confirmation: yup
    .string()
    .required("Repite la nueva contraseña.")
    .oneOf([yup.ref("password")], "Las contraseñas no coinciden."),
});

export type PasswordFormValues = yup.InferType<typeof passwordSchema>;
