import * as yup from "yup";

const textoOpcional = yup
  .string()
  .trim()
  .transform((valor) => (valor === "" ? null : valor))
  .nullable()
  .defined();

const productoSchema = yup.object({
  id: yup
    .number()
    .typeError("Elige un producto")
    .min(1, "Elige un producto")
    .required("Elige un producto"),
  cantidad: yup
    .number()
    .typeError("Cantidad inválida")
    .integer("Debe ser entero")
    .min(1, "Mínimo 1")
    .required("Requerida"),
});

export const citaSchema = yup.object({
  empleado_id: yup
    .number()
    .typeError("Elige un profesional")
    .min(1, "Elige un profesional")
    .required("El profesional es obligatorio"),
  servicio_id: yup
    .number()
    .typeError("Elige un servicio")
    .min(1, "Elige un servicio")
    .required("El servicio es obligatorio"),
  fecha: yup.string().required("La fecha es obligatoria"),
  hora_inicio: yup.string().required("La hora es obligatoria"),
  cliente_id: yup.number().nullable().defined(),
  cliente_nombre: yup.string().trim().required("El cliente es obligatorio"),
  cliente_telefono: textoOpcional,
  cliente_email: textoOpcional.email("Escribe un correo válido"),
  monto: yup
    .number()
    .typeError("Escribe el monto")
    .min(0, "No puede ser negativo")
    .required("El monto es obligatorio"),
  estado: yup
    .string()
    .oneOf([
      "pendiente",
      "confirmada",
      "completada",
      "cancelada",
    ] as const)
    .required(),
  notas: textoOpcional,
  productos: yup.array().of(productoSchema).defined(),
});

export type CitaFormValues = yup.InferType<typeof citaSchema>;

export const valoresIniciales: CitaFormValues = {
  empleado_id: 0,
  servicio_id: 0,
  fecha: new Date().toISOString().slice(0, 10),
  hora_inicio: "09:00",
  cliente_id: null,
  cliente_nombre: "",
  cliente_telefono: null,
  cliente_email: null,
  monto: 0,
  estado: "pendiente",
  notas: null,
  productos: [],
};
