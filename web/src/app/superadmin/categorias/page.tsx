import PageContainer from "@/components/container/PageContainer";
import Breadcrumb from "@/layout/shared/breadcrumb/Breadcrumb";
import EnConstruccion from "@/components/shared/EnConstruccion";

const BCrumb = [{ to: "/superadmin", title: "Dashboard" }, { title: "Categorías" }];

export default function SuperadminCategoriasPage() {
  return (
    <PageContainer title="Categorías" description="Categorías">
      <Breadcrumb title="Categorías" items={BCrumb} />
      <EnConstruccion titulo="Categorías" />
    </PageContainer>
  );
}
