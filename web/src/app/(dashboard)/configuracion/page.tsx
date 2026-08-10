import ModuloPendiente from "@/components/shared/ModuloPendiente";

export const metadata = { title: "Configuración" };

export default function ConfiguracionPage() {
  return (
    <ModuloPendiente
      titulo="Configuración"
      descripcion="Datos del negocio, horarios, zona horaria, moneda y políticas de reserva."
      endpoint="/api/configuracion"
    />
  );
}
