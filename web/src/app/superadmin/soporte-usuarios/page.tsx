import PageContainer from "@/components/container/PageContainer";
import Breadcrumb from "@/layout/shared/breadcrumb/Breadcrumb";
import EnConstruccion from "@/components/shared/EnConstruccion";

const BCrumb = [
  { to: "/superadmin", title: "Dashboard" },
  { title: "Usuarios de Soporte" },
];

export default function SuperadminUsuariosDeSoportePage() {
  return (
    <PageContainer title="Usuarios de Soporte" description="Usuarios de Soporte">
      <Breadcrumb title="Usuarios de Soporte" items={BCrumb} />
      <EnConstruccion titulo="Usuarios de Soporte" />
    </PageContainer>
  );
}
