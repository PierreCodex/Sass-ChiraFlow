"use client";
import { useState } from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { IconPlus } from "@tabler/icons-react";

import PageContainer from "@/components/container/PageContainer";
import EncabezadoPagina from "@/components/shared/EncabezadoPagina";
import DashboardCard from "@/components/shared/DashboardCard";
import TicketsFiltro, {
  type FiltroEstado,
} from "@/features/soporte/components/TicketsFiltro";
import TicketsTable from "@/features/soporte/components/TicketsTable";
import TicketFormDialog from "@/features/soporte/components/TicketFormDialog";
import TicketDetalleDialog from "@/features/soporte/components/TicketDetalleDialog";
import type { Ticket } from "@/features/soporte/types";


export default function SoportePage() {
  const [formAbierto, setFormAbierto] = useState(false);
  const [ticketVisto, setTicketVisto] = useState<Ticket | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>(null);

  return (
    <PageContainer title="Soporte" description="Tickets de ayuda">
      <EncabezadoPagina titulo="Soporte" />

      <Stack spacing={3}>
        <TicketsFiltro valor={filtroEstado} onChange={setFiltroEstado} />

        <DashboardCard
          title="Mis tickets"
          subtitle="Consultas enviadas al equipo de soporte"
          action={
            <Button
              variant="contained"
              startIcon={<IconPlus size={18} />}
              onClick={() => setFormAbierto(true)}
            >
              Nuevo ticket
            </Button>
          }
        >
          <TicketsTable filtroEstado={filtroEstado} onVer={setTicketVisto} />
        </DashboardCard>
      </Stack>

      <TicketFormDialog
        abierto={formAbierto}
        onCerrar={() => setFormAbierto(false)}
      />

      <TicketDetalleDialog
        ticket={ticketVisto}
        onCerrar={() => setTicketVisto(null)}
      />
    </PageContainer>
  );
}
