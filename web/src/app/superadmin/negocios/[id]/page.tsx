import PageContainer from "@/components/container/PageContainer";
import Breadcrumb from "@/layout/shared/breadcrumb/Breadcrumb";
import NegocioDetalle from "@/features/superadmin/components/NegocioDetalle";

const BCrumb = [
  { to: "/superadmin", title: "Dashboard" },
  { to: "/superadmin/negocios", title: "Negocios" },
  { title: "Detalle" },
];

export default async function SuperadminNegocioDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <PageContainer title="Negocio" description="Detalle del negocio">
      <Breadcrumb title="Detalle del negocio" items={BCrumb} />
      <NegocioDetalle id={Number(id)} />
    </PageContainer>
  );
}
