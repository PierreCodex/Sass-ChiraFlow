"use client";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import { IconPlus } from "@tabler/icons-react";

import PageContainer from "@/components/container/PageContainer";
import Breadcrumb from "@/layout/shared/breadcrumb/Breadcrumb";
import DashboardCard from "@/components/shared/DashboardCard";
import NegociosTable from "@/features/superadmin/components/NegociosTable";

const BCrumb = [{ to: "/superadmin", title: "Dashboard" }, { title: "Negocios" }];

export default function SuperadminNegociosPage() {
  return (
    <PageContainer title="Negocios" description="Negocios de la plataforma">
      <Breadcrumb title="Negocios" items={BCrumb} />
      <DashboardCard
        title="Negocios"
        subtitle="Todos los negocios registrados en la plataforma"
        action={
          <Tooltip title="El formulario de alta (con logo, plan y dueño) todavía no está construido">
            <span>
              <Button variant="contained" startIcon={<IconPlus size={18} />} disabled>
                Nuevo negocio
              </Button>
            </span>
          </Tooltip>
        }
      >
        <NegociosTable />
      </DashboardCard>
    </PageContainer>
  );
}
