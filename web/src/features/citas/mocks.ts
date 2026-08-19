import { haceDias } from "@/lib/mock-utils";
import type { Cita } from "./types";

const hoy = haceDias(0);
const manana = haceDias(-1);
const ayer = haceDias(1);

const carmen = { id: 2, nombre: "Dra. Carmen Ríos" };
const julio = { id: 3, nombre: "Dr. Julio Mendoza" };
const rosaLab = { id: 4, nombre: "Lic. Rosa Paredes" };
const andres = { id: 6, nombre: "Dr. Andrés Vílchez" };

// El color viene del servicio y es el que pinta el bloque en el calendario.
const consultaGeneral = { id: 3, nombre: "Consulta general", duracion_min: 30, precio: 60, color: "#13DEB9" };
const pediatrica = { id: 4, nombre: "Consulta pediátrica", duracion_min: 30, precio: 80, color: "#49BEFF" };
const limpiezaDental = { id: 6, nombre: "Limpieza dental", duracion_min: 45, precio: 90, color: "#49BEFF" };
const hemograma = { id: 9, nombre: "Hemograma completo", duracion_min: 15, precio: 55, color: "#13DEB9" };
const curacion = { id: 8, nombre: "Curación dental", duracion_min: 50, precio: 110, color: "#763EBD" };
const atencionMedico = { id: 2, nombre: "ATENCION DEL MEDICO", duracion_min: 60, precio: 45, color: "#763EBD" };

