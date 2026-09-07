import { puedeVer, type Capacidades, type Modulo } from "@/features/capacidades/types";
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
   * La sección entera es del administrador general y el backend responde
   * **403** al resto.
   *
   * Esconderla es cortesía, no autorización: evita ofrecer una puerta que da
   * error, pero quien la cierra es Laravel. Nunca al revés — si esconder el
   * menú fuera lo que protege, bastaría con adivinar la URL.
   */
  soloAdminGeneral?: boolean;
  /**
   * El módulo de la matriz de permisos del que depende esta sección.
   *
   * Se esconde a quien no lo alcanza, igual que en el sidebar. Sin `modulo` la
   * sección se ve siempre — y la restricción de verdad sigue siendo el 403.
   */
  modulo?: Modulo;
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
      /*
       * Las cuatro pestañas verticales de `/configuracion` pasan a ser cuatro
       * secciones. El shell de Administración ya lleva índice a la izquierda
       * —el mismo trabajo que hacían las pestañas—, así que anidarlas
       * duplicaba la navegación.
       *
       * Ya no llevan `rutaActual`: la pantalla vieja se mudó aquí entera.
       */
      {
        slug: "negocio",
        titulo: "Datos del negocio",
        descripcion:
          "El nombre, cómo te contactan y dónde estás. Es lo que ven tus clientes al reservar.",
        modulo: "configuracion",
      },
      {
        slug: "agenda",
        titulo: "Agenda",
        descripcion:
          "El horario en que atiende el negocio y cada cuánto se ofrece un turno. Cada local y cada profesional pueden apartarse de aquí.",
        modulo: "configuracion",
      },
      {
        slug: "marca",
        titulo: "Marca",
        descripcion:
          "El logo, la portada y los colores de tu página de reservas. No cambian este panel.",
        modulo: "configuracion",
      },
      {
        slug: "sitio-publico",
        titulo: "Sitio público",
        descripcion:
          "Tu enlace de reservas, si está encendido y los términos que acepta el cliente.",
        modulo: "configuracion",
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
        soloAdminGeneral: true,
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
        modulo: "empleados",
      },
      {
        /*
         * Leer los roles lo puede cualquiera —el select de rol tiene que
         * funcionarle a quien da altas—, pero esta pantalla es para
         * GESTIONARLOS, y crear, editar y borrar es solo del administrador
         * general: quien reparte permisos puede fabricarse uno con todo
         * marcado y asignárselo. Se esconde donde vive la escritura, no
         * donde vive la lectura.
         */
        slug: "roles",
        titulo: "Roles",
        descripcion:
          "Qué puede ver y hacer cada quien. El rol se elige al dar de alta un usuario.",
        soloAdminGeneral: true,
      },
    ],
  },
  {
    slug: "locales",
    titulo: "Locales",
    icono: IconBuildingStore,
    secciones: [
      /*
       * Las pestañas de `/locales` pasan a ser secciones, igual que en
       * General. Son TRES y no cuatro:
       *
       * - «Horarios de las sedes» no existía como pantalla: el horario es un
       *   par de campos DENTRO del formulario del local, así que la sección
       *   prometía una pantalla que nunca hubo.
       * - La pestaña «Servicios» era un espejo de solo lectura del catálogo,
       *   sin filtrar por local ni permitir editar. Lo suyo sería «qué
       *   servicios se ofrecen en cada sede», pero no hay tabla
       *   `local_servicio` que lo represente (ver `vistas/locales.md`), así
       *   que se queda fuera en vez de duplicar el módulo Servicios dentro de
       *   una pantalla que va de locales.
       */
      {
        slug: "sedes",
        titulo: "Sedes",
        descripcion:
          "Los locales del negocio, con su dirección, su horario y la marca que ve el cliente en cada uno.",
        modulo: "locales",
      },
      {
        slug: "profesionales",
        titulo: "Quién atiende en cada sede",
        descripcion:
          "Quién trabaja en cada local, con qué nombre aparece en la tienda pública y en qué horario.",
        modulo: "locales",
      },
      {
        slug: "grupos",
        titulo: "Grupos",
        descripcion:
          "Agrupa locales, profesionales y servicios que van juntos. Todavía no cambian nada en la reserva.",
        modulo: "locales",
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
        modulo: "whatsapp",
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
        modulo: "facturacion",
      },
      {
        slug: "suscripcion",
        titulo: "Suscripción",
        descripcion: "Cambiar de plan, renovar o darla de baja.",
        rutaActual: "/mi-plan",
        modulo: "facturacion",
      },
      {
        slug: "pagos",
        titulo: "Pagos",
        descripcion: "El historial de cobros y sus comprobantes.",
        rutaActual: "/mi-plan",
        modulo: "facturacion",
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
        modulo: "soporte",
      },
    ],
  },
];

/** La primera sección del índice: adonde entra `/administracion`. */
export const RUTA_ADMIN_INICIAL = `/administracion/${GRUPOS_ADMIN[0].slug}/${GRUPOS_ADMIN[0].secciones[0].slug}`;

export const rutaDeSeccion = (grupo: string, seccion: string) =>
  `/administracion/${grupo}/${seccion}`;

/** Lo que hace falta saber de quien mira para decidir qué ve. */
export interface QuienMira {
  esAdminGeneral: boolean;
  capacidades: Capacidades | undefined;
}

/**
 * ¿Se le enseña esta sección a quien está mirando?
 *
 * Vive aquí y no en cada componente para que el índice y la página de la
 * sección apliquen **la misma** regla: si divergieran, el menú escondería algo
 * que la página sigue pintando, o al revés.
 */
export function puedeVerSeccion(
  seccion: SeccionAdmin,
  { esAdminGeneral, capacidades }: QuienMira
) {
  if (seccion.soloAdminGeneral && !esAdminGeneral) return false;

  /*
    Mientras las capacidades no han llegado se enseña todo, igual que en el
    sidebar: esta es la única navegación de la vista de Administración, y
    vaciarla medio segundo en cada carga es peor que un enlace de más que
    aterriza en un aviso.
  */
  if (!capacidades || !seccion.modulo) return true;

  return puedeVer(capacidades, seccion.modulo);
}

/** Las secciones de un grupo que le tocan a quien está mirando. */
export function seccionesVisibles(grupo: GrupoAdmin, quien: QuienMira) {
  return grupo.secciones.filter((s) => puedeVerSeccion(s, quien));
}

/** Busca por slugs; devuelve `null` si la URL no corresponde a nada. */
export function buscarSeccion(grupoSlug: string, seccionSlug: string) {
  const grupo = GRUPOS_ADMIN.find((g) => g.slug === grupoSlug);
  const seccion = grupo?.secciones.find((s) => s.slug === seccionSlug);
  return grupo && seccion ? { grupo, seccion } : null;
}
