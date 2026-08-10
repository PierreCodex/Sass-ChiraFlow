"use client";
import { useState } from "react";
import Button from "@mui/material/Button";
import { IconPlus } from "@tabler/icons-react";

import PageContainer from "@/components/container/PageContainer";
import Breadcrumb from "@/layout/shared/breadcrumb/Breadcrumb";
import DashboardCard from "@/components/shared/DashboardCard";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import CupoPlanCard from "@/features/empleados/components/CupoPlanCard";
import EmpleadosTable from "@/features/empleados/components/EmpleadosTable";
import EmpleadoFormDialog from "@/features/empleados/components/EmpleadoFormDialog";
import { useEliminarEmpleado } from "@/features/empleados/hooks/useEmpleados";
import type { Empleado } from "@/features/empleados/types";
import { toApiError } from "@/lib/api/client";

const BCrumb = [{ to: "/", title: "Inicio" }, { title: "Empleados" }];

export default function EmpleadosPage() {
  const [formAbierto, setFormAbierto] = useState(false);
  const [empleadoEditando, setEmpleadoEditando] = useState<Empleado | null>(null);
  const [empleadoAEliminar, setEmpleadoAEliminar] = useState<Empleado | null>(null);

  const eliminar = useEliminarEmpleado();

  const abrirNuevo = () => {
    setEmpleadoEditando(null);
    setFormAbierto(true);
  };

  const abrirEdicion = (empleado: Empleado) => {
    setEmpleadoEditando(empleado);
    setFormAbierto(true);
  };

  const confirmarEliminacion = () => {
    if (!empleadoAEliminar) return;
    eliminar.mutate(empleadoAEliminar.id, {
      onSuccess: () => setEmpleadoAEliminar(null),
    });
  };

  return (
    <PageContainer title="Empleados" description="Personal del negocio">
      <Breadcrumb title="Empleados" items={BCrumb} />

      <CupoPlanCard
        accion={
          <Button
            variant="contained"
            startIcon={<IconPlus size={18} />}
            onClick={abrirNuevo}
          >
            Nuevo empleado
          </Button>
        }
      />

      <DashboardCard>
        <EmpleadosTable
          onEditar={abrirEdicion}
          onEliminar={setEmpleadoAEliminar}
        />
      </DashboardCard>

      <EmpleadoFormDialog
        abierto={formAbierto}
        empleado={empleadoEditando}
        onCerrar={() => setFormAbierto(false)}
      />

      <ConfirmDialog
        abierto={!!empleadoAEliminar}
        titulo="Eliminar empleado"
        mensaje={
          <>
            ¿Seguro que quieres eliminar a{" "}
            <strong>{empleadoAEliminar?.nombre}</strong>? Perderá el acceso al
            sistema y esta acción no se puede deshacer.
          </>
        }
        textoConfirmar="Eliminar"
        cargando={eliminar.isPending}
        error={eliminar.isError ? toApiError(eliminar.error).message : null}
        onConfirmar={confirmarEliminacion}
        onCancelar={() => setEmpleadoAEliminar(null)}
      />
    </PageContainer>
  );
}
