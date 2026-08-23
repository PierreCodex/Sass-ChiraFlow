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
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import {
  dialogoResponsive,
  formularioCompacto,
} from "@/components/shared/estilos-formulario";
import { env } from "@/config/env";
import { toApiError } from "@/lib/api/client";

import { useFijarNombre } from "../hooks/useOnboarding";
import { previsualizarSlug } from "../slug";

const esquema = yup.object({
  nombre: yup
    .string()
    .trim()
    .required("Escribe el nombre de tu negocio.")
    .max(150, "Máximo 150 caracteres."),
});

type Valores = yup.InferType<typeof esquema>;

/** Cómo se verá el enlace: por subdominio si hay dominio, si no por ruta. */
function enlaceDeTienda(slug: string) {
  return env.appDomain ? `${slug}.${env.appDomain}` : `/reservar/${slug}`;
}

interface Props {
  abierto: boolean;
  onCerrar: () => void;
}

/**
 * Paso 1 del checklist. Va en diálogo y no dentro del drawer porque es la
 * decisión más irreversible del producto —fija el subdominio de la tienda para
 * siempre— y merece la vista previa del enlace y el aviso a tamaño legible.
 */
const NombreNegocioDialog = ({ abierto, onCerrar }: Props) => {
  const fijar = useFijarNombre();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors },
  } = useForm<Valores>({
    resolver: yupResolver(esquema),
    defaultValues: { nombre: "" },
  });

  useEffect(() => {
    if (!abierto) return;
    fijar.reset();
    reset({ nombre: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, reset]);

  const slug = previsualizarSlug(watch("nombre"));

  const onSubmit = handleSubmit((valores) => {
    fijar.mutate(valores.nombre, {
      onSuccess: () => onCerrar(),
      onError: (error) => {
        const apiError = toApiError(error);
        if (apiError.errors?.nombre) {
          setError("nombre", { message: apiError.errors.nombre[0] });
        }
      },
    });
  });

  const errorGeneral = fijar.isError ? toApiError(fijar.error) : null;

  return (
    <Dialog
      sx={dialogoResponsive}
      open={abierto}
      onClose={fijar.isPending ? undefined : onCerrar}
      fullWidth
      maxWidth="sm"
    >
      <Box component="form" onSubmit={onSubmit} noValidate>
        <DialogTitle component="div">
          <Typography variant="h5" fontWeight={600}>
            Ponle nombre a tu negocio
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Es el nombre que verán tus clientes, y define el enlace de tu
            tienda.
          </Typography>
        </DialogTitle>

        <Divider />

        <DialogContent sx={formularioCompacto}>
          {errorGeneral && !errorGeneral.errors ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorGeneral.message}
            </Alert>
          ) : null}

          <CustomFormLabel htmlFor="nombre" sx={{ mt: 0 }}>
            Nombre del negocio
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
                placeholder="Barbería El Cairo"
                error={!!errors.nombre}
                helperText={errors.nombre?.message}
              />
            )}
          />

          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 1,
              bgcolor: "grey.100",
              minHeight: 64,
            }}
          >
            <Typography variant="subtitle2" color="textSecondary">
              El enlace de tu tienda será
            </Typography>
            <Typography
              variant="h6"
              fontWeight={600}
              color={slug ? "primary.main" : "textSecondary"}
              sx={{ wordBreak: "break-all" }}
            >
              {slug ? enlaceDeTienda(slug) : "…escribe el nombre"}
            </Typography>
          </Box>

          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>El enlace no se podrá cambiar.</strong> Tus clientes lo van
            a guardar y compartir, así que elige el nombre con el que quieres
            que te conozcan.
          </Alert>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3 }}>
          <Stack direction="row" spacing={1}>
            <Button type="submit" variant="contained" disabled={fijar.isPending}>
              {fijar.isPending ? "Guardando…" : "Guardar nombre"}
            </Button>
            <Button
              onClick={onCerrar}
              color="inherit"
              disabled={fijar.isPending}
            >
              Cancelar
            </Button>
          </Stack>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default NombreNegocioDialog;
