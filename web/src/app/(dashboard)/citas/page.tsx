"use client";
import { useState } from "react";
import Button from "@mui/material/Button";
import { IconPlus } from "@tabler/icons-react";

import PageContainer from "@/components/container/PageContainer";
import EncabezadoPagina from "@/components/shared/EncabezadoPagina";
import DashboardCard from "@/components/shared/DashboardCard";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import CitasTable from "@/features/citas/components/CitasTable";
import CitaFormDialog from "@/features/citas/components/CitaFormDialog";
import { useEliminarCita } from "@/features/citas/hooks/useCitas";
import type { Cita } from "@/features/citas/types";
import { formatFecha } from "@/lib/format";
import { toApiError } from "@/lib/api/client";


export default function CitasPage() {
  const [formAbierto, setFormAbierto] = useState(false);
  const [citaEditando, setCitaEditando] = useState<Cita | null>(null);
  const [citaAEliminar, setCitaAEliminar] = useState<Cita | null>(null);

  const eliminar = useEliminarCita();

  const abrirNueva = () => {
    setCitaEditando(null);
    setFormAbierto(true);
  };

  const abrirEdicion = (cita: Cita) => {
    setCitaEditando(cita);
    setFormAbierto(true);
  };

  const confirmarEliminacion = () => {
    if (!citaAEliminar) return;
    eliminar.mutate(citaAEliminar.id, {
      onSuccess: () => setCitaAEliminar(null),
    });
  };

  return (
    <PageContainer title="Citas" description="Agenda de citas">
      <EncabezadoPagina
        titulo="Citas"
        descripcion="Todas las citas agendadas"
        acciones={
        <Button
          variant="contained"
          startIcon={<IconPlus size={18} />}
          onClick={abrirNueva}
        >
          Nueva cita
        </Button>
        }
      />
      <DashboardCard>
        <CitasTable onEditar={abrirEdicion} onEliminar={setCitaAEliminar} />
      </DashboardCard>

      <CitaFormDialog
        abierto={formAbierto}
        cita={citaEditando}
        onCerrar={() => setFormAbierto(false)}
      />

      <ConfirmDialog
        abierto={!!citaAEliminar}
        titulo="Eliminar cita"
        mensaje={
          <>
            ¿Seguro que quieres eliminar la cita de{" "}
            <strong>{citaAEliminar?.cliente_nombre}</strong> del{" "}
            {citaAEliminar ? formatFecha(citaAEliminar.fecha) : ""} a las{" "}
            {citaAEliminar?.hora_inicio}? Esta acción no se puede deshacer.
          </>
        }
        textoConfirmar="Eliminar"
        cargando={eliminar.isPending}
        error={eliminar.isError ? toApiError(eliminar.error).message : null}
        onConfirmar={confirmarEliminacion}
        onCancelar={() => setCitaAEliminar(null)}
      />
    </PageContainer>
  );
}
