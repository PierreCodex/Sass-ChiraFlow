import PageContainer from "@/components/container/PageContainer";
import Breadcrumb from "@/layout/shared/breadcrumb/Breadcrumb";
import AnunciosPanel from "@/features/superadmin/components/AnunciosPanel";

const BCrumb = [{ to: "/superadmin", title: "Dashboard" }, { title: "Anuncios" }];

export default function SuperadminAnunciosPage() {
  return (
    <PageContainer title="Anuncios" description="Anuncios a los negocios">
      <Breadcrumb title="Anuncios" items={BCrumb} />
      <AnunciosPanel />
    </PageContainer>
  );
}
