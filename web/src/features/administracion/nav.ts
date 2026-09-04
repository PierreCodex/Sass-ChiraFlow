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
  /**
   * La sección entera es del dueño y el backend responde **403** al resto.
   *
   * Esconderla es cortesía, no autorización: evita ofrecer una puerta que da
   * error, pero quien la cierra es Laravel. Nunca al revés — si esconder el
   * menú fuera lo que protege, bastaría con adivinar la URL.
   */
  soloDueno?: boolean;
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
        /*
         * Quién ENTRA al panel. Es lo primero del grupo porque es lo que se
         * reparte: dar de alta a alguien empieza casi siempre por decidir si
         * va a usar el sistema.
         */
        slug: "usuarios",
        titulo: "Usuarios",
        descripcion:
          "Quién puede entrar al panel y con qué rol. No hace falta que atienda clientes: una recepcionista entra y no ocupa plaza del plan.",
        soloDueno: true,
      },
      {
        /*
         * Quien PRESTA los servicios. No se llama «Empleados» porque no todo
         * el que trabaja aquí sale en esta lista —la recepcionista está en
         * Usuarios— y porque a mucha gente de esta lista no se la contrata:
         * un profesional independiente que alquila el sillón también está.
         */
        slug: "profesionales",
        titulo: "Profesionales",
        descripcion:
          "Quién presta los servicios y con qué horario. No hace falta que use el sistema. El plan limita cuántos caben.",
      },
      {
        slug: "roles",
        titulo: "Roles",
        descripcion:
          "Qué puede ver y hacer cada quien. El rol se elige al dar de alta un usuario.",
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

/**
 * ¿Se le enseña esta sección a quien está mirando?
 *
 * Vive aquí y no en cada componente para que el índice y la página de la
 * sección apliquen **la misma** regla: si divergieran, el menú escondería algo
 * que la página sigue pintando, o al revés.
 */
export function puedeVerSeccion(seccion: SeccionAdmin, esDueno: boolean) {
  return !seccion.soloDueno || esDueno;
}

/** Las secciones de un grupo que le tocan a quien está mirando. */
export function seccionesVisibles(grupo: GrupoAdmin, esDueno: boolean) {
  return grupo.secciones.filter((s) => puedeVerSeccion(s, esDueno));
}

/** Busca por slugs; devuelve `null` si la URL no corresponde a nada. */
export function buscarSeccion(grupoSlug: string, seccionSlug: string) {
  const grupo = GRUPOS_ADMIN.find((g) => g.slug === grupoSlug);
  const seccion = grupo?.secciones.find((s) => s.slug === seccionSlug);
  return grupo && seccion ? { grupo, seccion } : null;
}
