type ColorChip = "warning" | "info" | "success" | "error" | "default";

/** Etiqueta y color de cada estado de negocio. Misma paleta que usa `estado` de citas. */
export const ESTADO_NEGOCIO: Record<
  "prueba" | "activa" | "suspendida" | "cancelada",
  { label: string; color: ColorChip }
> = {
  prueba: { label: "Prueba", color: "info" },
  activa: { label: "Activa", color: "success" },
  suspendida: { label: "Suspendida", color: "error" },
  cancelada: { label: "Cancelada", color: "default" },
};
