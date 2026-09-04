"use client";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import {
  dialogoResponsive,
  formularioCompacto,
} from "@/components/shared/estilos-formulario";
import { toApiError } from "@/lib/api/client";
import {
  normalizarTelefono,
  PREFIJO_TELEFONO,
  soloDigitos,
} from "@/features/auth/types";
import { useRoles } from "@/features/roles/hooks/useRoles";

import { useActualizarUsuario, useCrearUsuario } from "../hooks/useUsuarios";
import {
  usuarioSchema,
  valoresIniciales,
  type UsuarioFormValues,
} from "../schemas/usuario.schema";
import type { Usuario, UsuarioPayload } from "../types";

interface Props {
  abierto: boolean;
  usuario?: Usuario | null;
  onCerrar: () => void;
}

/**
 * Alta y edición de una cuenta del panel.
 *
 * Seis campos y ninguno es la contraseña: la persona la elige desde la
 * invitación que le llega al correo. Es lo que hace que este formulario quepa
 * sin pestañas, al revés que el de profesionales.
 */
const UsuarioFormDialog = ({ abierto, usuario, onCerrar }: Props) => {
  const esEdicion = !!usuario;

  // El select de rol es dinámico: el negocio tiene los tres de sistema más los
  // que cree el dueño, y sin la lista no se le puede asignar ninguno.
  const {
    data: roles,
    isPending: rolesCargando,
    isError: rolesFallaron,
  } = useRoles();
  const crear = useCrearUsuario();
  const actualizar = useActualizarUsuario();
  const mutacion = esEdicion ? actualizar : crear;

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<UsuarioFormValues>({
    resolver: yupResolver(usuarioSchema),
    defaultValues: valoresIniciales,
  });

  useEffect(() => {
    if (!abierto) return;

    crear.reset();
    actualizar.reset();

    reset(
      usuario
        ? {
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            email: usuario.email,
            // Se guarda como `+51987654321` y se teclea en 9 dígitos.
            telefono: usuario.telefono
              ? soloDigitos(usuario.telefono).slice(-9)
              : null,
            rol_id: usuario.rol_id,
            activo: usuario.activo,
          }
        : valoresIniciales
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, usuario, reset]);

  const onSubmit = handleSubmit((valores) => {
    const payload: UsuarioPayload = {
      nombre: valores.nombre,
      apellido: valores.apellido,
      email: valores.email,
      telefono: valores.telefono ? normalizarTelefono(valores.telefono) : null,
      rol_id: valores.rol_id,
      activo: valores.activo,
    };

    const alTerminar = {
      onSuccess: () => onCerrar(),
      onError: (error: unknown) => {
        const apiError = toApiError(error);
        if (apiError.errors) {
          Object.entries(apiError.errors).forEach(([campo, mensajes]) => {
            setError(campo as keyof UsuarioFormValues, {
              message: mensajes[0],
            });
          });
        }
      },
    };

    if (esEdicion) {
      actualizar.mutate({ id: usuario.id, payload }, alTerminar);
    } else {
      crear.mutate(payload, alTerminar);
    }
  });

  const errorApi = mutacion.isError ? toApiError(mutacion.error) : null;
  /*
    Las barandillas del dueño («Ya hay un dueño en este negocio», «El dueño del
    negocio no puede cambiar de rol») llegan en `errors.rol_id` y las pinta el
    select. El resto de errores sin campo —red, 403— van al Alert de arriba.
  */
  const errorGeneral = errorApi && !errorApi.errors ? errorApi.message : null;

  return (
    <Dialog
      sx={dialogoResponsive}
      open={abierto}
      onClose={mutacion.isPending ? undefined : onCerrar}
      fullWidth
      maxWidth="sm"
    >
      <Box component="form" onSubmit={onSubmit} noValidate>
        <DialogTitle component="div">
          <Typography variant="h5" fontWeight={600}>
            {esEdicion ? "Editar acceso" : "Dar acceso al panel"}
          </Typography>
        </DialogTitle>

        <Divider />

        <DialogContent sx={formularioCompacto}>
          {errorGeneral ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorGeneral}
            </Alert>
          ) : null}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="nombre" sx={{ mt: 0 }}>
                Nombre
              </CustomFormLabel>
              <Controller
                name="nombre"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    id="nombre"
                    fullWidth
                    error={!!errors.nombre}
                    helperText={errors.nombre?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="apellido" sx={{ mt: 0 }}>
                Apellido
              </CustomFormLabel>
              <Controller
                name="apellido"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    value={field.value ?? ""}
                    id="apellido"
                    fullWidth
                    error={!!errors.apellido}
                    helperText={errors.apellido?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={12}>
              <CustomFormLabel htmlFor="email">Correo</CustomFormLabel>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    id="email"
                    type="email"
                    fullWidth
                    autoComplete="off"
                    error={!!errors.email}
                    helperText={
                      errors.email?.message ??
                      (esEdicion
                        ? "Con este correo inicia sesión."
                        : "Aquí le llegará la invitación para crear su contraseña.")
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="telefono">Teléfono</CustomFormLabel>
              <Controller
                name="telefono"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    value={field.value ?? ""}
                    id="telefono"
                    fullWidth
                    placeholder="987 654 321"
                    error={!!errors.telefono}
                    helperText={errors.telefono?.message}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            {PREFIJO_TELEFONO}
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="rol_id">Rol</CustomFormLabel>
              <Controller
                name="rol_id"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    id="rol_id"
                    fullWidth
                    disabled={rolesCargando || rolesFallaron}
                    error={!!errors.rol_id || rolesFallaron}
                    /*
                      Si la lista no llega, el select se quedaba vacío sin
                      explicar nada: el formulario era imposible de enviar y no
                      habia forma de saber por qué. Un desplegable sin opciones
                      parece un fallo del usuario y es del servidor.
                    */
                    helperText={
                      rolesFallaron
                        ? "No se pudieron cargar los roles. Recarga la página o inténtalo en un momento."
                        : errors.rol_id?.message
                    }
                    slotProps={{ select: { displayEmpty: true } }}
                  >
                    <MenuItem value={0}>
                      {rolesCargando
                        ? "Cargando roles…"
                        : rolesFallaron
                          ? "Sin roles disponibles"
                          : "Elige un rol"}
                    </MenuItem>
                    {(roles ?? []).map((rol) => (
                      <MenuItem key={rol.id} value={rol.id}>
                        {rol.nombre}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>

            <Grid size={12}>
              <Controller
                name="activo"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Puede entrar al panel"
                  />
                )}
              />
            </Grid>

            {/*
              Se dice aquí y no en un tooltip: quien acaba de rellenar el
              formulario espera que la persona ya pueda entrar, y no es así
              hasta que abre su correo. Sin este aviso, el hueco entre «Guardar»
              y «ya puede trabajar» parece un fallo.
            */}
            {!esEdicion ? (
              <Grid size={12}>
                <Alert severity="info">
                  No se escribe ninguna contraseña. Al guardar le llega un
                  correo para que cree la suya, con un enlace válido 7 días.
                </Alert>
              </Grid>
            ) : null}
          </Grid>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3 }}>
          <Stack direction="row" spacing={1}>
            <Button
              type="submit"
              variant="contained"
              disabled={mutacion.isPending}
            >
              {mutacion.isPending
                ? "Guardando…"
                : esEdicion
                  ? "Actualizar"
                  : "Enviar invitación"}
            </Button>
            <Button
              onClick={onCerrar}
              color="inherit"
              disabled={mutacion.isPending}
            >
              Cancelar
            </Button>
          </Stack>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default UsuarioFormDialog;
