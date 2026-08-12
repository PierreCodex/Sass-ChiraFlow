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
import { PRIORIDADES_TICKET } from "../constants";
import { useCrearTicket } from "../hooks/useTickets";
import type { PrioridadTicket, TicketPayload } from "../types";

/** Reglas de `SoporteController::store`. */
const ticketSchema = yup.object({
  asunto: yup
    .string()
    .trim()
    .max(150, "Máximo 150 caracteres")
    .required("El asunto es obligatorio"),
  prioridad: yup
    .string()
    .oneOf(["baja", "media", "alta"] as const)
    .required(),
  mensaje: yup
    .string()
    .trim()
    .max(5000, "Máximo 5000 caracteres")
    .required("Cuéntanos qué pasa"),
});

type TicketFormValues = yup.InferType<typeof ticketSchema>;

const valoresIniciales: TicketFormValues = {
  asunto: "",
  prioridad: "media",
  mensaje: "",
};

interface Props {
  abierto: boolean;
  onCerrar: () => void;
}

const TicketFormDialog = ({ abierto, onCerrar }: Props) => {
  const crear = useCrearTicket();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<TicketFormValues>({
    resolver: yupResolver(ticketSchema),
    defaultValues: valoresIniciales,
  });

  const mensaje = useWatch({ control, name: "mensaje" });

  useEffect(() => {
    if (!abierto) return;
    crear.reset();
    reset(valoresIniciales);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, reset]);

  const onSubmit = handleSubmit((valores) => {
    crear.mutate(valores as TicketPayload, {
      onSuccess: () => onCerrar(),
      onError: (error) => {
        const apiError = toApiError(error);
        if (apiError.errors) {
          Object.entries(apiError.errors).forEach(([campo, mensajes]) => {
            setError(campo as keyof TicketFormValues, { message: mensajes[0] });
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
    >
      <Box component="form" onSubmit={onSubmit} noValidate>
        <DialogTitle component="div">
          <Typography variant="h5" fontWeight={600}>
            Nuevo ticket
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Te respondemos por aquí mismo; verás la respuesta en la lista.
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
              <CustomFormLabel htmlFor="asunto">Asunto</CustomFormLabel>
              <Controller
                name="asunto"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    id="asunto"
                    fullWidth
                    autoFocus
                    placeholder="Resume el problema en una línea"
                    error={!!errors.asunto}
                    helperText={errors.asunto?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <CustomFormLabel htmlFor="prioridad">Prioridad</CustomFormLabel>
              <Controller
                name="prioridad"
                control={control}
                render={({ field }) => (
                  <CustomTextField {...field} select id="prioridad" fullWidth>
                    {(
                      Object.keys(PRIORIDADES_TICKET) as PrioridadTicket[]
                    ).map((valor) => (
                      <MenuItem key={valor} value={valor}>
                        {PRIORIDADES_TICKET[valor].label}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>

            <Grid size={12}>
              <CustomFormLabel htmlFor="mensaje">Mensaje</CustomFormLabel>
              <Controller
                name="mensaje"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    id="mensaje"
                    fullWidth
                    multiline
                    rows={5}
                    placeholder="Qué esperabas que pasara, qué pasó y desde cuándo."
                    error={!!errors.mensaje}
                    helperText={
                      errors.mensaje?.message ??
                      `${(mensaje ?? "").length} / 5000`
                    }
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3 }}>
          <Stack direction="row" spacing={1}>
            <Button type="submit" variant="contained" disabled={crear.isPending}>
              {crear.isPending ? "Enviando…" : "Enviar ticket"}
            </Button>
            <Button onClick={onCerrar} color="inherit" disabled={crear.isPending}>
              Cancelar
            </Button>
          </Stack>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default TicketFormDialog;
