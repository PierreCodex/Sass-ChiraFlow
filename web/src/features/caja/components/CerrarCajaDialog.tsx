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
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import { formularioCompacto } from "@/components/shared/estilos-formulario";
import { toApiError } from "@/lib/api/client";
import { formatMoneda } from "@/lib/format";
import { useCerrarCaja } from "../hooks/useCaja";
import { saldoEsperado, type CajaSesion } from "../types";

/** Regla de `CajaController::cerrar`. */
const cerrarSchema = yup.object({
  monto_final: yup
    .number()
    .typeError("Escribe el monto contado")
    .min(0, "No puede ser negativo")
    .required("El monto contado es obligatorio"),
});

type CerrarFormValues = yup.InferType<typeof cerrarSchema>;

// El campo arranca vacío a propósito: el usuario tiene que contar el cajón,
// no confirmar una cifra que le damos hecha.
const VACIO = "" as unknown as number;

interface Props {
  abierto: boolean;
  sesion: CajaSesion;
  onCerrar: () => void;
}

const CerrarCajaDialog = ({ abierto, sesion, onCerrar }: Props) => {
  const cerrar = useCerrarCaja();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CerrarFormValues>({
    resolver: yupResolver(cerrarSchema),
    defaultValues: { monto_final: VACIO },
  });

  const montoFinal = useWatch({ control, name: "monto_final" });

  useEffect(() => {
    if (!abierto) return;
    cerrar.reset();
    reset({ monto_final: VACIO });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, reset]);

  const onSubmit = handleSubmit((valores) => {
    cerrar.mutate(valores, {
      onSuccess: () => onCerrar(),
      onError: (error) => {
        const apiError = toApiError(error);
        if (apiError.errors?.monto_final) {
          setError("monto_final", { message: apiError.errors.monto_final[0] });
        }
      },
    });
  });

  const esperado = saldoEsperado(sesion);
  const contado = Number(montoFinal);
  // Solo hay arqueo que mostrar cuando el usuario ya escribió algo.
  const hayConteo =
    montoFinal !== VACIO && String(montoFinal) !== "" && Number.isFinite(contado);
  const diferencia = hayConteo ? contado - esperado : null;

  const errorGeneral = cerrar.isError ? toApiError(cerrar.error) : null;

  return (
    <Dialog
      open={abierto}
      onClose={cerrar.isPending ? undefined : onCerrar}
      fullWidth
      maxWidth="xs"
    >
      <Box component="form" onSubmit={onSubmit} noValidate>
        <DialogTitle component="div">
          <Typography variant="h5" fontWeight={600}>
            Cerrar caja
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Cuenta el efectivo del cajón y anota cuánto hay.
          </Typography>
        </DialogTitle>

        <Divider />

        <DialogContent sx={formularioCompacto}>
          {errorGeneral && !errorGeneral.errors ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorGeneral.message}
            </Alert>
          ) : null}

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <Typography variant="body2" color="textSecondary">
              Saldo esperado
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {formatMoneda(esperado)}
            </Typography>
          </Stack>

          <CustomFormLabel htmlFor="monto_final">
            Monto final contado
          </CustomFormLabel>
          <Controller
            name="monto_final"
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                value={field.value ?? ""}
                id="monto_final"
                type="number"
                fullWidth
                autoFocus
                error={!!errors.monto_final}
                helperText={errors.monto_final?.message}
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

          {diferencia !== null ? (
            <Alert
              severity={diferencia === 0 ? "success" : "warning"}
              variant="outlined"
              sx={{ mt: 2 }}
            >
              {diferencia === 0
                ? "El conteo cuadra con el saldo esperado."
                : diferencia > 0
                  ? `Sobran ${formatMoneda(diferencia)} respecto a lo esperado.`
                  : `Faltan ${formatMoneda(Math.abs(diferencia))} respecto a lo esperado.`}
            </Alert>
          ) : null}

          <Typography
            variant="caption"
            color="textSecondary"
            display="block"
            sx={{ mt: 2 }}
          >
            Al cerrar ya no se pueden registrar más movimientos del día.
          </Typography>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3 }}>
          <Stack direction="row" spacing={1}>
            <Button
              type="submit"
              variant="contained"
              color="error"
              disabled={cerrar.isPending}
            >
              {cerrar.isPending ? "Cerrando…" : "Cerrar caja"}
            </Button>
            <Button onClick={onCerrar} color="inherit" disabled={cerrar.isPending}>
              Cancelar
            </Button>
          </Stack>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default CerrarCajaDialog;
