"use client";
import { useEffect, useState } from "react";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import {
  dialogoResponsive,
  formularioCompacto,
} from "@/components/shared/estilos-formulario";
import { toApiError } from "@/lib/api/client";

import MatrizPermisos from "./MatrizPermisos";
import { useActualizarRol, useCrearRol } from "../hooks/useRoles";
import type { MatrizPermisos as Matriz, Rol } from "../types";

interface Props {
  abierto: boolean;
  /** El rol que se edita, o el que se duplica. `null` = uno nuevo. */
  rol?: Rol | null;
  /** Duplicar no es un endpoint: es abrir este diálogo con otro nombre. */
  duplicando?: boolean;
  modulos: string[];
  onCerrar: () => void;
}

/** Los 14 en `null`: un rol nuevo no da acceso a nada hasta que se marca. */
function matrizVacia(modulos: string[]): Matriz {
  return Object.fromEntries(modulos.map((m) => [m, null]));
}

const RolFormDialog = ({
  abierto,
  rol,
  duplicando = false,
  modulos,
  onCerrar,
}: Props) => {
  const esEdicion = !!rol && !duplicando;

  const crear = useCrearRol();
  const actualizar = useActualizarRol();
  const mutacion = esEdicion ? actualizar : crear;

  const [nombre, setNombre] = useState("");
  const [permisos, setPermisos] = useState<Matriz>({});
  const [soloPropios, setSoloPropios] = useState(false);
  const [errorNombre, setErrorNombre] = useState<string | null>(null);

  useEffect(() => {
    if (!abierto) return;

    crear.reset();
    actualizar.reset();
    setErrorNombre(null);

    if (rol) {
      // Al duplicar se copian las casillas y NO el nombre: son únicos por
      // negocio, y «Recepción» repetido daría 422 al guardar.
      setNombre(duplicando ? `${rol.nombre} (copia)` : rol.nombre);
      setPermisos({ ...rol.permisos });
      setSoloPropios(rol.solo_propios);
    } else {
      setNombre("");
      setPermisos(matrizVacia(modulos));
      setSoloPropios(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, rol, duplicando, modulos]);

  const guardar = () => {
    if (!nombre.trim()) {
      setErrorNombre("Ponle un nombre al rol");
      return;
    }

    const payload = { nombre: nombre.trim(), permisos, solo_propios: soloPropios };

    const alTerminar = {
      onSuccess: () => onCerrar(),
      onError: (error: unknown) => {
        const apiError = toApiError(error);
        // El 422 del nombre repetido es el único que cae en un campo.
        setErrorNombre(apiError.errors?.nombre?.[0] ?? null);
      },
    };

    if (esEdicion) {
      actualizar.mutate({ id: rol!.id, payload }, alTerminar);
    } else {
      crear.mutate(payload, alTerminar);
    }
  };

  const apiError = mutacion.isError ? toApiError(mutacion.error) : null;
  /*
    Las barandillas del backend —«El rol del dueño no se puede editar», «Este
    rol lo usan N personas»— llegan en `errors.rol`, que no es un campo de la
    pantalla. Sin esto se quedarían sin pintar.
  */
  const errorGeneral =
    apiError?.errors?.rol?.[0] ??
    (apiError && !apiError.errors ? apiError.message : null);

  const titulo = duplicando
    ? "Duplicar rol"
    : esEdicion
      ? "Editar rol"
      : "Nuevo rol";

  return (
    <Dialog
      sx={dialogoResponsive}
      open={abierto}
      onClose={mutacion.isPending ? undefined : onCerrar}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle component="div">
        <Typography variant="h5" fontWeight={600}>
          {titulo}
        </Typography>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ ...formularioCompacto, minHeight: 0 }}>
        {errorGeneral ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorGeneral}
          </Alert>
        ) : null}

        <Box sx={{ maxWidth: 420 }}>
          <CustomFormLabel htmlFor="nombre-rol" sx={{ mt: 0 }}>
            Nombre del rol
          </CustomFormLabel>
          <CustomTextField
            id="nombre-rol"
            fullWidth
            value={nombre}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setNombre(e.target.value);
              setErrorNombre(null);
            }}
            placeholder="Recepción, Barbero senior…"
            error={!!errorNombre}
            helperText={errorNombre}
          />
        </Box>

        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <FormControlLabel
            sx={{ m: 0 }}
            control={
              <Switch
                checked={soloPropios}
                onChange={(e) => setSoloPropios(e.target.checked)}
              />
            }
            label="Solo ve lo suyo"
          />
          {/*
            Va en su propio recuadro y no como una fila más de la matriz: no
            dice QUÉ puede hacer sino SOBRE QUIÉN, y colarlo entre los catorce
            módulos lo haría parecer un permiso más.
          */}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Con esto encendido verá sus citas y sus clientes, no los de sus
            compañeros. Es independiente de los permisos de abajo.
          </Typography>
        </Box>

        <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 3, mb: 1 }}>
          Permisos
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          «Gestionar» incluye ver. Lo que quede sin marcar no aparece en su
          menú, y el sistema le responde que no aunque escriba la dirección.
        </Typography>

        <MatrizPermisos
          permisos={permisos}
          modulos={modulos}
          onChange={setPermisos}
        />
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3 }}>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            onClick={guardar}
            disabled={mutacion.isPending}
          >
            {mutacion.isPending ? "Guardando…" : esEdicion ? "Actualizar" : "Crear rol"}
          </Button>
          <Button onClick={onCerrar} color="inherit" disabled={mutacion.isPending}>
            Cancelar
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default RolFormDialog;
