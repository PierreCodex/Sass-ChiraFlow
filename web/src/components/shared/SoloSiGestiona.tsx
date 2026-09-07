"use client";
import type { ReactNode } from "react";

import { usePermisos } from "@/features/capacidades/hooks/useCapacidades";
import type { Modulo } from "@/features/capacidades/types";

/**
 * Enseña a sus hijos solo a quien puede **escribir** en ese módulo.
 *
 * Para los botones de alta, edición y borrado. Quien tiene el módulo en `ver`
 * puede mirar la lista, y ofrecerle «Nuevo cliente» sería prometerle algo que
 * el backend le va a negar con un 403 — el peor tipo de botón: el que parece
 * disponible y falla.
 *
 * **No es autorización, y conviene tenerlo presente**: la puerta la cierra el
 * backend, que responde 403 aunque este componente no existiera. Esto solo
 * evita enseñar puertas cerradas.
 *
 * Mientras las capacidades cargan no enseña nada: se muestra de menos y se
 * corrige, que es el orden correcto. Al revés, el botón aparecería un instante
 * y desaparecería debajo del cursor.
 */
export default function SoloSiGestiona({
  modulo,
  children,
}: {
  modulo: Modulo;
  children: ReactNode;
}) {
  const { puedeGestionar } = usePermisos(modulo);

  return puedeGestionar ? <>{children}</> : null;
}
