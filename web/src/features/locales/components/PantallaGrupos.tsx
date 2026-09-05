"use client";
import { useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { IconPlus } from "@tabler/icons-react";

import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { toApiError } from "@/lib/api/client";

import GruposTable from "./GruposTable";
import GrupoFormDialog from "./GrupoFormDialog";
import { useEliminarGrupo } from "../hooks/useRecursos";
import type { Grupo } from "../types";
import SoloSiGestiona from "@/components/shared/SoloSiGestiona";

/**
 * Agrupaciones de locales, profesionales y servicios.
 *
 * ⚠️ **Hoy no las consulta nadie**: ni las citas, ni el calendario, ni la
 * tienda pública. Es un CRUD que no alimenta nada, y así lo dicen tanto la
 * ficha como el backend. Se conecta porque ya estaba maquetado y el endpoint
 * existe, pero antes de darle más peso conviene decidir para qué sirve —
 * ¿filtrar la tienda? ¿agrupar el calendario?—, y el aviso de arriba está a la
 * vista para que nadie configure grupos esperando un efecto que no llega.
 */
export default function PantallaGrupos() {
  const [formAbierto, setFormAbierto] = useState(false);
  const [editando, setEditando] = useState<Grupo | null>(null);
  const [aEliminar, setAEliminar] = useState<Grupo | null>(null);

  const eliminar = useEliminarGrupo();

  const abrirNuevo = () => {
    setEditando(null);
    setFormAbierto(true);
  };

  const abrirEdicion = (grupo: Grupo) => {
    setEditando(grupo);
    setFormAbierto(true);
  };

  return (
    <>
      <Alert severity="info" variant="outlined" sx={{ mb: 3 }}>
        Los grupos todavía no cambian nada: no filtran la tienda ni agrupan el
        calendario. Puedes crearlos, pero de momento solo son una etiqueta.
      </Alert>

      <Stack direction="row" justifyContent="flex-end" mb={3}>
        <SoloSiGestiona modulo="locales">
          <Button
            variant="contained"
            startIcon={<IconPlus size={18} />}
            onClick={abrirNuevo}
          >
            Nuevo grupo
          </Button>
        </SoloSiGestiona>
      </Stack>

      <GruposTable onEditar={abrirEdicion} onEliminar={setAEliminar} />

      <GrupoFormDialog
        abierto={formAbierto}
        grupo={editando}
        onCerrar={() => setFormAbierto(false)}
      />

      <ConfirmDialog
        abierto={!!aEliminar}
        titulo="Eliminar grupo"
        mensaje={
          <>
            Se eliminará <strong>{aEliminar?.nombre}</strong>. Los locales,
            profesionales y servicios que agrupa no se tocan.
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
