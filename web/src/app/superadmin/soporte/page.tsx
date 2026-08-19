import PageContainer from "@/components/container/PageContainer";
import Breadcrumb from "@/layout/shared/breadcrumb/Breadcrumb";
import DashboardCard from "@/components/shared/DashboardCard";
import SoporteTable from "@/features/superadmin/components/SoporteTable";

const BCrumb = [{ to: "/superadmin", title: "Dashboard" }, { title: "Soporte" }];

export default function SuperadminSoportePage() {
  return (
    <PageContainer title="Soporte" description="Tickets de soporte de todos los negocios">
      <Breadcrumb title="Soporte" items={BCrumb} />
      <DashboardCard title="Soporte" subtitle="Tickets de todos los negocios">
        <SoporteTable />
      </DashboardCard>
    </PageContainer>
  );
}
