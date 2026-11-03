"use client";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { IconHelpCircle } from "@tabler/icons-react";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import DashboardCard from "@/components/shared/DashboardCard";
import { formularioCompacto } from "@/components/shared/estilos-formulario";
import { useUsuarioActual } from "@/features/auth/hooks/useAuth";
import { inicialesDe, normalizarTelefono, PREFIJO_TELEFONO, soloDigitos } from "@/features/auth/types";
import type { Usuario } from "@/features/auth/services/auth.api";
import { toApiError } from "@/lib/api/client";

import { useActualizarPerfil } from "../hooks/usePerfil";
import {
  perfilSchema,
  type PerfilFormValues,
} from "../schemas/perfil.schema";

/** `+51987654321` → `987654321`: el campo pinta el prefijo aparte. */
const sinPrefijo = (telefono: string | null | undefined) =>
  telefono?.startsWith(PREFIJO_TELEFONO) ? telefono.slice(PREFIJO_TELEFONO.length) : (telefono ?? "");

const valoresDe = (usuario: Usuario): PerfilFormValues => ({
  nombre: usuario.nombre ?? "",
  apellido: usuario.apellido ?? "",
  telefono: sinPrefijo(usuario.telefono),
  documento: usuario.documento ?? "",
});

const DatosPersonales = () => {
  const { data: usuario, isPending, isError, error, refetch, isFetching } = useUsuarioActual();
  const guardar = useActualizarPerfil();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm<PerfilFormValues>({
    resolver: yupResolver(perfilSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      telefono: "",
      documento: "",
    },
  });

  useEffect(() => {
    if (usuario && !isDirty && !guardar.isPending) reset(valoresDe(usuario));
  }, [usuario, reset, isDirty, guardar.isPending]);

  const onSubmit = handleSubmit((valores) => {
    clearErrors("root");
    guardar.mutate(
      {
        nombre: valores.nombre,
        apellido: valores.apellido,
        telefono: valores.telefono ? normalizarTelefono(valores.telefono) : null,
        documento: valores.documento || null,
      },
      {
        onSuccess: (actualizado) => reset(valoresDe(actualizado)),
        onError: (error) => {
          const apiError = toApiError(error);
          const campos = Object.entries(apiError.errors ?? {});
          let necesitaMensajeGeneral = campos.length === 0;
          campos.forEach(([campo, mensajes]) => {
            if (Object.hasOwn(valores, campo) && mensajes[0]) {
              setError(campo as keyof PerfilFormValues, {
                message: mensajes[0],
              });
            } else necesitaMensajeGeneral = true;
          });
          if (necesitaMensajeGeneral) setError("root", { message: apiError.message });
        },
      },
    );
  });

  if (isPending) {
    return <Skeleton variant="rounded" height={420} />;
  }

  const errorLectura = isError ? (
    <Alert severity="error" sx={{ mb: 2 }} action={
      <Button color="inherit" disabled={isFetching} onClick={() => void refetch()}>Reintentar</Button>
    }>
      No se pudo cargar tu perfil. {toApiError(error).message}
    </Alert>
  ) : null;

  if (!usuario) return errorLectura;

  return (
    <DashboardCard
      title="Información personal"
      subtitle="Los datos de tu cuenta, no los de tu negocio"
    >
      <Box component="form" onSubmit={onSubmit} noValidate sx={formularioCompacto}>
        {errorLectura}
        {errors.root ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.root.message}
          </Alert>
        ) : null}

        <Grid container spacing={2}>
          <Grid size={12}>
            <Typography variant="subtitle2" mb={1}>
              Tu foto
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar src={usuario.avatar_url ?? undefined} alt={usuario.name} sx={{ width: 64, height: 64 }}>
                {inicialesDe(usuario.name)}
              </Avatar>
              <Typography variant="body2" color="textSecondary">
                Tu foto es de solo lectura por ahora. La subida de una nueva foto está pendiente; al guardar tus datos conservamos la actual.
              </Typography>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomFormLabel htmlFor="nombre" sx={{ mt: 0 }}>
              Nombres
            </CustomFormLabel>
            <Controller
              name="nombre"
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  id="nombre"
                  disabled={guardar.isPending}
                  fullWidth
                  error={!!errors.nombre}
                  helperText={errors.nombre?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomFormLabel htmlFor="apellido" sx={{ mt: 0 }}>
              Apellidos
            </CustomFormLabel>
            <Controller
              name="apellido"
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  id="apellido"
                  disabled={guardar.isPending}
                  fullWidth
                  error={!!errors.apellido}
                  helperText={errors.apellido?.message}
                />
              )}
            />
          </Grid>

          <Grid size={12}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <CustomFormLabel htmlFor="email">Email</CustomFormLabel>
              <Tooltip title="Es con lo que inicias sesión. Para cambiarlo escríbenos desde Soporte: hay que verificar el correo nuevo antes de activarlo.">
                <Box
                  component="span"
                  sx={{ display: "inline-flex", color: "text.secondary", mt: 1 }}
                >
                  <IconHelpCircle size={16} />
                </Box>
              </Tooltip>
            </Stack>
            {/* Deshabilitado a propósito: el email ES el login y es único
                global, así que cambiarlo obliga a repetir la verificación.
                Contrato § Autenticación. */}
            <CustomTextField
              id="email"
              value={usuario?.email ?? ""}
              fullWidth
              disabled
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
                  // Solo Perú por ahora: el prefijo es fijo y no se escribe.
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    field.onChange(soloDigitos(e.target.value).slice(0, 9))
                  }
                  id="telefono"
                  type="tel"
                  disabled={guardar.isPending}
                  fullWidth
                  placeholder="987654321"
                  error={!!errors.telefono}
                  helperText={errors.telefono?.message ?? "Opcional."}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">{PREFIJO_TELEFONO}</InputAdornment>
                      ),
                    },
                  }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomFormLabel htmlFor="documento">Documento</CustomFormLabel>
            <Controller
              name="documento"
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  id="documento"
                  disabled={guardar.isPending}
                  fullWidth
                  placeholder="Opcional"
                  error={!!errors.documento}
                  helperText={
                    errors.documento?.message ??
                    "Se usa para identificarte en los pagos."
                  }
                />
              )}
            />
          </Grid>
        </Grid>

        <Stack direction="row" spacing={1} mt={3}>
          <Button
            type="submit"
            variant="contained"
            disabled={guardar.isPending || !isDirty}
          >
            {guardar.isPending ? "Guardando…" : "Guardar cambios"}
          </Button>
          {isDirty ? (
            <Button color="inherit" onClick={() => reset(valoresDe(usuario))} disabled={guardar.isPending}>
              Descartar
            </Button>
          ) : null}
        </Stack>

        {/* Lo que NO se edita aquí, dicho antes de que lo busquen. */}
        <Typography variant="body2" color="textSecondary" mt={3}>
          ¿Buscas tu horario, tu cargo o tu biografía pública? Están en tu ficha
          de profesional, en Profesionales.
        </Typography>
      </Box>
    </DashboardCard>
  );
};

export default DatosPersonales;
