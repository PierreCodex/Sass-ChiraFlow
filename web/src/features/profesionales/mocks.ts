import { haceDias } from "@/lib/mock-utils";
import type { RolResumen } from "@/features/roles/types";
import { horarioPorDefecto } from "./constants";
import type { CuentaDelProfesional, DiaHorario, Profesional } from "./types";

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

/** Atajo: la cuenta del panel de quien sí entra al sistema. */
const cuenta = (
  id: number,
  email: string,
  rol: RolResumen
): CuentaDelProfesional => ({
  id,
  email,
  activo: true,
  rol_id: rol.id,
  rol,
});

/*
  Cinco fichas que cubren los casos que la pantalla tiene que saber pintar.

  Lo importante es quién NO tiene cuenta: dos de los cinco. Antes era
  imposible —el correo era obligatorio y había que inventárselo—, y un correo
  inventado es peor que ninguno porque parece un canal y no lo es.

  Y no está la recepcionista, que sí estaba antes: no presta servicios, así
  que su sitio es Usuarios y no esta tabla. Que falte aquí es parte de lo que
  hay que ver.
*/
export const profesionalesMock: Profesional[] = [
  {
    id: 1, nombre: "Manuel Ganoza", foto_url: "/images/profile/user-1.jpg",
    usuario: cuenta(1, "manuel@elrosal.pe", DUENO),
    cargo: "Dueño", telefono: "+51981912809",
    activo: true, atiende: true, tipo_pago: "sueldo", comision_porcentaje: 0,
    monto_sueldo: 12000, periodo_pago: "mensual",
    horario: horarioPorDefecto(), excepciones: [],
  },
  {
    id: 2, nombre: "Dra. Carmen Ríos", foto_url: "/images/profile/user-2.jpg",
    usuario: cuenta(2, "carmen.rios@elrosal.pe", PROFESIONAL),
    cargo: "doctor cirujano",
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
    // El caso que antes no se podía dar de alta: presta servicios y nunca
    // abre el panel.
    id: 3, nombre: "Dr. Julio Mendoza", foto_url: "/images/profile/user-3.jpg",
    usuario: null,
    cargo: "DOCTOR",
    telefono: "+51987112903", activo: true, atiende: true, tipo_pago: "comision",
    comision_porcentaje: 25, monto_sueldo: null, periodo_pago: null,
    horario: horarioPorDefecto(), excepciones: [],
  },
  {
    // Atiende pero no sale en la tienda: solo le reservan por teléfono. Ocupa
    // plaza igual, porque está de alta.
    id: 4, nombre: "Lic. Rosa Paredes", foto_url: "/images/profile/user-4.jpg",
    usuario: null,
    cargo: "laboratorista",
    telefono: "+51955320118", activo: true, atiende: false, tipo_pago: "comision",
    comision_porcentaje: 20, monto_sueldo: null, periodo_pago: null,
    horario: horarioConAlmuerzo(), excepciones: [],
  },
  {
    // De baja: conserva su cuenta del panel, que es justo lo que el diálogo
    // de borrado tiene que explicar.
    id: 5, nombre: "Dr. Andrés Vílchez", foto_url: "/images/profile/user-6.jpg",
    usuario: cuenta(3, "andres.vilchez@elrosal.pe", PROFESIONAL),
    cargo: "pediatra",
    telefono: "+51998023471", activo: false, atiende: true, tipo_pago: "comision",
    comision_porcentaje: 30, monto_sueldo: null, periodo_pago: null,
    horario: horarioPorDefecto(), excepciones: [],
  },
];
