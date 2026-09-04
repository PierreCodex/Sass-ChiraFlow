import { haceDias } from "@/lib/mock-utils";
import type { RolResumen } from "@/features/roles/types";
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

/*
  Los mismos ids que `features/roles/mocks.ts`: el select del formulario lee de
  allí y aquí se pinta el nombre, así que si no coincidieran la tabla diría un
  rol y el desplegable marcaría otro.
*/
const DUENO: RolResumen = { id: 1, nombre: "Administrador general", clave: "dueno" };
const PROFESIONAL: RolResumen = { id: 3, nombre: "Profesional", clave: "profesional" };
const RECEPCION: RolResumen = { id: 4, nombre: "Recepción", clave: null };

export const empleadosMock: Empleado[] = [
  {
    id: 1, nombre: "MANUEL JAIURO GANOLL callare", foto_url: "/images/profile/user-1.jpg",
    usuario: "manuel@elrosal.pe", email: "manuel@elrosal.pe",
    rol_id: DUENO.id, rol: DUENO, cargo: "Dueño", telefono: "+51981912809",
    activo: true, atiende: true, tipo_pago: "sueldo", comision_porcentaje: 0,
    monto_sueldo: 12000, periodo_pago: "mensual",
    horario: horarioPorDefecto(), excepciones: [],
  },
  {
    id: 2, nombre: "Dra. Carmen Ríos", foto_url: "/images/profile/user-2.jpg",
    usuario: "carmen.rios@elrosal.pe", email: "carmen.rios@elrosal.pe",
    rol_id: PROFESIONAL.id, rol: PROFESIONAL, cargo: "doctor cirujano",
    telefono: "+51987441220", activo: true, atiende: true, tipo_pago: "ambos",
    comision_porcentaje: 50, monto_sueldo: 12000, periodo_pago: "quincenal",
    horario: horarioConAlmuerzo(),
    // La excepción va en un día sin citas: si el cliente reserva desde la
    // vista pública solo ve huecos libres, así que no debería haber citas en
    // un día marcado como no disponible.
    excepciones: [
      {
        fecha: haceDias(-1),
        disponible: false,
        desde: null,
        hasta: null,
        nota: "Permiso por emergencia familiar",
      },
      // Una excepción disponible reemplaza el horario del día: medio turno.
      {
        fecha: haceDias(-2),
        disponible: true,
        desde: "09:00",
        hasta: "13:00",
        nota: "Medio turno",
      },
    ],
  },
  {
    id: 3, nombre: "Dr. Julio Mendoza", foto_url: "/images/profile/user-3.jpg",
    usuario: "julio.mendoza@elrosal.pe", email: "julio.mendoza@elrosal.pe",
    rol_id: PROFESIONAL.id, rol: PROFESIONAL, cargo: "DOCTOR",
    telefono: "+51987112903", activo: true, atiende: true, tipo_pago: "comision",
    comision_porcentaje: 25, monto_sueldo: null, periodo_pago: null,
    horario: horarioPorDefecto(), excepciones: [],
  },
  {
    id: 4, nombre: "Lic. Rosa Paredes", foto_url: "/images/profile/user-4.jpg",
    usuario: "rosa.paredes@elrosal.pe", email: "rosa.paredes@elrosal.pe",
    rol_id: PROFESIONAL.id, rol: PROFESIONAL, cargo: "laboratorista",
    telefono: "+51955320118", activo: true, atiende: true, tipo_pago: "comision",
    comision_porcentaje: 20, monto_sueldo: null, periodo_pago: null,
    horario: horarioConAlmuerzo(), excepciones: [],
  },
  {
    // Entra al panel pero no sale en la agenda: no ocupa plaza del plan.
    id: 5, nombre: "Srta. Lucía Herrera", foto_url: "/images/profile/user-5.jpg",
    usuario: "lucia.herrera@elrosal.pe", email: "lucia.herrera@elrosal.pe",
    rol_id: RECEPCION.id, rol: RECEPCION, cargo: "Recepción",
    telefono: "+51931208776", activo: true, atiende: false, tipo_pago: "sueldo",
    comision_porcentaje: 0, monto_sueldo: 1800, periodo_pago: "mensual",
    horario: horarioPorDefecto(), excepciones: [],
  },
  {
    id: 6, nombre: "Dr. Andrés Vílchez", foto_url: "/images/profile/user-6.jpg",
    usuario: "andres.vilchez@elrosal.pe", email: "andres.vilchez@elrosal.pe",
    rol_id: PROFESIONAL.id, rol: PROFESIONAL, cargo: "pediatra",
    telefono: "+51998023471", activo: false, atiende: true, tipo_pago: "comision",
    comision_porcentaje: 30, monto_sueldo: null, periodo_pago: null,
    horario: horarioPorDefecto(), excepciones: [],
  },
];
