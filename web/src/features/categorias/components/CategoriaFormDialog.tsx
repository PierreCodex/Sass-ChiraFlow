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
import { useActualizarCategoria, useCrearCategoria } from "../hooks/useCategorias";
import {
  categoriaSchema,
  valoresIniciales,
  type CategoriaFormValues,
} from "../schemas/categoria.schema";
import type { Categoria, CategoriaPayload } from "../types";

interface Props {
  abierto: boolean;
  categoria?: Categoria | null;
  onCerrar: () => void;
}

const CategoriaFormDialog = ({ abierto, categoria, onCerrar }: Props) => {
  const theme = useTheme();

  const esEdicion = !!categoria;
  const crear = useCrearCategoria();
  const actualizar = useActualizarCategoria();
  const mutacion = esEdicion ? actualizar : crear;

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CategoriaFormValues>({
    resolver: yupResolver(categoriaSchema),
    defaultValues: valoresIniciales,
  });

  useEffect(() => {
    if (!abierto) return;

    crear.reset();
    actualizar.reset();

    reset(
      categoria
        ? {
            nombre: categoria.nombre,
            descripcion: categoria.descripcion,
            color: categoria.color ?? "#5D87FF",
            orden: categoria.orden,
            imagen: categoria.imagen_url ? [{ url: categoria.imagen_url }] : [],
          }
        : valoresIniciales
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, categoria, reset]);

  const onSubmit = handleSubmit((valores) => {
    const payload: CategoriaPayload = {
      nombre: valores.nombre,
      descripcion: valores.descripcion,
      color: valores.color,
      orden: valores.orden,
      imagen: valores.imagen[0]?.file ?? null,
    };

    const alTerminar = {
      onSuccess: () => onCerrar(),
      onError: (error: unknown) => {
        const apiError = toApiError(error);
        if (apiError.errors) {
          Object.entries(apiError.errors).forEach(([campo, mensajes]) => {
            setError(campo as keyof CategoriaFormValues, {
              message: mensajes[0],
            });
          });
        }
      },
    };

    if (esEdicion) {
      actualizar.mutate({ id: categoria.id, payload }, alTerminar);
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
            {esEdicion ? "Editar categoría" : "Nueva categoría"}
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
              <CustomFormLabel htmlFor="nombre">Nombre</CustomFormLabel>
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

            <Grid size={{ xs: 12, sm: 4 }}>
              <CustomFormLabel htmlFor="orden">Orden</CustomFormLabel>
              <Controller
                name="orden"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    id="orden"
                    type="number"
                    fullWidth
                    error={!!errors.orden}
                    helperText={
                      errors.orden?.message ?? "Menor número, más arriba"
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={12}>
              <CustomFormLabel htmlFor="descripcion">Descripción</CustomFormLabel>
              <Controller
                name="descripcion"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    value={field.value ?? ""}
                    id="descripcion"
                    fullWidth
                    multiline
                    rows={2}
                    error={!!errors.descripcion}
                    helperText={errors.descripcion?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="color">Color</CustomFormLabel>
              <Controller
                name="color"
                control={control}
                render={({ field }) => (
                  <Box
                    component="input"
                    {...field}
                    value={field.value ?? "#5D87FF"}
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
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="imagen">Imagen</CustomFormLabel>
              <Controller
                name="imagen"
                control={control}
                render={({ field }) => (
                  <CampoImagenes
                    valor={field.value}
                    onChange={field.onChange}
                    max={1}
                    ayuda="Si la pones, reemplaza al color en el listado. Máx. 2 MB."
                    error={errors.imagen?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3 }}>
          <Stack direction="row" spacing={1}>
            <Button type="submit" variant="contained" disabled={mutacion.isPending}>
              {mutacion.isPending
                ? "Guardando…"
                : esEdicion
                  ? "Guardar cambios"
                  : "Crear categoría"}
            </Button>
            <Button onClick={onCerrar} color="inherit" disabled={mutacion.isPending}>
              Cancelar
            </Button>
          </Stack>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default CategoriaFormDialog;
