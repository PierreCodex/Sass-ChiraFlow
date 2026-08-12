"use client";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
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
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import { formularioCompacto } from "@/components/shared/estilos-formulario";
import { toApiError } from "@/lib/api/client";
import { useRegistrarMovimiento } from "../hooks/useProductos";
import type { MovimientoPayload, Producto } from "../types";

/** Reglas de `InventarioController::movimiento`. */
const movimientoSchema = yup.object({
  tipo: yup.string().oneOf(["entrada", "salida"] as const).required(),
  cantidad: yup
    .number()
    .typeError("Escribe una cantidad")
    .integer("Debe ser entero")
    .min(1, "Mínimo 1")
    .required("La cantidad es obligatoria"),
  motivo: yup
    .string()
    .trim()
    .transform((valor) => (valor === "" ? null : valor))
    .max(255, "Máximo 255 caracteres")
    .nullable()
    .defined(),
});

type MovimientoFormValues = yup.InferType<typeof movimientoSchema>;

interface Props {
  producto: Producto | null;
  onCerrar: () => void;
}

const MovimientoDialog = ({ producto, onCerrar }: Props) => {
  const registrar = useRegistrarMovimiento();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<MovimientoFormValues>({
    resolver: yupResolver(movimientoSchema),
    defaultValues: { tipo: "entrada", cantidad: 1, motivo: null },
  });

  const tipo = useWatch({ control, name: "tipo" });
  const cantidad = useWatch({ control, name: "cantidad" });

  useEffect(() => {
    if (!producto) return;
    registrar.reset();
    reset({ tipo: "entrada", cantidad: 1, motivo: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [producto, reset]);

  const onSubmit = handleSubmit((valores) => {
    if (!producto) return;

    registrar.mutate(
      { productoId: producto.id, payload: valores as MovimientoPayload },
      {
        onSuccess: () => onCerrar(),
        onError: (error) => {
          const apiError = toApiError(error);
          if (apiError.errors) {
            Object.entries(apiError.errors).forEach(([campo, mensajes]) => {
              setError(campo as keyof MovimientoFormValues, {
                message: mensajes[0],
              });
            });
          }
        },
      }
    );
  });

  // Vista previa del stock resultante, para evitar sorpresas.
  // `cantidad` llega como string desde el input: yup solo la convierte al
  // enviar, así que aquí hay que hacerlo a mano.
  const cantidadNum = Number(cantidad);
  const stockResultante =
    producto && Number.isFinite(cantidadNum)
      ? producto.stock + (tipo === "entrada" ? cantidadNum : -cantidadNum)
      : producto?.stock ?? 0;

  const dejaNegativo = stockResultante < 0;
  const errorGeneral = registrar.isError ? toApiError(registrar.error) : null;

  return (
    <Dialog
      open={!!producto}
      onClose={registrar.isPending ? undefined : onCerrar}
      fullWidth
      maxWidth="xs"
    >
      <Box component="form" onSubmit={onSubmit} noValidate>
        <DialogTitle component="div">
          <Typography variant="h5" fontWeight={600}>
            Movimiento de stock
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {producto?.nombre} · stock actual {producto?.stock}
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
            <Grid size={7}>
              <CustomFormLabel htmlFor="tipo">Tipo</CustomFormLabel>
              <Controller
                name="tipo"
                control={control}
                render={({ field }) => (
                  <CustomTextField {...field} select id="tipo" fullWidth>
                    <MenuItem value="entrada">Entrada</MenuItem>
                    <MenuItem value="salida">Salida</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>

            <Grid size={5}>
              <CustomFormLabel htmlFor="cantidad">Cantidad</CustomFormLabel>
              <Controller
                name="cantidad"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    id="cantidad"
                    type="number"
                    fullWidth
                    error={!!errors.cantidad}
                    helperText={errors.cantidad?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={12}>
              <CustomFormLabel htmlFor="motivo">Motivo</CustomFormLabel>
              <Controller
                name="motivo"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    value={field.value ?? ""}
                    id="motivo"
                    fullWidth
                    placeholder="Compra a proveedor, merma, ajuste…"
                    error={!!errors.motivo}
                    helperText={errors.motivo?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={12}>
              <Alert severity={dejaNegativo ? "warning" : "info"} variant="outlined">
                {dejaNegativo
                  ? `La salida supera el stock disponible. Quedaría en 0.`
                  : `El stock quedará en ${stockResultante}.`}
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3 }}>
          <Stack direction="row" spacing={1}>
            <Button type="submit" variant="contained" disabled={registrar.isPending}>
              {registrar.isPending ? "Registrando…" : "Registrar"}
            </Button>
            <Button onClick={onCerrar} color="inherit" disabled={registrar.isPending}>
              Cancelar
            </Button>
          </Stack>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default MovimientoDialog;
