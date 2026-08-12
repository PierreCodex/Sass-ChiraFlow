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
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import { formularioCompacto } from "@/components/shared/estilos-formulario";
import { toApiError } from "@/lib/api/client";
import { formatMoneda } from "@/lib/format";
import { useRegistrarMovimientoCaja } from "../hooks/useCaja";
import { saldoEsperado, type CajaSesion } from "../types";

/** Reglas de `CajaController::movimiento`. */
const movimientoSchema = yup.object({
  tipo: yup.string().oneOf(["ingreso", "egreso"] as const).required(),
  monto: yup
    .number()
    .typeError("Escribe el monto")
    .min(0.01, "Debe ser mayor que 0")
    .required("El monto es obligatorio"),
  concepto: yup
    .string()
    .trim()
    .max(150, "Máximo 150 caracteres")
    .required("El concepto es obligatorio"),
});

type MovimientoFormValues = yup.InferType<typeof movimientoSchema>;

interface Props {
  abierto: boolean;
  sesion: CajaSesion;
  onCerrar: () => void;
}

const MovimientoCajaDialog = ({ abierto, sesion, onCerrar }: Props) => {
  const registrar = useRegistrarMovimientoCaja();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<MovimientoFormValues>({
    resolver: yupResolver(movimientoSchema),
    defaultValues: { tipo: "ingreso", monto: 0, concepto: "" },
  });

  const tipo = useWatch({ control, name: "tipo" });
  const monto = useWatch({ control, name: "monto" });

  useEffect(() => {
    if (!abierto) return;
    registrar.reset();
    reset({ tipo: "ingreso", monto: 0, concepto: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, reset]);

  const onSubmit = handleSubmit((valores) => {
    registrar.mutate(valores, {
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
    });
  });

  // El input numérico devuelve string: yup solo castea al enviar.
  const montoNum = Number(monto);
  const delta = Number.isFinite(montoNum)
    ? tipo === "ingreso"
      ? montoNum
      : -montoNum
    : 0;
  const esperadoTras = saldoEsperado(sesion) + delta;

  const errorGeneral = registrar.isError ? toApiError(registrar.error) : null;

  return (
    <Dialog
      open={abierto}
      onClose={registrar.isPending ? undefined : onCerrar}
      fullWidth
      maxWidth="xs"
    >
      <Box component="form" onSubmit={onSubmit} noValidate>
        <DialogTitle component="div">
          <Typography variant="h5" fontWeight={600}>
            Nuevo movimiento
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Caja del día · esperado {formatMoneda(saldoEsperado(sesion))}
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
                    <MenuItem value="ingreso">Ingreso</MenuItem>
                    <MenuItem value="egreso">Egreso</MenuItem>
                  </CustomTextField>
                )}
              />
            </Grid>

            <Grid size={5}>
              <CustomFormLabel htmlFor="monto">Monto</CustomFormLabel>
              <Controller
                name="monto"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    id="monto"
                    type="number"
                    fullWidth
                    error={!!errors.monto}
                    helperText={errors.monto?.message}
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

            <Grid size={12}>
              <CustomFormLabel htmlFor="concepto">Concepto</CustomFormLabel>
              <Controller
                name="concepto"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    id="concepto"
                    fullWidth
                    placeholder="Cobro de servicio, compra de insumos…"
                    error={!!errors.concepto}
                    helperText={errors.concepto?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={12}>
              <Alert
                severity={esperadoTras < 0 ? "warning" : "info"}
                variant="outlined"
              >
                {esperadoTras < 0
                  ? `Este egreso deja la caja en ${formatMoneda(esperadoTras)}. Revisa el monto.`
                  : `El saldo esperado quedará en ${formatMoneda(esperadoTras)}.`}
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3 }}>
          <Stack direction="row" spacing={1}>
            <Button
              type="submit"
              variant="contained"
              disabled={registrar.isPending}
            >
              {registrar.isPending ? "Registrando…" : "Registrar"}
            </Button>
            <Button
              onClick={onCerrar}
              color="inherit"
              disabled={registrar.isPending}
            >
              Cancelar
            </Button>
          </Stack>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default MovimientoCajaDialog;
