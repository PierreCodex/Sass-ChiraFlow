import { serviciosMock } from "@/features/servicios/mocks";
import { categoriasMock } from "@/features/categorias/mocks";
import { localesMock } from "@/features/locales/mocks";
import { localProfesionalMock } from "@/features/locales/mocks-recursos";
import { empleadosMock } from "@/features/empleados/mocks";
import { haceDias } from "@/lib/mock-utils";
import type {
  CategoriaPublica,
  LocalPublico,
  NegocioPublico,
  ProfesionalPublico,
  Resena,
  ResumenResenas,
  ServicioPublico,
  TiendaLocal,
} from "./types";

/**
 * La tienda se arma con los **mismos mocks del panel**, filtrando lo que el
 * cliente final no debe ver. Así, si en el panel desactivas un servicio o
 * deshabilitas a alguien en una sede, la tienda lo refleja — que es
 * exactamente lo que hará el backend real.
 */

export const negocioMock: NegocioPublico = {
  id: 1,
  nombre: "Clínica El Rosal",
  slug: "clinica-el-rosal",
  telefono: "976645666",
  email: "contacto@elrosal.pe",
  // Mismos valores que `configuracionMock` (Configuración → Pagos QR),
  // para que la tienda pública y el panel del negocio muestren lo mismo.
  pago_qr_activo: true,
  pago_qr_url: null,
  pago_qr_instrucciones: "JAIRO ISAEL - YAPE",
};

function aServicioPublico(servicio: (typeof serviciosMock)[number]): ServicioPublico {
  return {
    id: servicio.id,
    nombre: servicio.nombre,
    descripcion: servicio.descripcion,
    duracion_min: servicio.duracion_min,
    precio: servicio.precio,
    color: servicio.color,
    imagen_principal: servicio.imagen_principal,
    galeria: servicio.galeria,
  };
}

/** Categorías con sus servicios activos, más "Otros" al final. */
export function categoriasPublicas(): CategoriaPublica[] {
  const activos = serviciosMock.filter((servicio) => servicio.activo);

  const conCategoria = [...categoriasMock]
    .sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre))
    .map((categoria) => ({
      id: categoria.id,
      nombre: categoria.nombre,
      servicios: activos
        .filter((servicio) => servicio.categoria?.id === categoria.id)
        .map(aServicioPublico),
    }))
    .filter((categoria) => categoria.servicios.length > 0);

  const sueltos = activos
    .filter((servicio) => !servicio.categoria)
    .map(aServicioPublico);

  return sueltos.length
    ? [...conCategoria, { id: null, nombre: "Otros servicios", servicios: sueltos }]
    : conCategoria;
}

/** Solo los habilitados en esa sede y activos en el negocio. */
export function profesionalesDelLocal(localId: number): ProfesionalPublico[] {
  const asignados = localProfesionalMock[localId] ?? [];

  return asignados
    .filter((asignado) => asignado.habilitado)
    .flatMap((asignado) => {
      const empleado = empleadosMock.find((item) => item.id === asignado.id);
      if (!empleado?.activo) return [];

      return [
        {
          id: asignado.id,
          // El nombre público manda sobre el real: es el que ve el cliente.
          nombre: asignado.nombre_publico ?? empleado.nombre,
          perfil: asignado.perfil,
          foto_url: empleado.foto_url,
        },
      ];
    });
}

function aLocalPublico(local: (typeof localesMock)[number]): LocalPublico {
  return {
    id: local.id,
    nombre: local.nombre,
    direccion: local.direccion,
    descripcion: local.descripcion_publica,
    telefono: local.telefono,
    banner_url: local.banner_url,
    logo_url: local.logo_url,
    latitud: local.latitud,
    longitud: local.longitud,
    color: local.color,
    horario_desde: local.horario_desde,
    horario_hasta: local.horario_hasta,
  };
}

export function localesPublicos(): LocalPublico[] {
  return localesMock.map(aLocalPublico);
}

/**
 * Reseñas de ejemplo. **Nada de esto existe en el backend todavía** — ver la
 * propuesta de esquema en `docs/vistas/tienda-publica.md`.
 *
 * La sede 3 (Miraflores) se deja **sin reseñas** a propósito, para ver cómo
 * queda una tienda recién abierta: es el estado en el que arranca todo
 * negocio nuevo y no puede verse rota.
 */
const resenasPorLocal: Record<number, Resena[]> = {
  1: [
    {
      id: 1,
      cliente: "Lucía R.",
      puntuacion: 5,
      comentario:
        "Puntualísimos, entré a mi hora exacta. La Dra. Carmen explica todo con calma.",
      fecha: haceDias(3),
      servicio: "Consulta general",
      respuesta: "¡Gracias Lucía! Nos alegra mucho leerte.",
    },
    {
      id: 2,
      cliente: "Diego S.",
      puntuacion: 5,
      comentario: "La limpieza dental quedó impecable y sin dolor.",
      fecha: haceDias(9),
      servicio: "Limpieza dental",
      respuesta: null,
    },
    {
      id: 3,
      cliente: "Marta G.",
      puntuacion: 4,
      comentario: "Muy buena atención, aunque esperé unos 10 minutos.",
      fecha: haceDias(16),
      servicio: "Consulta general",
      respuesta: null,
    },
    {
      id: 4,
      cliente: "Ana P.",
      puntuacion: 5,
      comentario: "Reservé por WhatsApp en dos minutos. Local limpio y ordenado.",
      fecha: haceDias(24),
      servicio: "Control de presión",
      respuesta: null,
    },
    {
      id: 5,
      cliente: "Jorge M.",
      puntuacion: 3,
      comentario: "El servicio bien, pero el estacionamiento es complicado.",
      fecha: haceDias(31),
      servicio: null,
      respuesta:
        "Gracias por avisar, Jorge. Hay parqueo público a media cuadra sobre Grau.",
    },
  ],
  2: [
    {
      id: 6,
      cliente: "Rosa T.",
      puntuacion: 5,
      comentario: "Cerca de casa y siempre encuentro cupo por la tarde.",
      fecha: haceDias(6),
      servicio: "Consulta general",
      respuesta: null,
    },
    {
      id: 7,
      cliente: "Pedro V.",
      puntuacion: 4,
      comentario: "Buena atención.",
      fecha: haceDias(20),
      servicio: null,
      respuesta: null,
    },
  ],
};

function resumirResenas(resenas: Resena[]): ResumenResenas | null {
  if (!resenas.length) return null;

  const distribucion = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as ResumenResenas["distribucion"];
  resenas.forEach((resena) => {
    distribucion[resena.puntuacion as 1 | 2 | 3 | 4 | 5] += 1;
  });

  const suma = resenas.reduce((total, resena) => total + resena.puntuacion, 0);

  return {
    promedio: Number((suma / resenas.length).toFixed(1)),
    total: resenas.length,
    distribucion,
  };
}

export function tiendaLocalMock(localId: number): TiendaLocal | null {
  const local = localesMock.find((item) => item.id === localId);
  if (!local) return null;

  const resenas = resenasPorLocal[localId] ?? [];

  return {
    negocio: negocioMock,
    local: aLocalPublico(local),
    categorias: categoriasPublicas(),
    profesionales: profesionalesDelLocal(localId),
    resenas: resumirResenas(resenas),
    ultimas_resenas: resenas,
  };
}
