import type { Local } from "./types";

export const localesMock: Local[] = [
  {
    id: 1,
    nombre: "Sede Central",
    direccion: "Av. Arequipa 1250, Lince",
    telefono: "01 445 8890",
    horario: "Lun a Sáb · 08:00 - 20:00",
    empleados_count: 6,
    activo: true,
  },
  {
    id: 2,
    nombre: "Sucursal San Isidro",
    direccion: "Calle Los Robles 480, San Isidro",
    telefono: "01 422 1177",
    horario: "Lun a Vie · 09:00 - 19:00",
    empleados_count: 3,
    activo: true,
  },
  {
    id: 3,
    nombre: "Sucursal Miraflores",
    direccion: "Av. Larco 745, Miraflores",
    telefono: "01 447 3320",
    horario: "Lun a Sáb · 10:00 - 21:00",
    empleados_count: 4,
    activo: true,
  },
  {
    id: 4,
    nombre: "Punto Surco (temporal)",
    direccion: "Av. Caminos del Inca 2100, Surco",
    telefono: "01 372 5514",
    horario: "Sáb y Dom · 09:00 - 14:00",
    empleados_count: 1,
    activo: false,
  },
];
