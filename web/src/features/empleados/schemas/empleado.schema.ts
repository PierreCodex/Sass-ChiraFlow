import * as yup from "yup";
import type { ImagenSeleccionada } from "@/components/shared/CampoImagenes";
import { horarioPorDefecto, PAGO_INCLUYE_SUELDO } from "../constants";

const textoOpcional = yup
  .string()
  .trim()
  .transform((valor) => (valor === "" ? null : valor))
  .nullable()
  .defined();

const numeroOpcional = yup
  .number()
  .transform((valor, original) =>
    original === "" || original === null ? null : valor
  )
  .nullable()
  .defined();

const breakSchema = yup.object({
  desde: yup.string().required("Requerido"),
  hasta: yup
    .string()
    .required("Requerido")
    .test("despues", "Debe ser posterior al inicio", function (hasta) {
      const { desde } = this.parent;
      return !desde || !hasta || hasta > desde;
    }),
});

const diaSchema = yup.object({
  dia: yup.number().required(),
  activo: yup.boolean().required(),
  desde: yup.string().required(),
  hasta: yup
    .string()
    .required()
    .test("despues", "La hora de fin debe ser posterior", function (hasta) {
      const { desde, activo } = this.parent;
      if (!activo) return true;
      return !desde || !hasta || hasta > desde;
    }),
  breaks: yup.array().of(breakSchema).defined(),
});

const excepcionSchema = yup.object({
  fecha: yup.string().required("Elige una fecha"),
  disponible: yup.boolean().required(),
  desde: textoOpcional,
  hasta: textoOpcional,
  nota: textoOpcional,
});

/**
 * `esEdicion` controla la contraseña: obligatoria al crear, opcional al
 * editar (vacía = no cambiarla).
 */
export const crearEmpleadoSchema = (esEdicion: boolean) =>
  yup.object({
    // --- Datos ---
    nombre: yup.string().trim().required("El nombre es obligatorio"),
    foto: yup.array<any, ImagenSeleccionada>().max(1).defined(),
    usuario: yup.string().trim().required("El usuario es obligatorio"),
    // El largo mínimo se comprueba solo si hay algo escrito: si no, un campo
    // vacío mostraría "Mínimo 6 caracteres" en vez de "es obligatoria".
    password: (esEdicion
      ? textoOpcional
      : yup.string().trim().required("La contraseña es obligatoria")
    ).test(
      "largo-minimo",
      "Mínimo 6 caracteres",
      (valor) => !valor || valor.length >= 6
    ),
    email: textoOpcional.email("Escribe un correo válido"),
    telefono: textoOpcional,
    rol: yup
      .string()
      .oneOf(["superadmin", "dueno", "admin", "profesional", "cliente"] as const)
      .required(),
    cargo: textoOpcional,
    activo: yup.boolean().required(),

    // --- Pago ---
    tipo_pago: yup
      .string()
      .oneOf(["comision", "sueldo", "ambos"] as const)
      .required(),
    comision_porcentaje: yup
      .number()
      .typeError("Escribe un porcentaje")
      .min(0, "No puede ser negativo")
      .max(100, "No puede pasar de 100")
      .required("El porcentaje es obligatorio"),
    monto_sueldo: numeroOpcional
      .min(0, "No puede ser negativo")
      .test("requerido-con-sueldo", "Escribe el monto", function (valor) {
        const tipo = this.parent.tipo_pago;
        if (!PAGO_INCLUYE_SUELDO.includes(tipo)) return true;
        return valor !== null && valor !== undefined;
      }),
    periodo_pago: yup
      .string()
      .oneOf(["semanal", "quincenal", "mensual"] as const)
      .nullable()
      .defined()
      .test("requerido-con-sueldo", "Elige el período", function (valor) {
        const tipo = this.parent.tipo_pago;
        if (!PAGO_INCLUYE_SUELDO.includes(tipo)) return true;
        return !!valor;
      }),

    // --- Horario ---
    horario: yup.array().of(diaSchema).defined(),
    excepciones: yup.array().of(excepcionSchema).defined(),
  });

export type EmpleadoFormValues = yup.InferType<
  ReturnType<typeof crearEmpleadoSchema>
>;

/** Qué pestaña contiene cada campo, para marcar la que tiene errores. */
export const CAMPOS_POR_PESTANA: Record<number, string[]> = {
  0: ["nombre", "foto", "usuario", "password", "email", "telefono", "rol", "cargo", "activo"],
  1: ["tipo_pago", "comision_porcentaje", "monto_sueldo", "periodo_pago"],
  2: ["horario", "excepciones"],
};

export const valoresIniciales: EmpleadoFormValues = {
  nombre: "",
  foto: [],
  usuario: "",
  password: "",
  email: null,
  telefono: null,
  rol: "admin",
  cargo: null,
  activo: true,
  tipo_pago: "comision",
  comision_porcentaje: 0,
  monto_sueldo: null,
  periodo_pago: null,
  horario: horarioPorDefecto(),
  excepciones: [],
};
