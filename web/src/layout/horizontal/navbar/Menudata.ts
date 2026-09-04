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

// Menú del layout horizontal. Mantenerlo alineado con vertical/sidebar/MenuItems.ts
const Menuitems = [
  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/",
  },
  {
    id: uniqueId(),
    title: "Agenda",
    icon: IconCalendarEvent,
    href: "/calendario",
    children: [
      {
        id: uniqueId(),
        title: "Calendario",
        icon: IconCalendar,
        href: "/calendario",
      },
      {
        id: uniqueId(),
        title: "Citas",
        icon: IconCalendarEvent,
        href: "/citas",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Clientes",
    icon: IconUsers,
    href: "/clientes",
  },
  {
    id: uniqueId(),
    title: "Catálogo",
    icon: IconCategory,
    href: "/categorias",
    children: [
      {
        id: uniqueId(),
        title: "Categorías",
        icon: IconCategory,
        href: "/categorias",
      },
      {
        id: uniqueId(),
        title: "Servicios",
        icon: IconListDetails,
        href: "/servicios",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Operación",
    icon: IconCashRegister,
    href: "/caja",
    children: [
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
    ],
  },
];

// Ocultos, no borrados: esperan a la segunda vista. Igual que en el sidebar.
export const MenuitemsOcultos = [
  {
    // Empleados salió de aquí con la mudanza a Administración.
    id: uniqueId(),
    title: "Gestión",
    icon: IconBuildingStore,
    href: "/locales",
    children: [
      {
        id: uniqueId(),
        title: "Locales",
        icon: IconBuildingStore,
        href: "/locales",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Cuenta",
    icon: IconSettings,
    href: "/mi-plan",
    children: [
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
      },
      {
        id: uniqueId(),
        title: "Soporte",
        icon: IconLifebuoy,
        href: "/soporte",
      },
    ],
  },
];

export default Menuitems;
