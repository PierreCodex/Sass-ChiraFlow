import type { Grupo, LocalProfesional } from "./types";

/**
 * Estado de `local_profesional` por local.
 *
 * La clave es el id del local. Cada lista trae **todos** los profesionales
 * del negocio: los que no tienen fila en la pivote llegan con
 * `habilitado: false` y el resto en null, igual que en
 * `RecursoController::index`.
 */
export const localProfesionalMock: Record<number, LocalProfesional[]> = {
  // Local 1 (principal)
  1: [
    {
      id: 2,
      nombre: "Dra. Carmen Ríos",
      foto_url: null,
      habilitado: true,
      nombre_publico: "Dra. Carmen",
      perfil:
        "Médica general con 12 años de experiencia en atención primaria y control de enfermedades crónicas.",
      horario_apertura: "09:00",
      horario_cierre: "18:00",
    },
    {
      id: 3,
      nombre: "Dr. Julio Mendoza",
      foto_url: null,
      habilitado: true,
      nombre_publico: null,
      perfil: "Odontólogo especialista en rehabilitación oral.",
      horario_apertura: "10:00",
      horario_cierre: "19:00",
    },
    {
      id: 4,
      nombre: "Lic. Rosa Paredes",
      foto_url: null,
      habilitado: true,
      nombre_publico: null,
      perfil: null,
      horario_apertura: null,
      horario_cierre: null,
    },
    {
      id: 6,
      nombre: "Dr. Andrés Vílchez",
      foto_url: null,
      habilitado: true,
      nombre_publico: "Dr. Andrés V.",
      perfil: "Pediatra. Atiende niños de 0 a 12 años.",
      horario_apertura: "08:00",
      horario_cierre: "14:00",
    },
  ],
  // la molina
  2: [
    {
      id: 2,
      nombre: "Dra. Carmen Ríos",
      foto_url: null,
      habilitado: true,
      nombre_publico: null,
      perfil: null,
      horario_apertura: "15:00",
      horario_cierre: "20:00",
    },
    {
      id: 3,
      nombre: "Dr. Julio Mendoza",
      foto_url: null,
      habilitado: false,
      nombre_publico: null,
      perfil: null,
      horario_apertura: null,
      horario_cierre: null,
    },
    {
      id: 4,
      nombre: "Lic. Rosa Paredes",
      foto_url: null,
      habilitado: false,
      nombre_publico: null,
      perfil: null,
      horario_apertura: null,
      horario_cierre: null,
    },
    {
      id: 6,
      nombre: "Dr. Andrés Vílchez",
      foto_url: null,
      habilitado: false,
      nombre_publico: null,
      perfil: null,
      horario_apertura: null,
      horario_cierre: null,
    },
  ],
  // Sucursal Miraflores — todavía sin nadie asignado
  3: [
    {
      id: 2,
      nombre: "Dra. Carmen Ríos",
      foto_url: null,
      habilitado: false,
      nombre_publico: null,
      perfil: null,
      horario_apertura: null,
      horario_cierre: null,
    },
    {
      id: 3,
      nombre: "Dr. Julio Mendoza",
      foto_url: null,
      habilitado: false,
      nombre_publico: null,
      perfil: null,
      horario_apertura: null,
      horario_cierre: null,
    },
    {
      id: 4,
      nombre: "Lic. Rosa Paredes",
      foto_url: null,
      habilitado: false,
      nombre_publico: null,
      perfil: null,
      horario_apertura: null,
      horario_cierre: null,
    },
    {
      id: 6,
      nombre: "Dr. Andrés Vílchez",
      foto_url: null,
      habilitado: false,
      nombre_publico: null,
      perfil: null,
      horario_apertura: null,
      horario_cierre: null,
    },
  ],
};

export const gruposMock: Grupo[] = [
  {
    id: 1,
    nombre: "Odontología",
    locales: [
      { id: 1, nombre: "Local 1" },
      { id: 2, nombre: "la molina" },
    ],
    profesionales: [{ id: 3, nombre: "Dr. Julio Mendoza" }],
    servicios: [
      { id: 6, nombre: "Limpieza dental" },
      { id: 7, nombre: "Extracción simple" },
      { id: 8, nombre: "Curación dental" },
    ],
  },
  {
    id: 2,
    nombre: "Laboratorio",
    locales: [{ id: 1, nombre: "Local 1" }],
    profesionales: [{ id: 4, nombre: "Lic. Rosa Paredes" }],
    servicios: [
      { id: 9, nombre: "Hemograma completo" },
      { id: 10, nombre: "Perfil lipídico" },
      { id: 11, nombre: "Prueba de glucosa" },
    ],
  },
  {
    id: 3,
    nombre: "Turno tarde La Molina",
    locales: [{ id: 2, nombre: "la molina" }],
    profesionales: [
      { id: 2, nombre: "Dra. Carmen Ríos" },
    ],
    servicios: [],
  },
];
