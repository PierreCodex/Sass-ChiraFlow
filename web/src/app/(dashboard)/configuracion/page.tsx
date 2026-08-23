"use client";
import PageContainer from "@/components/container/PageContainer";
import EncabezadoPagina from "@/components/shared/EncabezadoPagina";
import ConfiguracionForm from "@/features/configuracion/components/ConfiguracionForm";


export default function ConfiguracionPage() {
  return (
    <PageContainer title="Configuración" description="Ajustes del negocio">
      <EncabezadoPagina titulo="Configuración" />
      <ConfiguracionForm />
    </PageContainer>
  );
}
