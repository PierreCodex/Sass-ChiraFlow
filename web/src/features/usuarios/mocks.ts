import type { RolResumen } from "@/features/roles/types";
import type { Usuario } from "./types";

/*
  Los mismos ids que `features/roles/mocks.ts`: el select del formulario lee de
  allí y aquí se pinta el nombre, así que si no coincidieran la tabla diría un
  rol y el desplegable marcaría otro.
*/
const DUENO: RolResumen = { id: 1, nombre: "Administrador general", clave: "dueno" };
const PROFESIONAL: RolResumen = { id: 3, nombre: "Profesional", clave: "profesional" };
const RECEPCION: RolResumen = { id: 4, nombre: "Recepción", clave: null };

/*
  Tres cuentas que enseñan las tres combinaciones que existen, porque son
  justo lo que la pantalla tiene que saber pintar:

  - el dueño, que además atiende;
  - una profesional con cuenta, que ve su agenda;
  - una recepcionista, que entra al panel y NO tiene ficha de profesional.

  Falta a propósito el cuarto caso —el barbero sin cuenta—: ese no sale aquí,
  sale solo en Profesionales. Que no aparezca es parte de lo que hay que ver.
*/
export const usuariosMock: Usuario[] = [
  {
    id: 1,
    nombre: "Manuel",
    apellido: "Ganoza Callare",
    email: "manuel@elrosal.pe",
    telefono: "+51981912809",
    activo: true,
    rol_id: DUENO.id,
    rol: DUENO,
    profesional: { id: 1, nombre: "Manuel Ganoza", atiende: true },
  },
  {
    id: 2,
    nombre: "Carmen",
    apellido: "Ríos",
    email: "carmen.rios@elrosal.pe",
    telefono: "+51987441220",
    activo: true,
    rol_id: PROFESIONAL.id,
    rol: PROFESIONAL,
    profesional: { id: 2, nombre: "Dra. Carmen Ríos", atiende: true },
  },
  {
    id: 3,
    nombre: "Lucía",
    apellido: "Paredes",
    email: "recepcion@elrosal.pe",
    telefono: "+51956220117",
    activo: true,
    rol_id: RECEPCION.id,
    rol: RECEPCION,
    // Sin ficha: no presta servicios y no ocupa plaza del plan.
    profesional: null,
  },
];
