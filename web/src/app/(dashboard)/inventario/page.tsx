import ModuloPendiente from "@/components/shared/ModuloPendiente";

export const metadata = { title: "Inventario" };

export default function InventarioPage() {
  return (
    <ModuloPendiente
      titulo="Inventario"
      descripcion="Productos, stock por local y movimientos de entrada y salida."
      endpoint="/api/inventario"
    />
  );
}
