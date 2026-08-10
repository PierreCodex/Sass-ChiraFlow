import ModuloPendiente from "@/components/shared/ModuloPendiente";

export const metadata = { title: "WhatsApp" };

export default function WhatsAppPage() {
  return (
    <ModuloPendiente
      titulo="WhatsApp"
      descripcion="Conexión del número, plantillas de mensaje y recordatorios automáticos de citas."
      endpoint="/api/whatsapp"
    />
  );
}
