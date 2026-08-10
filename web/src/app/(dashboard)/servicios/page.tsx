"use client";
import { useState } from "react";
import Button from "@mui/material/Button";
import { IconPlus } from "@tabler/icons-react";

import PageContainer from "@/components/container/PageContainer";
import Breadcrumb from "@/layout/shared/breadcrumb/Breadcrumb";
import DashboardCard from "@/components/shared/DashboardCard";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import ServiciosTable from "@/features/servicios/components/ServiciosTable";
import ServicioFormDialog from "@/features/servicios/components/ServicioFormDialog";
import { useEliminarServicio } from "@/features/servicios/hooks/useServicios";
import type { Servicio } from "@/features/servicios/types";
import { toApiError } from "@/lib/api/client";

const BCrumb = [{ to: "/", title: "Inicio" }, { title: "Servicios" }];

export default function ServiciosPage() {
  const [formAbierto, setFormAbierto] = useState(false);
  const [servicioEditando, setServicioEditando] = useState<Servicio | null>(null);
  const [servicioAEliminar, setServicioAEliminar] = useState<Servicio | null>(null);

  const eliminar = useEliminarServicio();

  const abrirNuevo = () => {
    setServicioEditando(null);
    setFormAbierto(true);
  };

  const abrirEdicion = (servicio: Servicio) => {
    setServicioEditando(servicio);
    setFormAbierto(true);
  };

  const confirmarEliminacion = () => {
    if (!servicioAEliminar) return;
    eliminar.mutate(servicioAEliminar.id, {
      onSuccess: () => setServicioAEliminar(null),
    });
  };

  return (
    <PageContainer title="Servicios" description="Catálogo de servicios">
      <Breadcrumb title="Servicios" items={BCrumb} />
      <DashboardCard
        title="Servicios"
        subtitle="Tu catálogo de atención"
        action={
          <Button
            variant="contained"
            startIcon={<IconPlus size={18} />}
            onClick={abrirNuevo}
          >
            Nuevo servicio
          </Button>
        }
      >
        <ServiciosTable
          onEditar={abrirEdicion}
          onEliminar={setServicioAEliminar}
        />
      </DashboardCard>

      <ServicioFormDialog
        abierto={formAbierto}
        servicio={servicioEditando}
        onCerrar={() => setFormAbierto(false)}
      />

      <ConfirmDialog
        abierto={!!servicioAEliminar}
        titulo="Eliminar servicio"
        mensaje={
          <>
            ¿Seguro que quieres eliminar <strong>{servicioAEliminar?.nombre}</strong>?
            Esta acción no se puede deshacer.
          </>
        }
        textoConfirmar="Eliminar"
        cargando={eliminar.isPending}
        error={eliminar.isError ? toApiError(eliminar.error).message : null}
        onConfirmar={confirmarEliminacion}
        onCancelar={() => setServicioAEliminar(null)}
      />
    </PageContainer>
  );
}
