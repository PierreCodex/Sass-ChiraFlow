"use client";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { IconHelpCircle } from "@tabler/icons-react";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import CampoImagenes from "@/components/shared/CampoImagenes";
import DashboardCard from "@/components/shared/DashboardCard";
import { formularioCompacto } from "@/components/shared/estilos-formulario";
import { useUsuarioActual } from "@/features/auth/hooks/useAuth";
import { separarNombre } from "@/features/auth/types";
import { toApiError } from "@/lib/api/client";

import { useActualizarPerfil } from "../hooks/usePerfil";
import {
  perfilSchema,
  type PerfilFormValues,
} from "../schemas/perfil.schema";

const DatosPersonales = () => {
  const { data: usuario, isPending } = useUsuarioActual();
  const guardar = useActualizarPerfil();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<PerfilFormValues>({
    resolver: yupResolver(perfilSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      telefono: "",
      documento: "",
      foto: [],
    },
  });

  useEffect(() => {
    if (!usuario) return;
    // `nombre`/`apellido` sueltos cuando el backend los mande; mientras tanto
    // se parten de `name`, igual que hace el registro al revés.
    const partido = separarNombre(usuario.name ?? "");
    reset({
      nombre: usuario.nombre ?? partido.nombre,
      apellido: usuario.apellido ?? partido.apellido,
      telefono: usuario.telefono ?? "",
      documento: usuario.documento ?? "",
      foto: usuario.avatar_url ? [{ url: usuario.avatar_url }] : [],
    });
  }, [usuario, reset]);

  const onSubmit = handleSubmit((valores) => {
    guardar.mutate(
      {
        nombre: valores.nombre,
        apellido: valores.apellido,
        telefono: valores.telefono || null,
        documento: valores.documento || null,
        foto: valores.foto[0]?.url ?? null,
      },
      {
        onSuccess: () => reset(valores),
        onError: (error) => {
          const apiError = toApiError(error);
          Object.entries(apiError.errors ?? {}).forEach(([campo, mensajes]) => {
            if (campo in valores) {
              setError(campo as keyof PerfilFormValues, {
                message: mensajes[0],
              });
            }
          });
        },
      },
    );
  });

  const errorGeneral = guardar.isError ? toApiError(guardar.error) : null;

  if (isPending) {
    return <Skeleton variant="rounded" height={420} />;
  }

  return (
    <DashboardCard
      title="Información personal"
      subtitle="Los datos de tu cuenta, no los de tu negocio"
    >
      <Box component="form" onSubmit={onSubmit} noValidate sx={formularioCompacto}>
        {guardar.isSuccess && !isDirty ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Datos guardados.
          </Alert>
        ) : null}

        {errorGeneral && !errorGeneral.errors ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorGeneral.message}
          </Alert>
        ) : null}

        <Grid container spacing={2}>
          <Grid size={12}>
            <CustomFormLabel htmlFor="foto" sx={{ mt: 0 }}>
              Tu foto
            </CustomFormLabel>
            <Controller
              name="foto"
              control={control}
              render={({ field }) => (
                <CampoImagenes
                  valor={field.value ?? []}
                  onChange={field.onChange}
                  max={1}
                  ayuda="Se ve en el panel y, si atiendes, en tu ficha pública."
                />
              )}
            />
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
                  id="telefono"
                  fullWidth
                  error={!!errors.telefono}
                  helperText={errors.telefono?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomFormLabel htmlFor="documento">DNI</CustomFormLabel>
            <Controller
              name="documento"
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  id="documento"
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
            <Button color="inherit" onClick={() => reset()} disabled={guardar.isPending}>
              Descartar
            </Button>
          ) : null}
        </Stack>

        {/* Lo que NO se edita aquí, dicho antes de que lo busquen. */}
        <Typography variant="body2" color="textSecondary" mt={3}>
          ¿Buscas tu horario, tu cargo o tu biografía pública? Están en tu ficha
          de profesional, en Empleados.
        </Typography>
      </Box>
    </DashboardCard>
  );
};

export default DatosPersonales;
