"use client";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import CampoImagenes from "@/components/shared/CampoImagenes";
import { dialogoResponsive, formularioCompacto } from "@/components/shared/estilos-formulario";
import { toApiError } from "@/lib/api/client";
import { useActualizarLocal, useCrearLocal } from "../hooks/useLocales";
import {
  localSchema,
  valoresIniciales,
  type LocalFormValues,
} from "../schemas/local.schema";
import type { Local, LocalPayload } from "../types";

interface Props {
  abierto: boolean;
  local?: Local | null;
  onCerrar: () => void;
}

const LocalFormDialog = ({ abierto, local, onCerrar }: Props) => {
  const theme = useTheme();

  const esEdicion = !!local;
  const crear = useCrearLocal();
  const actualizar = useActualizarLocal();
  const mutacion = esEdicion ? actualizar : crear;

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<LocalFormValues>({
    resolver: yupResolver(localSchema),
    defaultValues: valoresIniciales,
  });

  useEffect(() => {
    if (!abierto) return;

    crear.reset();
    actualizar.reset();

    reset(
      local
        ? {
            nombre: local.nombre,
            direccion: local.direccion,
            descripcion_publica: local.descripcion_publica,
            telefono: local.telefono,
            email: local.email,
            latitud: local.latitud,
            longitud: local.longitud,
            /*
              El backend lo permite nulo y el `input[type=color]` no: sin
              valor pinta negro y la regla de hex lo rechaza al guardar, con un
              error sobre un campo que el usuario no ha tocado. Se cae al
              mismo color con el que nace un local nuevo.
            */
            color: local.color ?? valoresIniciales.color,
            horario_desde: local.horario_desde,
            horario_hasta: local.horario_hasta,
            banner: local.banner_url ? [{ url: local.banner_url }] : [],
            logo: local.logo_url ? [{ url: local.logo_url }] : [],
          }
        : valoresIniciales
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, local, reset]);

  const onSubmit = handleSubmit((valores) => {
    const payload: LocalPayload = {
      nombre: valores.nombre,
      direccion: valores.direccion,
      descripcion_publica: valores.descripcion_publica,
      telefono: valores.telefono,
      email: valores.email,
      latitud: valores.latitud,
      longitud: valores.longitud,
      color: valores.color,
      horario_desde: valores.horario_desde,
      horario_hasta: valores.horario_hasta,
      banner: valores.banner[0]?.file ?? null,
      logo: valores.logo[0]?.file ?? null,
      /*
        No mandar el archivo significa «déjalo como está», así que vaciar el
        campo necesita su bandera. Sin esto, quitar el banner en el formulario
        no borraba nada: al recargar volvía a estar.
      */
      banner_eliminar: esEdicion && !!local.banner_url && valores.banner.length === 0,
      logo_eliminar: esEdicion && !!local.logo_url && valores.logo.length === 0,
    };

    const alTerminar = {
      onSuccess: () => onCerrar(),
      onError: (error: unknown) => {
        const apiError = toApiError(error);
        if (apiError.errors) {
          Object.entries(apiError.errors).forEach(([campo, mensajes]) => {
            setError(campo as keyof LocalFormValues, { message: mensajes[0] });
          });
        }
      },
    };

    if (esEdicion) {
      actualizar.mutate({ id: local.id, payload }, alTerminar);
    } else {
      crear.mutate(payload, alTerminar);
    }
  });

  const errorGeneral = mutacion.isError ? toApiError(mutacion.error) : null;

  return (
    <Dialog
      sx={dialogoResponsive}
      open={abierto}
      onClose={mutacion.isPending ? undefined : onCerrar}
      fullWidth
      maxWidth="sm"
    >
      <Box
        component="form"
        onSubmit={onSubmit}
        noValidate
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <DialogTitle component="div">
          <Typography variant="h5" fontWeight={600}>
            {esEdicion ? "Editar local" : "Nuevo local"}
          </Typography>
        </DialogTitle>

        <Divider />

        <DialogContent sx={formularioCompacto}>
          {errorGeneral && !errorGeneral.errors ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorGeneral.message}
            </Alert>
          ) : null}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <CustomFormLabel htmlFor="nombre">
                Nombre del local
              </CustomFormLabel>
              <Controller
                name="nombre"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    id="nombre"
                    fullWidth
                    autoFocus
                    error={!!errors.nombre}
                    helperText={errors.nombre?.message}
                  />
                )}
              />
            </Grid>

            {/* El color es una muestra: no necesita todo el ancho. */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <CustomFormLabel htmlFor="color">Color</CustomFormLabel>
              <Controller
                name="color"
                control={control}
                render={({ field }) => (
                  <Box
                    component="input"
                    {...field}
                    type="color"
                    id="color"
                    sx={{
                      width: "100%",
                      height: 41,
                      p: 0.5,
                      cursor: "pointer",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                    }}
                  />
                )}
              />
              {/*
                El color no es un CustomTextField, así que no tiene dónde
                pintar su `helperText`: el mensaje va debajo a mano. Puede
                fallar de verdad — el backend exige hex de 6 porque la columna
                es char(7) y con MySQL estricto otra cosa sería un 500.
              */}
              {errors.color ? (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
                  {errors.color.message}
                </Typography>
              ) : null}
            </Grid>

            <Grid size={12}>
              <CustomFormLabel htmlFor="direccion">Dirección</CustomFormLabel>
              <Controller
                name="direccion"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    value={field.value ?? ""}
                    id="direccion"
                    fullWidth
                    error={!!errors.direccion}
                    helperText={errors.direccion?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={12}>
              <CustomFormLabel htmlFor="descripcion_publica">
                Descripción pública
              </CustomFormLabel>
              <Controller
                name="descripcion_publica"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    value={field.value ?? ""}
                    id="descripcion_publica"
                    fullWidth
                    multiline
                    rows={2}
                    error={!!errors.descripcion_publica}
                    helperText={
                      errors.descripcion_publica?.message ??
                      "Se muestra en la página pública de reservas."
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
                    error={!!errors.telefono}
                    helperText={errors.telefono?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="email">Email</CustomFormLabel>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    value={field.value ?? ""}
                    id="email"
                    type="email"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="latitud">Latitud</CustomFormLabel>
              <Controller
                name="latitud"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    value={field.value ?? ""}
                    id="latitud"
                    type="number"
                    fullWidth
                    error={!!errors.latitud}
                    helperText={errors.latitud?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="longitud">Longitud</CustomFormLabel>
              <Controller
                name="longitud"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    value={field.value ?? ""}
                    id="longitud"
                    type="number"
                    fullWidth
                    error={!!errors.longitud}
                    helperText={errors.longitud?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="horario_desde">
                Horario desde
              </CustomFormLabel>
              <Controller
                name="horario_desde"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    value={field.value ?? ""}
                    id="horario_desde"
                    type="time"
                    fullWidth
                    error={!!errors.horario_desde}
                    helperText={errors.horario_desde?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="horario_hasta">
                Horario hasta
              </CustomFormLabel>
              <Controller
                name="horario_hasta"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    value={field.value ?? ""}
                    id="horario_hasta"
                    type="time"
                    fullWidth
                    error={!!errors.horario_hasta}
                    helperText={errors.horario_hasta?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="banner">Banner / Portada</CustomFormLabel>
              <Controller
                name="banner"
                control={control}
                render={({ field }) => (
                  <CampoImagenes
                    valor={field.value}
                    onChange={field.onChange}
                    max={1}
                    error={errors.banner?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="logo">Logo</CustomFormLabel>
              <Controller
                name="logo"
                control={control}
                render={({ field }) => (
                  <CampoImagenes
                    valor={field.value}
                    onChange={field.onChange}
                    max={1}
                    error={errors.logo?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3 }}>
          <Stack direction="row" spacing={1}>
            <Button onClick={onCerrar} color="inherit" disabled={mutacion.isPending}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={mutacion.isPending}>
              {mutacion.isPending
                ? "Guardando…"
                : esEdicion
                  ? "Guardar cambios"
                  : "Crear local"}
            </Button>
          </Stack>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default LocalFormDialog;
