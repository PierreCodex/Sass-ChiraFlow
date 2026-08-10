import { haceDias } from "@/lib/mock-utils";
import type { Cliente } from "./types";

export const clientesMock: Cliente[] = [
  { id: 1, nombre: "Ana Torres Vega", telefono: "976 865 756", email: "ana.torres@gmail.com", total_citas: 2, ultima_cita: haceDias(0) },
  { id: 2, nombre: "LPUIT", telefono: "+51 981 912 809", email: "lpuit@ucvvirtual.edu.pe", total_citas: 1, ultima_cita: haceDias(0) },
  { id: 3, nombre: "manuel", telefono: "999 191 999", email: "manuel.s@ucvvirtual.edu.pe", total_citas: 1, ultima_cita: haceDias(0) },
  { id: 4, nombre: "Luis Fernández Soto", telefono: "904 169 872", email: "lfernandez@hotmail.com", total_citas: 3, ultima_cita: haceDias(1) },
  { id: 5, nombre: "sandro david", telefono: "902 743 580", email: "englobor@gmail.com", total_citas: 1, ultima_cita: haceDias(1) },
  { id: 6, nombre: "ANGELICA GABINO HUERTA", telefono: "904 169 872", email: "agabino@ucvvirtual.edu.pe", total_citas: 3, ultima_cita: haceDias(1) },
  { id: 7, nombre: "Test", telefono: "999", email: null, total_citas: 1, ultima_cita: haceDias(1) },
  { id: 8, nombre: "jeampier", telefono: "+51 981 912 809", email: "jeampier@ucvvirtual.edu.pe", total_citas: 2, ultima_cita: haceDias(1) },
  { id: 9, nombre: "sandro david juarez gabino", telefono: "999 292 999", email: "sandroyoto@gmail.com", total_citas: 1, ultima_cita: haceDias(1) },
  { id: 10, nombre: "JEAN", telefono: "+51 981 912 809", email: "jean.g@ucvvirtual.edu.pe", total_citas: 2, ultima_cita: haceDias(1) },
  { id: 11, nombre: "ROI NIMA", telefono: "981 912 809", email: "roinima@gmail.com", total_citas: 1, ultima_cita: haceDias(4) },
  { id: 12, nombre: "SAMIR DEYBI JUAREZ HUALLANAI", telefono: "952 532 038", email: "samir@ucvvirtual.edu.pe", total_citas: 1, ultima_cita: haceDias(5) },
  { id: 13, nombre: "ROI GAVINO NIMA", telefono: "917 243 897", email: "rgavino@ucvvirtual.edu.pe", total_citas: 1, ultima_cita: haceDias(5) },
  { id: 14, nombre: "ROI GAVINO HUERNA", telefono: "917 243 723", email: "roi.h@ucvvirtual.edu.pe", total_citas: 1, ultima_cita: haceDias(6) },
  { id: 15, nombre: "jean pier", telefono: "929 399 678", email: "jeampier13@gmail.com", total_citas: 1, ultima_cita: haceDias(11) },
  { id: 16, nombre: "maria", telefono: "987 678 988", email: "submarino_20@hotmail.com", total_citas: 2, ultima_cita: haceDias(11) },
  { id: 17, nombre: "Patricia Núñez Ríos", telefono: "955 703 118", email: "paty.nunez@gmail.com", total_citas: 4, ultima_cita: haceDias(14) },
  { id: 18, nombre: "Carlos Espinoza Díaz", telefono: null, email: "cespinoza@yahoo.com", total_citas: 1, ultima_cita: haceDias(19) },
  { id: 19, nombre: "Rosa Medina Campos", telefono: "912 330 776", email: "rosa.medina@gmail.com", total_citas: 6, ultima_cita: haceDias(23) },
  { id: 20, nombre: "Fernando Rojas Ayala", telefono: "988 441 209", email: null, total_citas: 0, ultima_cita: null },
];
