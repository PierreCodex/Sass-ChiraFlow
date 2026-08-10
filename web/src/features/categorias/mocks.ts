import type { Categoria } from "./types";

export const categoriasMock: Categoria[] = [
  {
    id: 1,
    nombre: "Consultas",
    descripcion: "Atención médica general y especializada",
    color: "#5D87FF",
    servicios_count: 5,
    activa: true,
  },
  {
    id: 2,
    nombre: "Odontología",
    descripcion: "Limpieza, ortodoncia y tratamientos dentales",
    color: "#49BEFF",
    servicios_count: 4,
    activa: true,
  },
  {
    id: 3,
    nombre: "Laboratorio",
    descripcion: "Análisis clínicos y toma de muestras",
    color: "#13DEB9",
    servicios_count: 3,
    activa: true,
  },
  {
    id: 4,
    nombre: "Estética",
    descripcion: "Tratamientos faciales y corporales",
    color: "#FFAE1F",
    servicios_count: 3,
    activa: true,
  },
  {
    id: 5,
    nombre: "Terapia física",
    descripcion: "Rehabilitación y masajes terapéuticos",
    color: "#FA896B",
    servicios_count: 2,
    activa: false,
  },
];
