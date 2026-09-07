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

import { useAceptarInvitacion } from "../hooks/useAuth";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "../schemas/reset-password.schema";

/**
 * Landing del correo de invitación: `/invitacion?token=…&email=…`.
 *
 * Es la puerta por la que entra todo el que no se registró él mismo. Cuando
 * alguien da de alta a una persona en el panel, **nadie escribe su
 * contraseña**: la cuenta nace con una aleatoria que no conoce ni quien la
 * creó, y a la persona le llega este enlace para que elija la suya.
 *
 * Se parece al de recuperación y se comporta casi igual, pero **el destino es
 * otro**: `POST /invitacion/aceptar`. Ver `authApi.aceptarInvitacion` — son
 * brokers distintos y cruzarlos rechaza tokens buenos.
 *
 * Lo que cambia de cara al usuario es el callejón sin salida: quien pierde un
 * enlace de recuperación se pide otro solo, y aquí no. La invitación la manda
 * quien reparte los accesos, así que un enlace vencido se resuelve pidiéndole
 * a esa persona que le dé al botón de reenviar; ofrecer «pide uno nuevo» sería
 * mandarlo a un formulario que no le va a servir.
 */
const AceptarInvitacionForm = () => {
  const searchParams = useSearchParams();
  const [verPassword, setVerPassword] = useState(false);

  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const aceptar = useAceptarInvitacion();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    // El mismo esquema que el reset: es la misma credencial y su suelo no
    // puede depender de por dónde se cree (8 caracteres, confirmada).
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: { password: "", password_confirmation: "" },
  });

  const onSubmit = handleSubmit((valores) => {
    aceptar.mutate(
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
          Este enlace está incompleto. Ábrelo desde el correo que te enviaron, o
          pídele a quien te dio el acceso que te lo reenvíe.
        </Alert>
        <Button component={Link} href="/login" variant="contained">
          Ir a iniciar sesión
        </Button>
      </Stack>
    );
  }

  if (aceptar.isSuccess) {
    return (
      <Stack alignItems="center" textAlign="center" spacing={2} py={2}>
        <Box color="success.main" display="flex">
          <IconCircleCheck size={48} stroke={1.5} />
        </Box>
        <Typography variant="h4" fontWeight={700}>
          Ya tienes tu contraseña
        </Typography>
        <Typography color="textSecondary">{aceptar.data.message}</Typography>
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

  const errorGeneral = aceptar.isError ? toApiError(aceptar.error) : null;
  // El backend manda el motivo del token vencido o ya usado en `errors.email`.
  const motivo = errorGeneral?.errors?.email?.[0] ?? errorGeneral?.message;

  return (
    <>
      <Typography variant="h4" fontWeight={700} mb={0.5}>
        Crea tu contraseña
      </Typography>
      <Typography color="textSecondary" mb={2}>
        Te dieron acceso al panel con el correo <strong>{email}</strong>. Elige
        una contraseña y ya puedes entrar.
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
          disabled={aceptar.isPending}
          sx={{ mt: 3 }}
        >
          {aceptar.isPending ? "Guardando…" : "Crear mi contraseña"}
        </Button>

        <Stack direction="row" spacing={1} mt={3} justifyContent="center">
          <Typography color="textSecondary" variant="h6" fontWeight="400">
            ¿Ya la habías creado?
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

export default AceptarInvitacionForm;
