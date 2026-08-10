"use client";
import { useState } from "react";
import Button from "@mui/material/Button";
import { IconPlus } from "@tabler/icons-react";

import PageContainer from "@/components/container/PageContainer";
import Breadcrumb from "@/layout/shared/breadcrumb/Breadcrumb";
import DashboardCard from "@/components/shared/DashboardCard";
import ClientesTable from "@/features/clientes/components/ClientesTable";
import ClienteFormDialog from "@/features/clientes/components/ClienteFormDialog";

const BCrumb = [{ to: "/", title: "Inicio" }, { title: "Clientes" }];

export default function ClientesPage() {
  const [dialogAbierto, setDialogAbierto] = useState(false);

  return (
    <PageContainer title="Clientes" description="Listado de clientes">
      <Breadcrumb title="Clientes" items={BCrumb} />
      <DashboardCard
        title="Clientes"
        subtitle="Todos los clientes de tu cuenta"
        action={
          <Button
            variant="contained"
            startIcon={<IconPlus size={18} />}
            onClick={() => setDialogAbierto(true)}
          >
            Nuevo cliente
          </Button>
        }
      >
        <ClientesTable />
      </DashboardCard>

      <ClienteFormDialog
        abierto={dialogAbierto}
        onCerrar={() => setDialogAbierto(false)}
      />
    </PageContainer>
  );
}
