"use client";
import Typography from "@mui/material/Typography";

import PageContainer from "@/components/container/PageContainer";
import Breadcrumb from "@/layout/shared/breadcrumb/Breadcrumb";
import DashboardCard from "@/components/shared/DashboardCard";

const BCrumb = [{ to: "/", title: "Inicio" }, { title: "Ajustes" }];

export default function AjustesPage() {
  return (
    <PageContainer title="Ajustes" description="Configuración de la cuenta">
      <Breadcrumb title="Ajustes" items={BCrumb} />
      <DashboardCard title="Configuración">
        <Typography color="textSecondary">
          Elige una sección en el menú lateral.
        </Typography>
      </DashboardCard>
    </PageContainer>
  );
}
