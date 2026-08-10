import { uniqueId } from "lodash";
import {
  IconLayoutDashboard,
  IconUsers,
  IconSettings,
  IconPoint,
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
    title: "Clientes",
    icon: IconUsers,
    href: "/clientes",
  },
  {
    id: uniqueId(),
    title: "Ajustes",
    icon: IconSettings,
    href: "/ajustes",
    children: [
      {
        id: uniqueId(),
        title: "Mi perfil",
        icon: IconPoint,
        href: "/ajustes/perfil",
      },
    ],
  },
];

export default Menuitems;
