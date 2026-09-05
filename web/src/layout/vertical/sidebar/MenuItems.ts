import { uniqueId } from "lodash";

import type { Modulo } from "@/features/capacidades/types";
import {
  IconLayoutDashboard,
  IconCalendarEvent,
  IconCalendar,
  IconUsers,
  IconListDetails,
  IconCategory,
  IconUserCheck,
  IconBuildingStore,
  IconChartBar,
  IconCreditCard,
  IconBrandWhatsapp,
  IconCashRegister,
  IconPackage,
  IconLifebuoy,
} from "@tabler/icons-react";

export interface MenuitemsType {
  [x: string]: any;
  id?: string;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  icon?: any;
  href?: string;
  children?: MenuitemsType[];
  chip?: string;
  chipColor?: string;
  variant?: string;
  external?: boolean;
  /**
   * El módulo de la matriz de permisos al que pertenece esta entrada.
   *
   * Lo usa `SidebarItems` para esconder lo que el rol de quien mira no
   * alcanza. Es la clave del backend, no la ruta ni el título: `empleados`
   * sigue llamándose así aunque su pantalla se llame Profesionales.
   *
   * Una entrada sin `modulo` se ve siempre.
   */
  modulo?: Modulo;
}

/*
  Menú de la app. Cada entrada apunta a una ruta de src/app/(dashboard)/.
  - navlabel: true  -> separador con título de sección
  - children        -> submenú (soporta hasta 3 niveles)
  - chip / chipColor-> badge a la derecha

  Aquí vive la "Vista general": lo que se abre cada mañana, catálogo incluido
  —lo que se vende se toca a diario—. Lo que queda (equipo, locales, cuenta)
  sigue existiendo y sus rutas responden, pero se saca del sidebar y espera en
  MenuitemsOcultos, más abajo: su sitio es la vista de Administración.
*/
const Menuitems: MenuitemsType[] = [
  {
    navlabel: true,
    subheader: "Principal",
  },
  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/",
    modulo: "dashboard",
  },
  {
    id: uniqueId(),
    title: "Calendario",
    icon: IconCalendar,
    href: "/calendario",
    modulo: "calendario",
  },
  {
    id: uniqueId(),
    title: "Citas",
    icon: IconCalendarEvent,
    href: "/citas",
    modulo: "citas",
  },
  {
    id: uniqueId(),
    title: "Clientes",
    icon: IconUsers,
    href: "/clientes",
    modulo: "clientes",
  },

  {
    navlabel: true,
    subheader: "Catálogo",
  },
  {
    id: uniqueId(),
    title: "Categorías",
    icon: IconCategory,
    href: "/categorias",
    // Las categorías no son un módulo aparte en la matriz: son del catálogo.
    modulo: "servicios",
  },
  {
    id: uniqueId(),
    title: "Servicios",
    icon: IconListDetails,
    href: "/servicios",
    modulo: "servicios",
  },

  {
    navlabel: true,
    subheader: "Operación",
  },
  {
    id: uniqueId(),
    title: "Caja",
    icon: IconCashRegister,
    href: "/caja",
    modulo: "caja",
  },
  {
    id: uniqueId(),
    title: "Inventario",
    icon: IconPackage,
    href: "/inventario",
    modulo: "inventario",
  },
  {
    id: uniqueId(),
    title: "Reportes",
    icon: IconChartBar,
    href: "/reportes",
    modulo: "reportes",
  },
];

/*
  Ocultos del sidebar, no borrados. Las páginas siguen montadas y accesibles
  por URL. Cuando exista la segunda vista (configuración del negocio), se
  reparten desde aquí.
*/
export const MenuitemsOcultos: MenuitemsType[] = [
  {
    navlabel: true,
    subheader: "Gestión",
  },
  // Profesionales ya no está aquí: vive en /administracion/equipo/profesionales.
  // Con la misma pantalla en dos sitios habría dos puertas a la misma
  // habitación y el usuario no aprendería ninguna.
  {
    id: uniqueId(),
    title: "Locales",
    icon: IconBuildingStore,
    href: "/locales",
    modulo: "locales",
  },

  {
    navlabel: true,
    subheader: "Cuenta",
  },
  {
    id: uniqueId(),
    title: "Mi Plan",
    icon: IconCreditCard,
    href: "/mi-plan",
    modulo: "facturacion",
  },
  {
    id: uniqueId(),
    title: "WhatsApp",
    icon: IconBrandWhatsapp,
    href: "/whatsapp",
    modulo: "whatsapp",
  },
  /*
   * «Configuración» ya no está aquí: sus cuatro pestañas viven en
   * /administracion/general/*. Lo que queda es **Mi perfil**, que no se mudó
   * porque es personal y no administración del negocio — y por eso sube un
   * nivel, en vez de quedarse como único hijo de un padre que ya no lleva a
   * ninguna parte.
   */
  {
    id: uniqueId(),
    title: "Mi perfil",
    icon: IconUserCheck,
    href: "/configuracion/perfil",
  },
  {
    id: uniqueId(),
    title: "Soporte",
    icon: IconLifebuoy,
    href: "/soporte",
    modulo: "soporte",
  },
];

export default Menuitems;
