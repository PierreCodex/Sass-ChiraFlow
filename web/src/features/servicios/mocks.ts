import type { Servicio } from "./types";

const consultas = { id: 1, nombre: "Consultas" };
const odontologia = { id: 2, nombre: "Odontología" };
const laboratorio = { id: 3, nombre: "Laboratorio" };

const carmen = { id: 1, nombre: "Dra. Carmen Ríos" };
const julio = { id: 2, nombre: "Dr. Julio Mendoza" };
const rosaLab = { id: 3, nombre: "Lic. Rosa Paredes" };
const andres = { id: 6, nombre: "Dr. Andrés Vílchez" };

export const serviciosMock: Servicio[] = [
  { id: 1, nombre: "AAA", descripcion: null, color: "#5D87FF", categoria: null, tipo: "normal", max_sesiones: null, duracion_min: 30, precio: 20, activo: true, imagen_principal: null, galeria: [], empleados: [] },
  { id: 2, nombre: "ATENCION DEL MEDICO", descripcion: "Atención general del médico de turno", color: "#763EBD", categoria: null, tipo: "normal", max_sesiones: null, duracion_min: 60, precio: 45, activo: true, imagen_principal: null, galeria: [], empleados: [carmen] },
  { id: 3, nombre: "Consulta general", descripcion: "Evaluación médica general", color: "#13DEB9", categoria: consultas, tipo: "normal", max_sesiones: null, duracion_min: 30, precio: 60, activo: true, imagen_principal: null, galeria: [], empleados: [carmen, andres] },
  { id: 4, nombre: "Consulta pediátrica", descripcion: "Atención para niños de 0 a 12 años", color: "#49BEFF", categoria: consultas, tipo: "normal", max_sesiones: null, duracion_min: 30, precio: 80, activo: true, imagen_principal: null, galeria: [], empleados: [andres] },
  { id: 5, nombre: "Control de presión", descripcion: "Toma y registro de presión arterial", color: "#FFAE1F", categoria: consultas, tipo: "normal", max_sesiones: null, duracion_min: 15, precio: 25, activo: true, imagen_principal: null, galeria: [], empleados: [rosaLab] },
  { id: 6, nombre: "Limpieza dental", descripcion: "Profilaxis y destartraje", color: "#49BEFF", categoria: odontologia, tipo: "normal", max_sesiones: null, duracion_min: 45, precio: 90, activo: true, imagen_principal: null, galeria: [], empleados: [julio] },
  { id: 7, nombre: "Extracción simple", descripcion: "Extracción de pieza dental", color: "#FA896B", categoria: odontologia, tipo: "normal", max_sesiones: null, duracion_min: 40, precio: 130, activo: true, imagen_principal: null, galeria: [], empleados: [julio] },
  { id: 8, nombre: "Curación dental", descripcion: "Restauración con resina", color: "#763EBD", categoria: odontologia, tipo: "normal", max_sesiones: null, duracion_min: 50, precio: 110, activo: true, imagen_principal: null, galeria: [], empleados: [julio] },
  { id: 9, nombre: "Hemograma completo", descripcion: "Análisis de sangre completo", color: "#13DEB9", categoria: laboratorio, tipo: "normal", max_sesiones: null, duracion_min: 15, precio: 55, activo: true, imagen_principal: null, galeria: [], empleados: [rosaLab] },
  { id: 10, nombre: "Perfil lipídico", descripcion: "Colesterol y triglicéridos", color: "#0A7EA4", categoria: laboratorio, tipo: "normal", max_sesiones: null, duracion_min: 15, precio: 75, activo: true, imagen_principal: null, galeria: [], empleados: [rosaLab] },
  { id: 11, nombre: "Prueba de glucosa", descripcion: "Glucosa en ayunas", color: "#FB9678", categoria: laboratorio, tipo: "normal", max_sesiones: null, duracion_min: 10, precio: 35, activo: true, imagen_principal: null, galeria: [], empleados: [rosaLab] },
  { id: 12, nombre: "Certificado médico", descripcion: "Emisión de certificado de salud", color: "#FFAE1F", categoria: consultas, tipo: "normal", max_sesiones: null, duracion_min: 20, precio: 45, activo: false, imagen_principal: null, galeria: [], empleados: [carmen] },
];
