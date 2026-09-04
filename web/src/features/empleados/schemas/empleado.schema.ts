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
 * `esEdicion` controla la contraseña: obligatoria al crear, opcional al
 * editar (vacía = no cambiarla).
 */
export const crearEmpleadoSchema = (esEdicion: boolean) =>
  yup.object({
    // --- Datos ---
    nombre: yup.string().trim().required("El nombre es obligatorio"),
    foto: yup.array<any, ImagenSeleccionada>().max(1).defined(),
    // La credencial de acceso: `users.usuario` se eliminó y el login es el
    // correo, único global.
    email: yup
      .string()
      .trim()
      .required("El correo es obligatorio")
      .email("Escribe un correo válido"),
    // El largo mínimo se comprueba solo si hay algo escrito: si no, un campo
    // vacío mostraría "Mínimo 8 caracteres" en vez de "es obligatoria".
    password: (esEdicion
      ? textoOpcional
      : yup.string().trim().required("La contraseña es obligatoria")
    ).test(
      "largo-minimo",
      "Mínimo 8 caracteres",
      (valor) => !valor || valor.length >= 8
    ),
    // Se teclean 9 dígitos y viaja como `+51…`, igual que en el registro:
    // escriben la MISMA columna y el WhatsApp cuenta con ese formato.
    telefono: textoOpcional.test(
      "nueve-digitos",
      "El teléfono debe tener 9 dígitos",
      (valor) => !valor || soloDigitos(valor).length === 9
    ),
    // Un rol de los del negocio, no el ENUM central: es lo que deja asignar
    // los que cree el dueño.
    rol_id: yup
      .number()
      .typeError("Elige un rol")
      .min(1, "Elige un rol")
      .required("Elige un rol"),
    cargo: textoOpcional,
    activo: yup.boolean().required(),
    atiende: yup.boolean().required(),

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

/**
 * Qué pestaña contiene cada campo, para marcar la que tiene errores.
 *
 * `atiende` está aquí y no en Pago aunque hable del plan: es donde cae el 422
 * del cupo, y el mensaje ofrece apagarlo como alternativa a subir de plan.
 */
export const CAMPOS_POR_PESTANA: Record<number, string[]> = {
  0: ["nombre", "foto", "email", "password", "telefono", "rol_id", "cargo", "activo", "atiende"],
  1: ["tipo_pago", "comision_porcentaje", "monto_sueldo", "periodo_pago"],
  2: ["horario", "excepciones"],
};

export const valoresIniciales: EmpleadoFormValues = {
  nombre: "",
  foto: [],
  email: "",
  password: "",
  telefono: null,
  // Sin preselección: el rol decide qué puede hacer la persona y qué barandillas
  // saltan, así que se elige a propósito.
  rol_id: 0,
  cargo: null,
  activo: true,
  atiende: true,
  tipo_pago: "comision",
  comision_porcentaje: 0,
  monto_sueldo: null,
  periodo_pago: null,
  horario: horarioPorDefecto(),
  excepciones: [],
};
