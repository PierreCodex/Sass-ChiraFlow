"use client";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

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

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import { dialogoResponsive, formularioCompacto } from "@/components/shared/estilos-formulario";
import { toApiError } from "@/lib/api/client";
import { useActualizarLocalProfesional } from "../hooks/useRecursos";
import type { LocalProfesional, LocalProfesionalPayload } from "../types";

/** Reglas de `LocalProfesionalController::update`. */
const esquema = yup.object({
  nombre_publico: yup
    .string()
    .trim()
    .transform((valor) => (valor === "" ? null : valor))
    .max(150, "Máximo 150 caracteres")
    .nullable()
    .defined(),
  horario_apertura: yup
    .string()
    .transform((valor) => (valor === "" ? null : valor))
    .nullable()
    .defined(),
  horario_cierre: yup
    .string()
    .transform((valor) => (valor === "" ? null : valor))
    .nullable()
    .defined(),
  perfil: yup
    .string()
    .trim()
    .transform((valor) => (valor === "" ? null : valor))
    .max(2000, "Máximo 2000 caracteres")
    .nullable()
    .defined(),
});

type FormValues = yup.InferType<typeof esquema>;

interface Props {
  localId: number | undefined;
  nombreLocal: string;
  profesional: LocalProfesional | null;
  onCerrar: () => void;
}

const LocalProfesionalDialog = ({
  localId,
  nombreLocal,
  profesional,
  onCerrar,
}: Props) => {
  const actualizar = useActualizarLocalProfesional(localId);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(esquema),
    defaultValues: {
      nombre_publico: null,
      horario_apertura: null,
      horario_cierre: null,
      perfil: null,
    },
  });

  useEffect(() => {
    if (!profesional) return;
    actualizar.reset();
    reset({
      nombre_publico: profesional.nombre_publico,
      horario_apertura: profesional.horario_apertura,
      horario_cierre: profesional.horario_cierre,
      perfil: profesional.perfil,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profesional, reset]);

  const onSubmit = handleSubmit((valores) => {
    if (!profesional) return;

    actualizar.mutate(
      {
        profesionalId: profesional.id,
        // `habilitado` se cambia con el interruptor de la tabla: aquí se
        // reenvía tal cual para no pisarlo.
        payload: {
          ...valores,
          habilitado: profesional.habilitado,
        } as LocalProfesionalPayload,
      },
      {
        onSuccess: () => onCerrar(),
        onError: (error) => {
          const apiError = toApiError(error);
          if (apiError.errors) {
            Object.entries(apiError.errors).forEach(([campo, mensajes]) => {
              setError(campo as keyof FormValues, { message: mensajes[0] });
            });
          }
        },
      }
    );
  });

  const errorGeneral = actualizar.isError ? toApiError(actualizar.error) : null;

  return (
    <Dialog
      sx={dialogoResponsive}
      open={!!profesional}
      onClose={actualizar.isPending ? undefined : onCerrar}
      fullWidth
      maxWidth="sm"
    >
      <Box component="form" onSubmit={onSubmit} noValidate>
        <DialogTitle component="div">
          <Typography variant="h5" fontWeight={600}>
            {profesional?.nombre}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Configuración solo para {nombreLocal}
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
            <Grid size={12}>
              <CustomFormLabel htmlFor="nombre_publico">
                Nombre público
              </CustomFormLabel>
              <Controller
                name="nombre_publico"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    value={field.value ?? ""}
                    id="nombre_publico"
                    fullWidth
                    autoFocus
                    placeholder={profesional?.nombre}
                    error={!!errors.nombre_publico}
                    helperText={
                      errors.nombre_publico?.message ??
                      "Cómo aparece en la página pública. Vacío usa su nombre real."
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={6}>
              <CustomFormLabel htmlFor="horario_apertura">
                Horario desde
              </CustomFormLabel>
              <Controller
                name="horario_apertura"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    value={field.value ?? ""}
                    id="horario_apertura"
                    type="time"
                    fullWidth
                    error={!!errors.horario_apertura}
                    helperText={errors.horario_apertura?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={6}>
              <CustomFormLabel htmlFor="horario_cierre">
                Horario hasta
              </CustomFormLabel>
              <Controller
                name="horario_cierre"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    value={field.value ?? ""}
                    id="horario_cierre"
                    type="time"
                    fullWidth
                    error={!!errors.horario_cierre}
                    helperText={errors.horario_cierre?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={12}>
              <Alert severity="info" variant="outlined">
                Este horario es informativo para la página pública. La
                disponibilidad real de reservas sale del horario del
                profesional, en <strong>Empleados</strong>.
              </Alert>
            </Grid>

            <Grid size={12}>
              <CustomFormLabel htmlFor="perfil">Perfil</CustomFormLabel>
              <Controller
                name="perfil"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    value={field.value ?? ""}
                    id="perfil"
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Especialidad, experiencia… se muestra en la página pública."
                    error={!!errors.perfil}
                    helperText={errors.perfil?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3 }}>
          <Stack direction="row" spacing={1}>
            <Button
              type="submit"
              variant="contained"
              disabled={actualizar.isPending}
            >
              {actualizar.isPending ? "Guardando…" : "Guardar"}
            </Button>
            <Button
              onClick={onCerrar}
              color="inherit"
              disabled={actualizar.isPending}
            >
              Cancelar
            </Button>
          </Stack>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default LocalProfesionalDialog;
