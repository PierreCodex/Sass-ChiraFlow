import * as yup from "yup";

export const resetPasswordSchema = yup.object({
  password: yup
    .string()
    .required("Ingresa tu contraseña nueva.")
    .min(8, "Mínimo 8 caracteres."),

  password_confirmation: yup
    .string()
    .required("Repite la contraseña.")
    .oneOf([yup.ref("password")], "Las contraseñas no coinciden."),
});

export type ResetPasswordFormValues = yup.InferType<typeof resetPasswordSchema>;