export const citasMock: Cita[] = [
  { id: 101, fecha: hoy, hora_inicio: "09:00", hora_fin: "09:30", estado: "completada", monto: 60, notas: null, cliente_id: 3, cliente_nombre: "manuel", cliente_telefono: "999 191 999", cliente_email: "manuel.s@ucvvirtual.edu.pe", servicio: consultaGeneral, empleado: carmen, productos: [] },
  { id: 102, fecha: hoy, hora_inicio: "09:15", hora_fin: "10:00", estado: "completada", monto: 108, notas: "Paciente con sensibilidad", cliente_id: 1, cliente_nombre: "Ana Torres Vega", cliente_telefono: "976 865 756", cliente_email: "ana.torres@gmail.com", servicio: limpiezaDental, empleado: julio, productos: [{ producto_id: 1, nombre: "Enjuague bucal 500ml", cantidad: 1, precio_unitario: 18 }] },
  { id: 103, fecha: hoy, hora_inicio: "10:00", hora_fin: "10:15", estado: "completada", monto: 55, notas: null, cliente_id: 17, cliente_nombre: "Patricia Núñez Ríos", cliente_telefono: "955 703 118", cliente_email: "paty.nunez@gmail.com", servicio: hemograma, empleado: rosaLab, productos: [] },
  { id: 104, fecha: hoy, hora_inicio: "11:00", hora_fin: "11:30", estado: "confirmada", monto: 60, notas: null, cliente_id: 19, cliente_nombre: "Rosa Medina Campos", cliente_telefono: "912 330 776", cliente_email: "rosa.medina@gmail.com", servicio: consultaGeneral, empleado: carmen, productos: [] },
  { id: 105, fecha: hoy, hora_inicio: "15:00", hora_fin: "15:30", estado: "pendiente", monto: 80, notas: "Primera consulta", cliente_id: null, cliente_nombre: "jeampier", cliente_telefono: "+51 981 912 809", cliente_email: "jeampier@ucvvirtual.edu.pe", servicio: pediatrica, empleado: andres, productos: [] },
  { id: 106, fecha: hoy, hora_inicio: "16:00", hora_fin: "16:50", estado: "pendiente", monto: 110, notas: null, cliente_id: 18, cliente_nombre: "Carlos Espinoza Díaz", cliente_telefono: null, cliente_email: "cespinoza@yahoo.com", servicio: curacion, empleado: julio, productos: [] },
  { id: 107, fecha: hoy, hora_inicio: "17:30", hora_fin: "18:00", estado: "pendiente", monto: 60, notas: null, cliente_id: 15, cliente_nombre: "jean pier", cliente_telefono: "929 399 678", cliente_email: "jeampier13@gmail.com", servicio: consultaGeneral, empleado: carmen, productos: [] },
  { id: 108, fecha: hoy, hora_inicio: "12:00", hora_fin: "13:00", estado: "pendiente", monto: 65, notas: "quiero lo urgente", cliente_id: 5, cliente_nombre: "sandro david", cliente_telefono: "902 743 580", cliente_email: "englobor@gmail.com", servicio: atencionMedico, empleado: julio, productos: [{ producto_id: 6, nombre: "Crema hidratante facial", cantidad: 1, precio_unitario: 65 }], metodo_pago: "qr", estado_pago: "pendiente" },
  { id: 109, fecha: hoy, hora_inicio: "15:30", hora_fin: "16:00", estado: "cancelada", monto: 60, notas: "Canceló por teléfono", cliente_id: 4, cliente_nombre: "Luis Fernández Soto", cliente_telefono: "904 169 872", cliente_email: "lfernandez@hotmail.com", servicio: consultaGeneral, empleado: carmen, productos: [] },
  { id: 118, fecha: hoy, hora_inicio: "14:30", hora_fin: "15:30", estado: "confirmada", monto: 45, notas: null, cliente_id: null, cliente_nombre: "rambo", cliente_telefono: "976 865 756", cliente_email: null, servicio: atencionMedico, empleado: rosaLab, productos: [] },
  { id: 119, fecha: hoy, hora_inicio: "09:00", hora_fin: "09:30", estado: "confirmada", monto: 20, notas: null, cliente_id: 7, cliente_nombre: "Test", cliente_telefono: "999", cliente_email: null, servicio: consultaGeneral, empleado: andres, productos: [] },

  { id: 110, fecha: manana, hora_inicio: "09:00", hora_fin: "09:45", estado: "confirmada", monto: 90, notas: null, cliente_id: 2, cliente_nombre: "LPUIT", cliente_telefono: "+51 981 912 809", cliente_email: "lpuit@ucvvirtual.edu.pe", servicio: limpiezaDental, empleado: julio, productos: [] },
  { id: 111, fecha: manana, hora_inicio: "10:30", hora_fin: "11:00", estado: "pendiente", monto: 80, notas: null, cliente_id: 16, cliente_nombre: "maria", cliente_telefono: "987 678 988", cliente_email: "submarino_20@hotmail.com", servicio: pediatrica, empleado: andres, productos: [] },
  { id: 112, fecha: manana, hora_inicio: "14:00", hora_fin: "14:15", estado: "pendiente", monto: 55, notas: null, cliente_id: null, cliente_nombre: "Cliente de mostrador", cliente_telefono: "999 000 111", cliente_email: null, servicio: hemograma, empleado: rosaLab, productos: [] },

  { id: 113, fecha: ayer, hora_inicio: "09:00", hora_fin: "09:30", estado: "completada", monto: 60, notas: null, cliente_id: 11, cliente_nombre: "ROI NIMA", cliente_telefono: "981 912 809", cliente_email: "roinima@gmail.com", servicio: consultaGeneral, empleado: carmen, productos: [] },
  { id: 114, fecha: ayer, hora_inicio: "10:00", hora_fin: "10:50", estado: "completada", monto: 110, notas: null, cliente_id: 13, cliente_nombre: "ROI GAVINO NIMA", cliente_telefono: "917 243 897", cliente_email: "rgavino@ucvvirtual.edu.pe", servicio: curacion, empleado: julio, productos: [] },
  { id: 115, fecha: ayer, hora_inicio: "11:00", hora_fin: "11:45", estado: "cancelada", monto: 90, notas: "No se presentó", cliente_id: 6, cliente_nombre: "ANGELICA GABINO HUERTA", cliente_telefono: "904 169 872", cliente_email: "agabino@ucvvirtual.edu.pe", servicio: limpiezaDental, empleado: julio, productos: [] },
  { id: 116, fecha: haceDias(2), hora_inicio: "08:00", hora_fin: "08:45", estado: "completada", monto: 90, notas: null, cliente_id: 9, cliente_nombre: "sandro david juarez gabino", cliente_telefono: "999 292 999", cliente_email: "sandroyoto@gmail.com", servicio: limpiezaDental, empleado: julio, productos: [] },
  { id: 117, fecha: haceDias(2), hora_inicio: "09:30", hora_fin: "10:00", estado: "completada", monto: 80, notas: null, cliente_id: 10, cliente_nombre: "JEAN", cliente_telefono: "+51 981 912 809", cliente_email: "jean.g@ucvvirtual.edu.pe", servicio: pediatrica, empleado: andres, productos: [] },
];
