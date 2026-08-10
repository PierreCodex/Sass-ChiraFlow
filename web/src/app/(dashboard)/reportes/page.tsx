import ModuloPendiente from "@/components/shared/ModuloPendiente";

export const metadata = { title: "Reportes" };

export default function ReportesPage() {
  return (
    <ModuloPendiente
      titulo="Reportes"
      descripcion="Ingresos por periodo, servicios más vendidos, ocupación por empleado y clientes recurrentes."
      endpoint="/api/reportes"
    />
  );
}
