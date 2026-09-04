"use client";
import { useState } from "react";
import Button from "@mui/material/Button";
import { IconPlus } from "@tabler/icons-react";

import DashboardCard from "@/components/shared/DashboardCard";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { toApiError } from "@/lib/api/client";

import CupoPlanCard from "./CupoPlanCard";
import EmpleadosTable from "./EmpleadosTable";
import EmpleadoFormDialog from "./EmpleadoFormDialog";
import { useEliminarEmpleado } from "../hooks/useEmpleados";
import type { Empleado } from "../types";

/**
 * La pantalla de Empleados: la tarjeta del cupo, la tabla y sus diálogos.
 *
 * Sin encabezado a propósito. Vive dentro de la vista de Administración, que
 * ya pone el título y la descripción de la sección desde `nav.ts`; ponerle uno
 * propio repetiría el rótulo que el usuario acaba de leer en el índice.
 */
export default function PantallaEmpleados() {
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
    <>
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
            sistema y sus citas quedarán a su nombre.
          </>
        }
        textoConfirmar="Eliminar"
        cargando={eliminar.isPending}
        error={eliminar.isError ? toApiError(eliminar.error).message : null}
        onConfirmar={confirmarEliminacion}
        onCancelar={() => setEmpleadoAEliminar(null)}
      />
    </>
  );
}
