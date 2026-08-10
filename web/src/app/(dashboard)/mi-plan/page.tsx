import ModuloPendiente from "@/components/shared/ModuloPendiente";

export const metadata = { title: "Mi Plan" };

export default function MiPlanPage() {
  return (
    <ModuloPendiente
      titulo="Mi Plan"
      descripcion="Plan contratado, consumo, historial de pagos y cambio de plan."
      endpoint="/api/suscripcion"
    />
  );
}
