import { uniqueId } from "lodash";
import {
  IconBell,
  IconBuildingStore,
  IconCash,
  IconCategory,
  IconCreditCard,
  IconHeadset,
  IconLayoutDashboard,
  IconSpeakerphone,
  IconUserCog,
} from "@tabler/icons-react";
import type { MenuitemsType } from "@/layout/vertical/sidebar/MenuItems";

/**
 * Menú del panel superadmin. Misma forma que `MenuItems.ts` (el del negocio)
 * para poder reusar el `Sidebar`/`SidebarItems` reales de Modernize —
 * mismas secciones (Principal/Gestión/Operación) que ya usa el otro panel.
 */
export const superadminMenuItems: MenuitemsType[] = [
  {
    navlabel: true,
    subheader: "Principal",
  },
  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/superadmin",
  },
  {
    navlabel: true,
    subheader: "Gestión",
  },
  {
    id: uniqueId(),
    title: "Negocios",
    icon: IconBuildingStore,
    href: "/superadmin/negocios",
  },
  {
    id: uniqueId(),
    title: "Planes",
    icon: IconCreditCard,
    href: "/superadmin/planes",
  },
  {
    id: uniqueId(),
    title: "Categorías",
    icon: IconCategory,
    href: "/superadmin/categorias",
  },
  {
    id: uniqueId(),
    title: "Pagos",
    icon: IconCash,
    href: "/superadmin/pagos",
  },
  {
    navlabel: true,
    subheader: "Operación",
  },
  {
    id: uniqueId(),
    title: "Anuncios",
    icon: IconSpeakerphone,
    href: "/superadmin/anuncios",
  },
  {
    id: uniqueId(),
    title: "Soporte",
    icon: IconHeadset,
    href: "/superadmin/soporte",
  },
  {
    id: uniqueId(),
    title: "Usuarios de Soporte",
    icon: IconUserCog,
    href: "/superadmin/soporte-usuarios",
  },
  {
    id: uniqueId(),
    title: "Notificaciones",
    icon: IconBell,
    href: "/superadmin/notificaciones",
  },
];
