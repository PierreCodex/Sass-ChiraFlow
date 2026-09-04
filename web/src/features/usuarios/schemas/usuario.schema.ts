import * as yup from "yup";
import { soloDigitos } from "@/features/auth/types";

const textoOpcional = yup
  .string()
  .trim()
  .transform((valor) => (valor === "" ? null : valor))
  .nullable()
  .defined();

/**
 * Réplica de `UsuarioRequest` del backend.
 *
 * **No hay campo de contraseña**, y no es un olvido: la elige la propia
 * persona desde la invitación que le llega por correo.
 */
export const usuarioSchema = yup.object({
  nombre: yup
    .string()
    .trim()
    .max(150, "Máximo 150 caracteres")
    .required("El nombre es obligatorio"),
  apellido: textoOpcional.max(150, "Máximo 150 caracteres"),

  // Único GLOBAL, no solo dentro del negocio: el correo identifica la cuenta
  // en toda la plataforma. Un correo repetido vuelve como 422 en este campo.
  email: yup
    .string()
    .trim()
    .max(150, "Máximo 150 caracteres")
    .required("El correo es obligatorio")
    .email("Escribe un correo válido"),

  // Se teclean 9 dígitos y viaja como `+51…`, igual que en el registro y en Mi
  // perfil: escriben la MISMA columna y el WhatsApp cuenta con ese formato.
  telefono: textoOpcional.test(
    "nueve-digitos",
    "El teléfono debe tener 9 dígitos",
    (valor) => !valor || soloDigitos(valor).length === 9
  ),

  rol_id: yup
    .number()
    .typeError("Elige un rol")
    .min(1, "Elige un rol")
    .required("Elige un rol"),

  activo: yup.boolean().required(),
});

export type UsuarioFormValues = yup.InferType<typeof usuarioSchema>;

export const valoresIniciales: UsuarioFormValues = {
  nombre: "",
  apellido: null,
  email: "",
  telefono: null,
  // Sin preselección: el rol decide qué puede hacer la persona, así que se
  // elige a propósito.
  rol_id: 0,
  activo: true,
};
