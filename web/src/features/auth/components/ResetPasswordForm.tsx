"use client";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { IconCircleCheck, IconEye, IconEyeOff } from "@tabler/icons-react";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import { formularioCompacto } from "@/components/shared/estilos-formulario";
import { toApiError } from "@/lib/api/client";

import { useResetPassword } from "../hooks/useAuth";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "../schemas/reset-password.schema";

/**
 * Landing del correo de recuperación: `/reset-password?token=…&email=…`.
 *
 * El token y el email viajan en la URL y no se editan: el usuario solo elige
 * la contraseña nueva. Un token vencido o ya usado vuelve como 422 con
 * `errors.email`, que se pinta arriba porque ese campo no está en pantalla.
 */
const ResetPasswordForm = () => {
  const searchParams = useSearchParams();
  const [verPassword, setVerPassword] = useState(false);

  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const reset = useResetPassword();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: { password: "", password_confirmation: "" },
  });

  const onSubmit = handleSubmit((valores) => {
    reset.mutate(
      {
        token,
        email,
        password: valores.password,
        password_confirmation: valores.password_confirmation,
      },
      {
        onError: (error) => {
          const apiError = toApiError(error);
          // `email` y `token` no tienen control en pantalla: van al Alert.
          Object.entries(apiError.errors ?? {}).forEach(([campo, mensajes]) => {
            if (campo === "email" || campo === "token") return;
            setError(campo as keyof ResetPasswordFormValues, {
              message: mensajes[0],
            });
          });
        },
      }
    );
  });

  if (!token || !email) {
    return (
      <Stack spacing={2} py={2} textAlign="center">
        <Typography variant="h4" fontWeight={700}>
          Enlace no válido
        </Typography>
        <Alert severity="warning" sx={{ textAlign: "left" }}>
          Este enlace está incompleto. Ábrelo desde el correo o pide uno nuevo.
        </Alert>
        <Button component={Link} href="/forgot-password" variant="contained">
          Pedir un enlace nuevo
        </Button>
      </Stack>
    );
  }

  if (reset.isSuccess) {
    return (
      <Stack alignItems="center" textAlign="center" spacing={2} py={2}>
        <Box color="success.main" display="flex">
          <IconCircleCheck size={48} stroke={1.5} />
        </Box>
        <Typography variant="h4" fontWeight={700}>
          Contraseña actualizada
        </Typography>
        <Typography color="textSecondary">{reset.data.message}</Typography>
        <Button
          component={Link}
          href="/login"
          variant="contained"
          size="large"
          fullWidth
        >
          Iniciar sesión
        </Button>
      </Stack>
    );
  }

  const errorGeneral = reset.isError ? toApiError(reset.error) : null;
  // El backend manda el motivo del token vencido en `errors.email`.
  const motivo = errorGeneral?.errors?.email?.[0] ?? errorGeneral?.message;

  return (
    <>
      <Typography variant="h4" fontWeight={700} mb={0.5}>
        Nueva contraseña
      </Typography>
      <Typography color="textSecondary" mb={2}>
        Elige una contraseña nueva para <strong>{email}</strong>.
      </Typography>

      <Box
        component="form"
        onSubmit={onSubmit}
        noValidate
        sx={formularioCompacto}
      >
        {motivo ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {motivo}
          </Alert>
        ) : null}

        <Box>
          <CustomFormLabel htmlFor="password" sx={{ mt: 0 }}>
            Contraseña
          </CustomFormLabel>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                id="password"
                type={verPassword ? "text" : "password"}
                fullWidth
                autoFocus
                error={!!errors.password}
                helperText={errors.password?.message ?? "Mínimo 8 caracteres."}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setVerPassword((v) => !v)}
                          edge="end"
                          aria-label={
                            verPassword
                              ? "Ocultar contraseña"
                              : "Mostrar contraseña"
                          }
                        >
                          {verPassword ? (
                            <IconEyeOff size={20} />
                          ) : (
                            <IconEye size={20} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}
          />
        </Box>

        <Box>
          <CustomFormLabel htmlFor="password_confirmation">
            Repite la contraseña
          </CustomFormLabel>
          <Controller
            name="password_confirmation"
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                id="password_confirmation"
                type={verPassword ? "text" : "password"}
                fullWidth
                error={!!errors.password_confirmation}
                helperText={errors.password_confirmation?.message}
              />
            )}
          />
        </Box>

        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          type="submit"
          disabled={reset.isPending}
          sx={{ mt: 3 }}
        >
          {reset.isPending ? "Guardando…" : "Guardar contraseña"}
        </Button>

        <Stack direction="row" spacing={1} mt={3} justifyContent="center">
          <Typography color="textSecondary" variant="h6" fontWeight="400">
            ¿Recordaste tu contraseña?
          </Typography>
          <Typography
            component={Link}
            href="/login"
            fontWeight="500"
            sx={{ textDecoration: "none", color: "primary.main" }}
          >
            Inicia sesión
          </Typography>
        </Stack>
      </Box>
    </>
  );
};

export default ResetPasswordForm;
