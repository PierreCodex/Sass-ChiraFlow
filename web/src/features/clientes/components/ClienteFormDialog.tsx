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
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import { toApiError } from "@/lib/api/client";
import { useCrearCliente } from "../hooks/useClientes";
import {
  clienteSchema,
  valoresIniciales,
  type ClienteFormValues,
} from "../schemas/cliente.schema";

interface Props {
  abierto: boolean;
  onCerrar: () => void;
}

const ClienteFormDialog = ({ abierto, onCerrar }: Props) => {
  const theme = useTheme();
  const pantallaChica = useMediaQuery(theme.breakpoints.down("sm"));
  const crear = useCrearCliente();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ClienteFormValues>({
    resolver: yupResolver(clienteSchema),
    defaultValues: valoresIniciales,
  });

  // Cada apertura arranca en limpio.
  useEffect(() => {
    if (abierto) {
      reset(valoresIniciales);
      crear.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, reset]);

  const onSubmit = handleSubmit((valores) => {
    crear.mutate(valores, {
      onSuccess: () => onCerrar(),
      onError: (error) => {
        // Laravel devuelve 422 con { message, errors: { campo: [...] } }.
        // Los pintamos en el campo que corresponde.
        const apiError = toApiError(error);
        if (apiError.errors) {
          Object.entries(apiError.errors).forEach(([campo, mensajes]) => {
            setError(campo as keyof ClienteFormValues, {
              message: mensajes[0],
            });
          });
        }
      },
    });
  });

  const errorGeneral = crear.isError ? toApiError(crear.error) : null;

  return (
    <Dialog
      open={abierto}
      onClose={crear.isPending ? undefined : onCerrar}
      fullWidth
      maxWidth="sm"
      fullScreen={pantallaChica}
    >
      {/* Mismo motivo que en ServicioFormDialog: el form es la columna flex
          del Paper, para que scrollee el contenido y no el diálogo entero. */}
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
        {/* component="div": por defecto DialogTitle es un <h2> y no puede
            contener los <h5>/<p> que generan los Typography de dentro. */}
        <DialogTitle component="div">
          <Typography variant="h5" fontWeight={600}>
            Nuevo cliente
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Solo el nombre es obligatorio.
          </Typography>
        </DialogTitle>

        <Divider />

        <DialogContent>
          {errorGeneral && !errorGeneral.errors ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorGeneral.message}
            </Alert>
          ) : null}

          <Grid container spacing={2}>
            <Grid size={12}>
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
                    autoFocus
                    placeholder="Nombre del cliente"
                    error={!!errors.nombre}
                    helperText={errors.nombre?.message}
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
                    placeholder="+51 981 912 809"
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
                    placeholder="cliente@correo.com"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onCerrar} color="inherit" disabled={crear.isPending}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={crear.isPending}>
            {crear.isPending ? "Guardando…" : "Guardar cliente"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default ClienteFormDialog;
