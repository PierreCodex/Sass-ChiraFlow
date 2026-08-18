import PageContainer from "@/components/container/PageContainer";
import Breadcrumb from "@/layout/shared/breadcrumb/Breadcrumb";
import PlanesCards from "@/features/superadmin/components/PlanesCards";

const BCrumb = [{ to: "/superadmin", title: "Dashboard" }, { title: "Planes" }];

export default function SuperadminPlanesPage() {
  return (
    <PageContainer title="Planes" description="Planes de la plataforma">
      <Breadcrumb title="Planes" items={BCrumb} />
      <PlanesCards />
    </PageContainer>
  );
}
