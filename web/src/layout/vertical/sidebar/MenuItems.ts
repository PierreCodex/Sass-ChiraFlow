import { uniqueId } from "lodash";
import {
  IconLayoutDashboard,
  IconUsers,
  IconSettings,
  IconPoint,
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
    subheader: "General",
  },
  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/",
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
    navlabel: true,
    subheader: "Sistema",
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
