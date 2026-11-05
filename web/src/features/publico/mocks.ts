import { serviciosMock } from "@/features/servicios/mocks";
import { categoriasMock } from "@/features/categorias/mocks";
import { localesMock } from "@/features/locales/mocks";
import { localProfesionalMock } from "@/features/locales/mocks-recursos";
import { profesionalesMock } from "@/features/profesionales/mocks";
import { seOfreceMock } from "@/features/servicios/reservabilidad-mock";
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
  nombre: "Clínica El Rosal",
  slug: "clinica-el-rosal",
  telefono: "976645666",
  email: "contacto@elrosal.pe",
};

function aServicioPublico(servicio: (typeof serviciosMock)[number]): ServicioPublico {
  return {
    id: servicio.id,
    nombre: servicio.nombre,
    descripcion: servicio.descripcion,
    duracion_min: servicio.duracion_min,
    precio: servicio.precio,
    color: servicio.color,
    // Story 6.3: como el backend, sin fotos hasta la 5.2 (claves opacas). Así
    // también se ve en desarrollo la tienda tal como saldrá.
    imagen_principal: null,
    galeria: [],
  };
}

/**
 * Las combinaciones servicio + profesional que se pueden reservar en una sede:
 * la regla del backend (`Reservabilidad`, Épica 2), con los mocks del panel.
 * Servicio activo y ofrecido en la sede; profesional activo, que atiende,
 * habilitado en la sede y que presta el servicio. Lo que los mocks no tienen
 * (`visible_publico`, categoría desactivada) no se simula.
 */
function paresEn(localId: number) {
  const habilitados = (localProfesionalMock[localId] ?? []).filter((fila) => fila.habilitado);

  return serviciosMock
    .filter((servicio) => servicio.activo && seOfreceMock(localId, servicio.id))
    .flatMap((servicio) =>
      habilitados
        .filter((fila) => {
          const profesional = profesionalesMock.find((item) => item.id === fila.id);
          return (
            profesional?.activo &&
            profesional.atiende &&
            servicio.empleados.some((empleado) => empleado.id === fila.id)
          );
        })
        .map((fila) => ({ servicio, profesionalId: fila.id }))
    );
}

/**
 * Story 6.3: el catálogo de la sede, solo con lo reservable en ella. Por
 * categoría (`orden`, nombre) y «Otros servicios» al final.
 */
export function categoriasPublicas(localId: number): CategoriaPublica[] {
  const reservables = [...new Map(paresEn(localId).map(({ servicio }) => [servicio.id, servicio])).values()]
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  const conCategoria = [...categoriasMock]
    .sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre))
    .map((categoria) => ({
      id: categoria.id,
      nombre: categoria.nombre,
      servicios: reservables
        .filter((servicio) => servicio.categoria?.id === categoria.id)
        .map(aServicioPublico),
    }))
    .filter((categoria) => categoria.servicios.length > 0);

  const sueltos = reservables
    .filter((servicio) => !servicio.categoria)
    .map(aServicioPublico);

  return sueltos.length
    ? [...conCategoria, { id: null, nombre: "Otros servicios", servicios: sueltos }]
    : conCategoria;
}

/**
 * Quien tiene algo que reservar en esa sede, con los servicios que presta en
 * ella (Story 6.3).
 */
export function profesionalesDelLocal(localId: number): ProfesionalPublico[] {
  const pares = paresEn(localId);
  const asignados = localProfesionalMock[localId] ?? [];

  return asignados
    .flatMap((asignado) => {
    const servicios = pares
      .filter((par) => par.profesionalId === asignado.id)
      .map((par) => par.servicio.id)
      .sort((a, b) => a - b);
    const empleado = profesionalesMock.find((item) => item.id === asignado.id);
    if (!servicios.length || !empleado) return [];

    return [
      {
        id: asignado.id,
        // El nombre público manda sobre el real: es el que ve el cliente.
        nombre: asignado.nombre_publico || empleado.nombre,
        perfil: asignado.perfil,
        // Como el backend: sin fotos hasta la Story 5.2.
        foto_url: null,
        servicios,
      },
    ];
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }));
}

function aLocalPublico(local: (typeof localesMock)[number]): LocalPublico {
  return {
    id: local.id,
    slug: local.slug,
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

/** La sede por su slug o —como el backend en transición— por su id. */
export function tiendaLocalMock(sede: string): TiendaLocal | null {
  const local = localesMock.find((item) => item.slug === sede || String(item.id) === sede);
  if (!local) return null;
  const localId = local.id;

  const resenas = resenasPorLocal[localId] ?? [];

  return {
    negocio: negocioMock,
    local: aLocalPublico(local),
    categorias: categoriasPublicas(localId),
    profesionales: profesionalesDelLocal(localId),
    resenas: resumirResenas(resenas),
    ultimas_resenas: resenas,
  };
}
