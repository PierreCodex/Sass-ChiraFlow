"use client";
import PageContainer from "@/components/container/PageContainer";
import Breadcrumb from "@/layout/shared/breadcrumb/Breadcrumb";
import ConfiguracionForm from "@/features/configuracion/components/ConfiguracionForm";

const BCrumb = [{ to: "/", title: "Inicio" }, { title: "Configuración" }];

export default function ConfiguracionPage() {
  return (
    <PageContainer title="Configuración" description="Ajustes del negocio">
      <Breadcrumb title="Configuración" items={BCrumb} />
      <ConfiguracionForm />
    </PageContainer>
  );
}
