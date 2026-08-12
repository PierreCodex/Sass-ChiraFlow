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
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import { formularioCompacto } from "@/components/shared/estilos-formulario";
import { toApiError } from "@/lib/api/client";
import { useAbrirCaja } from "../hooks/useCaja";

/** Regla de `CajaController::abrir`. */
const abrirSchema = yup.object({
  monto_inicial: yup
    .number()
    .typeError("Escribe el monto")
    .min(0, "No puede ser negativo")
    .required("El monto inicial es obligatorio"),
});

type AbrirFormValues = yup.InferType<typeof abrirSchema>;

interface Props {
  abierto: boolean;
  onCerrar: () => void;
}

const AbrirCajaDialog = ({ abierto, onCerrar }: Props) => {
  const abrir = useAbrirCaja();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<AbrirFormValues>({
    resolver: yupResolver(abrirSchema),
    defaultValues: { monto_inicial: 0 },
  });

  useEffect(() => {
    if (!abierto) return;
    abrir.reset();
    reset({ monto_inicial: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, reset]);

  const onSubmit = handleSubmit((valores) => {
    abrir.mutate(valores, {
      onSuccess: () => onCerrar(),
      onError: (error) => {
        const apiError = toApiError(error);
        if (apiError.errors?.monto_inicial) {
          setError("monto_inicial", {
            message: apiError.errors.monto_inicial[0],
          });
        }
      },
    });
  });

  const errorGeneral = abrir.isError ? toApiError(abrir.error) : null;

  return (
    <Dialog
      open={abierto}
      onClose={abrir.isPending ? undefined : onCerrar}
      fullWidth
      maxWidth="xs"
    >
      <Box component="form" onSubmit={onSubmit} noValidate>
        <DialogTitle component="div">
          <Typography variant="h5" fontWeight={600}>
            Abrir caja
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Cuenta el efectivo con el que empiezas el día.
          </Typography>
        </DialogTitle>

        <Divider />

        <DialogContent sx={formularioCompacto}>
          {errorGeneral && !errorGeneral.errors ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorGeneral.message}
            </Alert>
          ) : null}

          <CustomFormLabel htmlFor="monto_inicial">
            Monto inicial
          </CustomFormLabel>
          <Controller
            name="monto_inicial"
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                id="monto_inicial"
                type="number"
                fullWidth
                autoFocus
                error={!!errors.monto_inicial}
                helperText={errors.monto_inicial?.message}
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
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3 }}>
          <Stack direction="row" spacing={1}>
            <Button type="submit" variant="contained" disabled={abrir.isPending}>
              {abrir.isPending ? "Abriendo…" : "Abrir caja"}
            </Button>
            <Button onClick={onCerrar} color="inherit" disabled={abrir.isPending}>
              Cancelar
            </Button>
          </Stack>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default AbrirCajaDialog;
