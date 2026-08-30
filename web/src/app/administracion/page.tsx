import { redirect } from "next/navigation";

import { RUTA_ADMIN_INICIAL } from "@/features/administracion/nav";

/** `/administracion` no tiene contenido propio: entra por la primera sección. */
export default function AdministracionPage() {
  redirect(RUTA_ADMIN_INICIAL);
}
