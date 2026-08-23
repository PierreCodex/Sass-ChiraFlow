"use client";
import PageContainer from "@/components/container/PageContainer";
import EncabezadoPagina from "@/components/shared/EncabezadoPagina";
import BotonVerSitio from "@/features/configuracion/components/BotonVerSitio";
import ConfiguracionForm from "@/features/configuracion/components/ConfiguracionForm";

export default function ConfiguracionPage() {
  return (
    <PageContainer title="Configuración" description="Ajustes del negocio">
      <EncabezadoPagina
        titulo="Configuración"
        descripcion="Los datos de tu negocio, tu agenda y tu página de reservas."
        acciones={<BotonVerSitio />}
      />
      <ConfiguracionForm />
    </PageContainer>
  );
}
