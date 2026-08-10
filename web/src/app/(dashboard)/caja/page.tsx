import ModuloPendiente from "@/components/shared/ModuloPendiente";

export const metadata = { title: "Caja" };

export default function CajaPage() {
  return (
    <ModuloPendiente
      titulo="Caja"
      descripcion="Apertura y cierre de caja, movimientos de ingreso y egreso, y arqueo del día."
      endpoint="/api/caja"
    />
  );
}
