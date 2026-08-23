"use client";
import { useState } from "react";
import Button from "@mui/material/Button";
import { IconPlus } from "@tabler/icons-react";

import PageContainer from "@/components/container/PageContainer";
import EncabezadoPagina from "@/components/shared/EncabezadoPagina";
import DashboardCard from "@/components/shared/DashboardCard";
import ClientesTable from "@/features/clientes/components/ClientesTable";
import ClienteFormDialog from "@/features/clientes/components/ClienteFormDialog";


export default function ClientesPage() {
  const [dialogAbierto, setDialogAbierto] = useState(false);

  return (
    <PageContainer title="Clientes" description="Listado de clientes">
      <EncabezadoPagina
        titulo="Clientes"
        descripcion="Todos los clientes de tu cuenta"
        acciones={
        <Button
          variant="contained"
          startIcon={<IconPlus size={18} />}
          onClick={() => setDialogAbierto(true)}
        >
          Nuevo cliente
        </Button>
        }
      />
      <DashboardCard>
        <ClientesTable />
      </DashboardCard>

      <ClienteFormDialog
        abierto={dialogAbierto}
        onCerrar={() => setDialogAbierto(false)}
      />
    </PageContainer>
  );
}
