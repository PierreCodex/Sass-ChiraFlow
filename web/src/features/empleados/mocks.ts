import { haceDias } from "@/lib/mock-utils";
import { horarioPorDefecto } from "./constants";
import type { DiaHorario, Empleado } from "./types";

/** Horario de lunes a viernes con un break al mediodía. */
function horarioConAlmuerzo(): DiaHorario[] {
  return horarioPorDefecto().map((dia) =>
    dia.dia <= 5
      ? { ...dia, breaks: [{ desde: "13:00", hasta: "14:00" }] }
      : { ...dia, activo: false }
  );
}

export const empleadosMock: Empleado[] = [
  {
    id: 1, nombre: "MANUEL JAIURO GANOLL callare", foto_url: null, usuario: "rosal",
    rol: "dueno", cargo: "Dueño", email: "manuel@elrosal.pe", telefono: "981 912 809",
    activo: true, tipo_pago: "sueldo", comision_porcentaje: 0, monto_sueldo: 12000,
    periodo_pago: "mensual", horario: horarioPorDefecto(), excepciones: [],
  },
  {
    id: 2, nombre: "Dra. Carmen Ríos", foto_url: null, usuario: "criosr",
    rol: "profesional", cargo: "doctor cirujano", email: "carmen.rios@elrosal.pe",
    telefono: "987 441 220", activo: true, tipo_pago: "sueldo_comision",
    comision_porcentaje: 50, monto_sueldo: 12000, periodo_pago: "quincenal",
    horario: horarioConAlmuerzo(),
    // La excepción va en un día sin citas: si el cliente reserva desde la
    // vista pública solo ve huecos libres, así que no debería haber citas en
    // un día marcado como no disponible.
    excepciones: [
      {
        fecha: haceDias(-1),
        disponible: false,
        nota: "Permiso por emergencia familiar",
      },
    ],
  },
  {
    id: 3, nombre: "Dr. Julio Mendoza", foto_url: null, usuario: "jmendoza",
    rol: "profesional", cargo: "DOCTOR", email: "julio.mendoza@elrosal.pe",
    telefono: "987 112 903", activo: true, tipo_pago: "comision",
    comision_porcentaje: 25, monto_sueldo: null, periodo_pago: null,
    horario: horarioPorDefecto(), excepciones: [],
  },
  {
    id: 4, nombre: "Lic. Rosa Paredes", foto_url: null, usuario: "rparedes",
    rol: "profesional", cargo: "laboratorista", email: "rosa.paredes@elrosal.pe",
    telefono: "955 320 118", activo: true, tipo_pago: "comision",
    comision_porcentaje: 20, monto_sueldo: null, periodo_pago: null,
    horario: horarioConAlmuerzo(), excepciones: [],
  },
  {
    id: 5, nombre: "Srta. Lucía Herrera", foto_url: null, usuario: "lherrera",
    rol: "administrador", cargo: "Recepción", email: "lucia.herrera@elrosal.pe",
    telefono: "931 208 776", activo: true, tipo_pago: "sueldo",
    comision_porcentaje: 0, monto_sueldo: 1800, periodo_pago: "mensual",
    horario: horarioPorDefecto(), excepciones: [],
  },
  {
    id: 6, nombre: "Dr. Andrés Vílchez", foto_url: null, usuario: "avilchez",
    rol: "profesional", cargo: "pediatra", email: "andres.vilchez@elrosal.pe",
    telefono: "998 023 471", activo: false, tipo_pago: "comision",
    comision_porcentaje: 30, monto_sueldo: null, periodo_pago: null,
    horario: horarioPorDefecto(), excepciones: [],
  },
];
