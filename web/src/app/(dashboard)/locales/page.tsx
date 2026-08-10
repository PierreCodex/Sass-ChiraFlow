"use client";
import Button from "@mui/material/Button";
import { IconPlus } from "@tabler/icons-react";

import PageContainer from "@/components/container/PageContainer";
import Breadcrumb from "@/layout/shared/breadcrumb/Breadcrumb";
import DashboardCard from "@/components/shared/DashboardCard";
import LocalesTable from "@/features/locales/components/LocalesTable";

const BCrumb = [{ to: "/", title: "Inicio" }, { title: "Locales" }];

export default function LocalesPage() {
  return (
    <PageContainer title="Locales" description="Sedes del negocio">
      <Breadcrumb title="Locales" items={BCrumb} />
      <DashboardCard
        title="Locales"
        subtitle="Sedes donde atiendes"
        action={
          <Button variant="contained" startIcon={<IconPlus size={18} />}>
            Nuevo local
          </Button>
        }
      >
        <LocalesTable />
      </DashboardCard>
    </PageContainer>
  );
}
