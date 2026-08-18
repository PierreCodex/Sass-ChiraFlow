import PageContainer from "@/components/container/PageContainer";
import Breadcrumb from "@/layout/shared/breadcrumb/Breadcrumb";
import EnConstruccion from "@/components/shared/EnConstruccion";

const BCrumb = [{ to: "/superadmin", title: "Dashboard" }, { title: "Pagos" }];

export default function SuperadminPagosPage() {
  return (
    <PageContainer title="Pagos" description="Pagos">
      <Breadcrumb title="Pagos" items={BCrumb} />
      <EnConstruccion titulo="Pagos" />
    </PageContainer>
  );
}
