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
import SoloSiGestiona from "@/components/shared/SoloSiGestiona";


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
        <SoloSiGestiona modulo="citas">
          <Button
            variant="contained"
            startIcon={<IconPlus size={18} />}
            onClick={abrirNueva}
          >
            Nueva cita
          </Button>
        </SoloSiGestiona>
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
            {citaAEliminar?.hora_inicio}?
            <br />
            <br />
            {/*
              Eliminar y cancelar se parecen en la pantalla y no en la base:
              esto borra la fila entera y no deja rastro de que la cita existio.
              Quien solo quiere liberar el hueco busca el otro.
            */}
            Se borra del todo, y no queda registro de que existió. Si la cita
            no se va a dar, ciérrala con el{" "}
            <strong>estado «Cancelada»</strong> desde el formulario: así libera
            el hueco y sigue contando en los reportes.
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
