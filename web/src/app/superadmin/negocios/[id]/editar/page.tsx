import PageContainer from "@/components/container/PageContainer";
import Breadcrumb from "@/layout/shared/breadcrumb/Breadcrumb";
import EnConstruccion from "@/components/shared/EnConstruccion";

const BCrumb = [
  { to: "/superadmin", title: "Dashboard" },
  { to: "/superadmin/negocios", title: "Negocios" },
  { title: "Editar" },
];

export default function SuperadminNegocioEditarPage() {
  return (
    <PageContainer title="Editar negocio" description="Editar negocio">
      <Breadcrumb title="Editar negocio" items={BCrumb} />
      <EnConstruccion titulo="Editar negocio" />
    </PageContainer>
  );
}
