import PageContainer from "@/components/container/PageContainer";
import Breadcrumb from "@/layout/shared/breadcrumb/Breadcrumb";
import EnConstruccion from "@/components/shared/EnConstruccion";

const BCrumb = [
  { to: "/superadmin", title: "Dashboard" },
  { to: "/superadmin/planes", title: "Planes" },
  { title: "Editar" },
];

export default function SuperadminPlanEditarPage() {
  return (
    <PageContainer title="Editar plan" description="Editar plan">
      <Breadcrumb title="Editar plan" items={BCrumb} />
      <EnConstruccion titulo="Editar plan" />
    </PageContainer>
  );
}
