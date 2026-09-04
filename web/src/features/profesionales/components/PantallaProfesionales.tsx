"use client";
import { useState } from "react";
import Button from "@mui/material/Button";
import { IconPlus } from "@tabler/icons-react";

import DashboardCard from "@/components/shared/DashboardCard";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { toApiError } from "@/lib/api/client";

import CupoPlanCard from "./CupoPlanCard";
import ProfesionalesTable from "./ProfesionalesTable";
import ProfesionalFormDialog from "./ProfesionalFormDialog";
import SinProfesionales from "./SinProfesionales";
import { useEliminarProfesional, useProfesionales } from "../hooks/useProfesionales";
import type { Profesional } from "../types";

/**
 * La pantalla de Profesionales: quién presta los servicios.
 *
 * Sin encabezado a propósito. Vive dentro de la vista de Administración, que
 * ya pone el título y la descripción de la sección desde `nav.ts`; ponerle uno
 * propio repetiría el rótulo que el usuario acaba de leer en el índice.
 */
export default function PantallaProfesionales() {
  const [formAbierto, setFormAbierto] = useState(false);
  const [editando, setEditando] = useState<Profesional | null>(null);
  const [aEliminar, setAEliminar] = useState<Profesional | null>(null);

  const eliminar = useEliminarProfesional();

  /*
    La primera página sin filtrar, solo para saber si el negocio está vacío.

    Hace falta porque un listado vacío aquí es el caso NORMAL de un negocio
    recién registrado: la ficha del dueño se crea solo si respondió que
    trabaja solo, así que quien dijo «3-5» entra y no ve a nadie. Una tabla con
    «no hay registros» daría a entender que algo falló.

    Comparte `queryKey` con la tabla cuando esta está en su estado inicial, así
    que no es una petición de más en el caso que importa.
  */
  const { data: primeraPagina } = useProfesionales({ page: 1, per_page: 10 });
  const vacio = primeraPagina?.meta.total === 0;

  const abrirNuevo = () => {
    setEditando(null);
    setFormAbierto(true);
  };

  const abrirEdicion = (profesional: Profesional) => {
    setEditando(profesional);
    setFormAbierto(true);
  };

  const confirmarEliminacion = () => {
    if (!aEliminar) return;
    eliminar.mutate(aEliminar.id, {
      onSuccess: () => setAEliminar(null),
    });
  };

  return (
    <>
      {vacio ? (
        <SinProfesionales onAgregar={abrirNuevo} />
      ) : (
        <>
          <CupoPlanCard
            accion={
              <Button
                variant="contained"
                startIcon={<IconPlus size={18} />}
                onClick={abrirNuevo}
              >
                Nuevo profesional
              </Button>
            }
          />

          <DashboardCard>
            <ProfesionalesTable
              onEditar={abrirEdicion}
              onEliminar={setAEliminar}
            />
          </DashboardCard>
        </>
      )}

      <ProfesionalFormDialog
        abierto={formAbierto}
        profesional={editando}
        onCerrar={() => setFormAbierto(false)}
      />

      <ConfirmDialog
        abierto={!!aEliminar}
        titulo="Dar de baja al profesional"
        mensaje={
          <>
            <strong>{aEliminar?.nombre}</strong> dejará de aparecer en la agenda
            y en tu tienda pública. Sus citas se conservan.
            {/*
              La otra mitad de la separación, dicha donde se decide. Dar de baja
              la ficha NO le quita la cuenta: son dos decisiones distintas, y
              quien viene a «sacar del sistema» a alguien se iría creyendo que
              ya está mientras la persona sigue pudiendo entrar.
            */}
            {aEliminar?.usuario ? (
              <>
                {" "}
                Esta persona <strong>conserva su acceso al panel</strong>: para
                quitárselo, ve a Usuarios.
              </>
            ) : null}
          </>
        }
        textoConfirmar="Dar de baja"
        cargando={eliminar.isPending}
        error={eliminar.isError ? toApiError(eliminar.error).message : null}
        onConfirmar={confirmarEliminacion}
        onCancelar={() => setAEliminar(null)}
      />
    </>
  );
}
