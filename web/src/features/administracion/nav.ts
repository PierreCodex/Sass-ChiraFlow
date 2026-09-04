import {
  IconBrandWhatsapp,
  IconBuildingStore,
  IconCreditCard,
  IconLifebuoy,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";

/**
 * El mapa de la vista de Administración.
 *
 * Es la segunda vista del producto: lo que se toca de vez en cuando —el
 * negocio, el equipo, el catálogo, la factura—, frente a la Vista general
 * (`layout/vertical/sidebar/MenuItems.ts`), que es lo que se abre cada mañana.
 *
 * Aquí está **solo el índice**. El panel de cada sección se maqueta después;
 * mientras tanto, `rutaActual` apunta a la pantalla que ya existe en el panel,
 * para no perder lo que está construido.
 */
export interface SeccionAdmin {
  slug: string;
  titulo: string;
  descripcion: string;
  /** Pantalla del panel que hoy hace este trabajo, si la hay. */
  rutaActual?: string;
}

export interface GrupoAdmin {
  slug: string;
  titulo: string;
  icono: any;
  secciones: SeccionAdmin[];
}

export const GRUPOS_ADMIN: GrupoAdmin[] = [
  {
    slug: "general",
    titulo: "General",
    icono: IconSettings,
    secciones: [
      {
        slug: "negocio",
        titulo: "Datos del negocio",
        descripcion:
          "Nombre, RUC, teléfono, dirección y la marca que ven tus clientes.",
        rutaActual: "/configuracion",
      },
      {
        slug: "horario",
        titulo: "Horario base",
        descripcion:
          "Los días y las horas en que el negocio atiende. Cada local y cada empleado pueden apartarse de aquí.",
        rutaActual: "/configuracion",
      },
    ],
  },
  {
    slug: "equipo",
    titulo: "Equipo",
    icono: IconUsers,
    secciones: [
      {
        slug: "empleados",
        titulo: "Empleados",
        descripcion:
          "Quién atiende, en qué local y con qué horario. El plan limita cuántos caben.",
      },
      {
        slug: "roles",
        titulo: "Roles",
        descripcion:
          "Qué puede ver y hacer cada quien. Hoy el rol se elige dentro de la ficha del empleado.",
      },
    ],
  },
  {
    slug: "locales",
    titulo: "Locales",
    icono: IconBuildingStore,
    secciones: [
      {
        slug: "sedes",
        titulo: "Sedes",
        descripcion: "Los locales del negocio, con su dirección y su teléfono.",
        rutaActual: "/locales",
      },
      {
        slug: "horarios",
        titulo: "Horarios de las sedes",
        descripcion:
          "El horario de cada local cuando no es el del negocio, y los días que cierra.",
        rutaActual: "/locales",
      },
    ],
  },
  {
    slug: "whatsapp",
    titulo: "WhatsApp",
    icono: IconBrandWhatsapp,
    secciones: [
      {
        slug: "plantillas",
        titulo: "Plantillas de mensaje",
        descripcion:
          "El texto de la confirmación, el recordatorio y la cancelación.",
        rutaActual: "/whatsapp",
      },
    ],
  },
  {
    slug: "facturacion",
    titulo: "Facturación",
    icono: IconCreditCard,
    secciones: [
      {
        slug: "plan",
        titulo: "Mi Plan",
        descripcion: "En qué plan estás y qué límites trae.",
        rutaActual: "/mi-plan",
      },
      {
        slug: "suscripcion",
        titulo: "Suscripción",
        descripcion: "Cambiar de plan, renovar o darla de baja.",
        rutaActual: "/mi-plan",
      },
      {
        slug: "pagos",
        titulo: "Pagos",
        descripcion: "El historial de cobros y sus comprobantes.",
        rutaActual: "/mi-plan",
      },
    ],
  },
  {
    slug: "soporte",
    titulo: "Soporte",
    icono: IconLifebuoy,
    secciones: [
      {
        slug: "tickets",
        titulo: "Tickets",
        descripcion: "Lo que nos has escrito y en qué va.",
        rutaActual: "/soporte",
      },
    ],
  },
];

/** La primera sección del índice: adonde entra `/administracion`. */
export const RUTA_ADMIN_INICIAL = `/administracion/${GRUPOS_ADMIN[0].slug}/${GRUPOS_ADMIN[0].secciones[0].slug}`;

export const rutaDeSeccion = (grupo: string, seccion: string) =>
  `/administracion/${grupo}/${seccion}`;

/** Busca por slugs; devuelve `null` si la URL no corresponde a nada. */
export function buscarSeccion(grupoSlug: string, seccionSlug: string) {
  const grupo = GRUPOS_ADMIN.find((g) => g.slug === grupoSlug);
  const seccion = grupo?.secciones.find((s) => s.slug === seccionSlug);
  return grupo && seccion ? { grupo, seccion } : null;
}
