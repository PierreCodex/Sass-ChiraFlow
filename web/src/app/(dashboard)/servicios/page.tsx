"use client";
import { useState } from "react";
import Button from "@mui/material/Button";
import { IconPlus } from "@tabler/icons-react";

import PageContainer from "@/components/container/PageContainer";
import EncabezadoPagina from "@/components/shared/EncabezadoPagina";
import DashboardCard from "@/components/shared/DashboardCard";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import ServiciosTable from "@/features/servicios/components/ServiciosTable";
import ServicioFormDialog from "@/features/servicios/components/ServicioFormDialog";
import { useEliminarServicio } from "@/features/servicios/hooks/useServicios";
import type { Servicio } from "@/features/servicios/types";
import { toApiError } from "@/lib/api/client";


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
      <EncabezadoPagina
        titulo="Servicios"
        descripcion="Tu catálogo de atención"
        acciones={
        <Button
          variant="contained"
          startIcon={<IconPlus size={18} />}
          onClick={abrirNuevo}
        >
          Nuevo servicio
        </Button>
        }
      />
      <DashboardCard>
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
