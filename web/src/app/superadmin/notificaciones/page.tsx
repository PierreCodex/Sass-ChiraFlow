import PageContainer from "@/components/container/PageContainer";
import Breadcrumb from "@/layout/shared/breadcrumb/Breadcrumb";
import Notificaciones from "@/features/superadmin/components/Notificaciones";

const BCrumb = [{ to: "/superadmin", title: "Dashboard" }, { title: "Notificaciones" }];

export default function SuperadminNotificacionesPage() {
  return (
    <PageContainer title="Notificaciones" description="Notificaciones de la plataforma">
      <Breadcrumb title="Notificaciones" items={BCrumb} />
      <Notificaciones />
    </PageContainer>
  );
}
