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
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import { formularioCompacto } from "@/components/shared/estilos-formulario";
import { toApiError } from "@/lib/api/client";
import { useActualizarProducto, useCrearProducto } from "../hooks/useProductos";
import type { Producto, ProductoPayload } from "../types";

/** Reglas de `InventarioController::store`. */
const productoSchema = yup.object({
  nombre: yup
    .string()
    .trim()
    .max(150, "Máximo 150 caracteres")
    .required("El nombre es obligatorio"),
  descripcion: yup
    .string()
    .trim()
    .transform((valor) => (valor === "" ? null : valor))
    .max(255, "Máximo 255 caracteres")
    .nullable()
    .defined(),
  stock: yup
    .number()
    .typeError("Escribe un número")
    .integer("Debe ser entero")
    .min(0, "No puede ser negativo")
    .required("El stock es obligatorio"),
  stock_minimo: yup
    .number()
    .typeError("Escribe un número")
    .integer("Debe ser entero")
    .min(0, "No puede ser negativo")
    .required("El mínimo es obligatorio"),
  precio_compra: yup
    .number()
    .typeError("Escribe el precio")
    .min(0, "No puede ser negativo")
    .required("El precio de compra es obligatorio"),
  precio_venta: yup
    .number()
    .typeError("Escribe el precio")
    .min(0, "No puede ser negativo")
    .required("El precio de venta es obligatorio"),
});

type ProductoFormValues = yup.InferType<typeof productoSchema>;

const valoresIniciales: ProductoFormValues = {
  nombre: "",
  descripcion: null,
  stock: 0,
  stock_minimo: 5,
  precio_compra: 0,
  precio_venta: 0,
};

interface Props {
  abierto: boolean;
  producto?: Producto | null;
  onCerrar: () => void;
}

const ProductoFormDialog = ({ abierto, producto, onCerrar }: Props) => {
  const theme = useTheme();
  const pantallaChica = useMediaQuery(theme.breakpoints.down("sm"));

  const esEdicion = !!producto;
  const crear = useCrearProducto();
  const actualizar = useActualizarProducto();
  const mutacion = esEdicion ? actualizar : crear;

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ProductoFormValues>({
    resolver: yupResolver(productoSchema),
    defaultValues: valoresIniciales,
  });

  useEffect(() => {
    if (!abierto) return;

    crear.reset();
    actualizar.reset();

    reset(
      producto
        ? {
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            stock: producto.stock,
            stock_minimo: producto.stock_minimo,
            precio_compra: producto.precio_compra,
            precio_venta: producto.precio_venta,
          }
        : valoresIniciales
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, producto, reset]);

  const onSubmit = handleSubmit((valores) => {
    const payload: ProductoPayload = valores;

    const alTerminar = {
      onSuccess: () => onCerrar(),
      onError: (error: unknown) => {
        const apiError = toApiError(error);
        if (apiError.errors) {
          Object.entries(apiError.errors).forEach(([campo, mensajes]) => {
            setError(campo as keyof ProductoFormValues, {
              message: mensajes[0],
            });
          });
        }
      },
    };

    if (esEdicion) {
      actualizar.mutate({ id: producto.id, payload }, alTerminar);
    } else {
      crear.mutate(payload, alTerminar);
    }
  });

  const errorGeneral = mutacion.isError ? toApiError(mutacion.error) : null;

  return (
    <Dialog
      open={abierto}
      onClose={mutacion.isPending ? undefined : onCerrar}
      fullWidth
      maxWidth="sm"
      fullScreen={pantallaChica}
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
            {esEdicion ? "Editar producto" : "Nuevo producto"}
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
                    error={!!errors.descripcion}
                    helperText={errors.descripcion?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <CustomFormLabel htmlFor="stock">Stock</CustomFormLabel>
              <Controller
                name="stock"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    id="stock"
                    type="number"
                    fullWidth
                    disabled={esEdicion}
                    error={!!errors.stock}
                    helperText={
                      esEdicion
                        ? "Se cambia con movimientos"
                        : errors.stock?.message
                    }
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <CustomFormLabel htmlFor="stock_minimo">Mínimo</CustomFormLabel>
              <Controller
                name="stock_minimo"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    id="stock_minimo"
                    type="number"
                    fullWidth
                    error={!!errors.stock_minimo}
                    helperText={errors.stock_minimo?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <CustomFormLabel htmlFor="precio_compra">Compra</CustomFormLabel>
              <Controller
                name="precio_compra"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    id="precio_compra"
                    type="number"
                    fullWidth
                    error={!!errors.precio_compra}
                    helperText={errors.precio_compra?.message}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">S/</InputAdornment>
                        ),
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <CustomFormLabel htmlFor="precio_venta">Venta</CustomFormLabel>
              <Controller
                name="precio_venta"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    id="precio_venta"
                    type="number"
                    fullWidth
                    error={!!errors.precio_venta}
                    helperText={errors.precio_venta?.message}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">S/</InputAdornment>
                        ),
                      },
                    }}
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
                  : "Agregar producto"}
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

export default ProductoFormDialog;
