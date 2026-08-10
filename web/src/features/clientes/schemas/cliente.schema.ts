import * as yup from "yup";

/** Convierte los inputs vacíos en null, que es lo que espera la API. */
const textoOpcional = yup
  .string()
  .trim()
  .transform((valor) => (valor === "" ? null : valor))
  .nullable()
  .defined();

export const clienteSchema = yup.object({
  nombre: yup.string().trim().required("El nombre es obligatorio"),
  telefono: textoOpcional,
  email: textoOpcional.email("Escribe un correo válido"),
});

export type ClienteFormValues = yup.InferType<typeof clienteSchema>;

export const valoresIniciales: ClienteFormValues = {
  nombre: "",
  telefono: null,
  email: null,
};
