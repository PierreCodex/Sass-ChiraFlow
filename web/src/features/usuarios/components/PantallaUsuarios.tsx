"use client";
import { useState } from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { IconPlus } from "@tabler/icons-react";

import DashboardCard from "@/components/shared/DashboardCard";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { toApiError } from "@/lib/api/client";

import UsuariosTable from "./UsuariosTable";
import UsuarioFormDialog from "./UsuarioFormDialog";
import { useEliminarUsuario } from "../hooks/useUsuarios";
import { nombreCompleto, type Usuario } from "../types";

/**
 * La pantalla de Usuarios: quién entra al panel.
 *
 * Sin encabezado a propósito. Vive dentro de la vista de Administración, que
 * ya pone el título y la descripción de la sección desde `nav.ts`; ponerle uno
 * propio repetiría el rótulo que el usuario acaba de leer en el índice.
 *
 * Y sin tarjeta de cupo, al revés que Profesionales: **las cuentas del panel
 * son ilimitadas**. Lo que cuesta dinero es tener agenda, no tener login.
 */
export default function PantallaUsuarios() {
  const [formAbierto, setFormAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<Usuario | null>(null);

  const eliminar = useEliminarUsuario();

  const abrirNuevo = () => {
    setUsuarioEditando(null);
    setFormAbierto(true);
  };

  const abrirEdicion = (usuario: Usuario) => {
    setUsuarioEditando(usuario);
    setFormAbierto(true);
  };

  const confirmarEliminacion = () => {
    if (!usuarioAEliminar) return;
    eliminar.mutate(usuarioAEliminar.id, {
      onSuccess: () => setUsuarioAEliminar(null),
    });
  };

  return (
    <>
      <Stack direction="row" justifyContent="flex-end" mb={3}>
        <Button
          variant="contained"
          startIcon={<IconPlus size={18} />}
          onClick={abrirNuevo}
        >
          Dar acceso
        </Button>
      </Stack>

      <DashboardCard>
        <UsuariosTable
          onEditar={abrirEdicion}
          onEliminar={setUsuarioAEliminar}
        />
      </DashboardCard>

      <UsuarioFormDialog
        abierto={formAbierto}
        usuario={usuarioEditando}
        onCerrar={() => setFormAbierto(false)}
      />

      <ConfirmDialog
        abierto={!!usuarioAEliminar}
        titulo="Quitar el acceso al panel"
        mensaje={
          <>
            <strong>
              {usuarioAEliminar ? nombreCompleto(usuarioAEliminar) : ""}
            </strong>{" "}
            dejará de poder entrar al sistema.
            {/*
              El otro lado de la separación, dicho donde se decide: quitar la
              cuenta no borra la ficha. Sin esta frase, quien quiere dar de baja
              a alguien del todo se va creyendo que ya está, y la persona sigue
              apareciendo en la agenda y en la tienda pública.
            */}
            {usuarioAEliminar?.profesional ? (
              <>
                {" "}
                Su ficha de profesional se queda como está: sigue en la agenda y
                conserva sus citas. Para darla de baja, ve a Profesionales.
              </>
            ) : null}
          </>
        }
        textoConfirmar="Quitar acceso"
        cargando={eliminar.isPending}
        error={eliminar.isError ? toApiError(eliminar.error).message : null}
        onConfirmar={confirmarEliminacion}
        onCancelar={() => setUsuarioAEliminar(null)}
      />
    </>
  );
}
