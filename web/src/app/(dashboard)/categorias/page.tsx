"use client";
import Button from "@mui/material/Button";
import { IconPlus } from "@tabler/icons-react";

import PageContainer from "@/components/container/PageContainer";
import Breadcrumb from "@/layout/shared/breadcrumb/Breadcrumb";
import DashboardCard from "@/components/shared/DashboardCard";
import CategoriasTable from "@/features/categorias/components/CategoriasTable";

const BCrumb = [{ to: "/", title: "Inicio" }, { title: "Categorías" }];

export default function CategoriasPage() {
  return (
    <PageContainer title="Categorías" description="Categorías de servicios">
      <Breadcrumb title="Categorías" items={BCrumb} />
      <DashboardCard
        title="Categorías"
        subtitle="Cómo se agrupan tus servicios"
        action={
          <Button variant="contained" startIcon={<IconPlus size={18} />}>
            Nueva categoría
          </Button>
        }
      >
        <CategoriasTable />
      </DashboardCard>
    </PageContainer>
  );
}
