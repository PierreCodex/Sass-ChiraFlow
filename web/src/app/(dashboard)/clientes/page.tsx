"use client";
import Button from "@mui/material/Button";
import { IconPlus } from "@tabler/icons-react";

import PageContainer from "@/components/container/PageContainer";
import Breadcrumb from "@/layout/shared/breadcrumb/Breadcrumb";
import DashboardCard from "@/components/shared/DashboardCard";
import ClientesTable from "@/features/clientes/components/ClientesTable";

const BCrumb = [
  { to: "/", title: "Inicio" },
  { title: "Clientes" },
];

/**
 * Página = composición. La lógica vive en features/clientes/.
 * Copia este archivo como plantilla para cada módulo nuevo.
 */
export default function ClientesPage() {
  return (
    <PageContainer title="Clientes" description="Listado de clientes">
      <Breadcrumb title="Clientes" items={BCrumb} />
      <DashboardCard
        title="Clientes"
        subtitle="Todos los clientes de tu cuenta"
        action={
          <Button variant="contained" startIcon={<IconPlus size={18} />}>
            Nuevo cliente
          </Button>
        }
      >
        <ClientesTable />
      </DashboardCard>
    </PageContainer>
  );
}
