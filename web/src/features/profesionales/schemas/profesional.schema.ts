import * as yup from "yup";
import type { ImagenSeleccionada } from "@/components/shared/CampoImagenes";
import { soloDigitos } from "@/features/auth/types";
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
 * La ficha del profesional.
 *
 * **Ni correo, ni rol, ni contraseña sueltos**: eso es una cuenta del panel y
 * vive en `/usuarios`. Lo único que cruza es la casilla «darle acceso», que
 * enciende `dar_acceso` y con ella los dos campos de abajo.
 *
 * `tieneCuenta` apaga esa casilla: a quien ya entra al sistema no se le cambia
 * el correo ni el rol desde aquí — el backend lo ignora en silencio, así que
 * el formulario no debe ni ofrecerlo.
 */
export const crearProfesionalSchema = (tieneCuenta: boolean) =>
  yup.object({
    // --- Datos ---
    nombre: yup.string().trim().required("El nombre es obligatorio"),
    foto: yup.array<any, ImagenSeleccionada>().max(1).defined(),
    // Se teclean 9 dígitos y viaja como `+51…`, igual que en el registro:
    // escriben la MISMA columna y el WhatsApp cuenta con ese formato.
    telefono: textoOpcional.test(
      "nueve-digitos",
      "El teléfono debe tener 9 dígitos",
      (valor) => !valor || soloDigitos(valor).length === 9
    ),
    cargo: textoOpcional,
    activo: yup.boolean().required(),
    atiende: yup.boolean().required(),

    // --- Acceso al panel (opcional) ---
    dar_acceso: yup.boolean().required(),
    // Requeridos solo con la casilla marcada, y nunca si ya tiene cuenta.
    acceso_email: textoOpcional
      .email("Escribe un correo válido")
      .test("requerido-con-acceso", "El correo es obligatorio", function (valor) {
        if (tieneCuenta || !this.parent.dar_acceso) return true;
        return !!valor;
      }),
    acceso_rol_id: yup
      .number()
      .transform((valor, original) => (original === "" ? 0 : valor))
      .required()
      .test("requerido-con-acceso", "Elige un rol", function (valor) {
        if (tieneCuenta || !this.parent.dar_acceso) return true;
        return !!valor && valor > 0;
      }),

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

export type ProfesionalFormValues = yup.InferType<
  ReturnType<typeof crearProfesionalSchema>
>;

/**
 * Qué pestaña contiene cada campo, para marcar la que tiene errores.
 *
 * `activo` está en la primera y no en Pago aunque hable del plan: es donde cae
 * el 422 del cupo desde que el cupo cuenta fichas activas.
 */
export const CAMPOS_POR_PESTANA: Record<number, string[]> = {
  0: [
    "nombre", "foto", "telefono", "cargo", "activo", "atiende",
    "dar_acceso", "acceso_email", "acceso_rol_id",
    // El backend valida el objeto anidado, así que sus 422 llegan con estas
    // claves. Se listan para que la pestaña se marque igual.
    "usuario.email", "usuario.rol_id",
  ],
  1: ["tipo_pago", "comision_porcentaje", "monto_sueldo", "periodo_pago"],
  2: ["horario", "excepciones"],
};

export const valoresIniciales: ProfesionalFormValues = {
  nombre: "",
  foto: [],
  telefono: null,
  cargo: null,
  activo: true,
  // Por defecto sale en la tienda: es a lo que se da de alta a un profesional.
  atiende: true,
  // Apagada a propósito: la mayoría de los profesionales de una barbería no
  // entran al sistema, y darle cuenta a quien no la necesita crea una
  // credencial que nadie vigila.
  dar_acceso: false,
  acceso_email: null,
  acceso_rol_id: 0,
  tipo_pago: "comision",
  comision_porcentaje: 0,
  monto_sueldo: null,
  periodo_pago: null,
  horario: horarioPorDefecto(),
  excepciones: [],
};
