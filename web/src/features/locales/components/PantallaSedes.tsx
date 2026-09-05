"use client";
import { useState } from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { IconPlus } from "@tabler/icons-react";

import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { toApiError } from "@/lib/api/client";

import LocalesGrid from "./LocalesGrid";
import LocalFormDialog from "./LocalFormDialog";
import { useEliminarLocal } from "../hooks/useLocales";
import type { Local } from "../types";

/**
 * Las sedes del negocio.
 *
 * Sin encabezado propio: vive dentro de la vista de Administración, que ya
 * pone el título y la descripción de la sección desde `nav.ts`.
 */
export default function PantallaSedes() {
  const [formAbierto, setFormAbierto] = useState(false);
  const [editando, setEditando] = useState<Local | null>(null);
  const [aEliminar, setAEliminar] = useState<Local | null>(null);

  const eliminar = useEliminarLocal();

  const abrirNuevo = () => {
    setEditando(null);
    setFormAbierto(true);
  };

  const abrirEdicion = (local: Local) => {
    setEditando(local);
    setFormAbierto(true);
  };

  return (
    <>
      <Stack direction="row" justifyContent="flex-end" mb={3}>
        <Button
          variant="contained"
          startIcon={<IconPlus size={18} />}
          onClick={abrirNuevo}
        >
          Agregar local
        </Button>
      </Stack>

      <LocalesGrid onEditar={abrirEdicion} onEliminar={setAEliminar} />

      <LocalFormDialog
        abierto={formAbierto}
        local={editando}
        onCerrar={() => setFormAbierto(false)}
      />

      <ConfirmDialog
        abierto={!!aEliminar}
        titulo="Eliminar local"
        mensaje={
          <>
            ¿Seguro que quieres eliminar <strong>{aEliminar?.nombre}</strong>?
            Esta acción no se puede deshacer.
          </>
        }
        textoConfirmar="Eliminar"
        cargando={eliminar.isPending}
        error={eliminar.isError ? toApiError(eliminar.error).message : null}
        onConfirmar={() =>
          aEliminar &&
          eliminar.mutate(aEliminar.id, { onSuccess: () => setAEliminar(null) })
        }
        onCancelar={() => setAEliminar(null)}
      />
    </>
  );
}
