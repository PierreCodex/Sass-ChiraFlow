import type { Categoria } from "./types";

export const categoriasMock: Categoria[] = [
  {
    id: 1,
    nombre: "Consultas",
    descripcion: "Atención médica general y especializada",
    color: "#5D87FF",
    orden: 1,
    imagen_url: null,
    servicios_count: 5,
  },
  {
    id: 2,
    nombre: "Odontología",
    descripcion: "Limpieza, ortodoncia y tratamientos dentales",
    color: "#49BEFF",
    orden: 2,
    imagen_url: null,
    servicios_count: 4,
  },
  {
    id: 3,
    nombre: "Laboratorio",
    descripcion: "Análisis clínicos y toma de muestras",
    color: "#13DEB9",
    orden: 3,
    imagen_url: null,
    servicios_count: 3,
  },
  {
    id: 4,
    nombre: "Estética",
    descripcion: "Tratamientos faciales y corporales",
    color: "#FFAE1F",
    orden: 4,
    imagen_url: null,
    servicios_count: 3,
  },
  {
    id: 5,
    nombre: "Terapia física",
    // Sin color ni imagen: en la tabla no se muestra nada a la izquierda.
    descripcion: null,
    color: null,
    orden: 5,
    imagen_url: null,
    servicios_count: 2,
  },
];
