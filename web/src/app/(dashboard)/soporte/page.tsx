import ModuloPendiente from "@/components/shared/ModuloPendiente";

export const metadata = { title: "Soporte" };

export default function SoportePage() {
  return (
    <ModuloPendiente
      titulo="Soporte"
      descripcion="Tickets de ayuda, documentación y contacto directo con el equipo."
      endpoint="/api/soporte/tickets"
    />
  );
}
