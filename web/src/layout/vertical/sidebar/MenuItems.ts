import { uniqueId } from "lodash";
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
  IconSettings,
  IconCashRegister,
  IconPackage,
  IconLifebuoy,
} from "@tabler/icons-react";

interface MenuitemsType {
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
}

/*
  Menú de la app. Cada entrada apunta a una ruta de src/app/(dashboard)/.
  - navlabel: true  -> separador con título de sección
  - children        -> submenú (soporta hasta 3 niveles)
  - chip / chipColor-> badge a la derecha
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
  },
  {
    id: uniqueId(),
    title: "Citas",
    icon: IconCalendarEvent,
    href: "/citas",
  },
  {
    id: uniqueId(),
    title: "Calendario",
    icon: IconCalendar,
    href: "/calendario",
  },

  {
    navlabel: true,
    subheader: "Gestión",
  },
  {
    id: uniqueId(),
    title: "Clientes",
    icon: IconUsers,
    href: "/clientes",
  },
  {
    id: uniqueId(),
    title: "Servicios",
    icon: IconListDetails,
    href: "/servicios",
  },
  {
    id: uniqueId(),
    title: "Categorías",
    icon: IconCategory,
    href: "/categorias",
  },
  {
    id: uniqueId(),
    title: "Empleados",
    icon: IconUserCheck,
    href: "/empleados",
  },
  {
    id: uniqueId(),
    title: "Locales",
    icon: IconBuildingStore,
    href: "/locales",
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
  },
  {
    id: uniqueId(),
    title: "Inventario",
    icon: IconPackage,
    href: "/inventario",
  },
  {
    id: uniqueId(),
    title: "Reportes",
    icon: IconChartBar,
    href: "/reportes",
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
  },
  {
    id: uniqueId(),
    title: "WhatsApp",
    icon: IconBrandWhatsapp,
    href: "/whatsapp",
  },
  {
    id: uniqueId(),
    title: "Configuración",
    icon: IconSettings,
    href: "/configuracion",
    children: [
      {
        id: uniqueId(),
        title: "General",
        icon: IconSettings,
        href: "/configuracion",
      },
      {
        id: uniqueId(),
        title: "Mi perfil",
        icon: IconUserCheck,
        href: "/configuracion/perfil",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Soporte",
    icon: IconLifebuoy,
    href: "/soporte",
  },
];

export default Menuitems;
