"use client";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";
import * as yup from "yup";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { IconMailCheck } from "@tabler/icons-react";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import { formularioCompacto } from "@/components/shared/estilos-formulario";
import { toApiError } from "@/lib/api/client";

import { useForgotPassword } from "../hooks/useAuth";

const esquema = yup.object({
  email: yup
    .string()
    .trim()
    .required("Ingresa tu email.")
    .email("El email no es válido."),
});

type Valores = yup.InferType<typeof esquema>;

/**
 * Pide el enlace de recuperación. Como `/email/reenviar`, el backend responde
 * **200 exista o no la cuenta**: el mensaje de éxito no confirma que el correo
 * esté registrado, y por eso no se dice "te enviamos" sino lo que manda el
 * backend.
 */
export default function AuthForgotPassword() {
  const forgot = useForgotPassword();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Valores>({
    resolver: yupResolver(esquema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit((valores) => {
    forgot.mutate(valores.email, {
      onError: (error) => {
        const apiError = toApiError(error);
        const mensaje = apiError.errors?.email?.[0];
        if (mensaje) setError("email", { message: mensaje });
      },
    });
  });

  if (forgot.isSuccess) {
    return (
      <Stack alignItems="center" textAlign="center" spacing={2} mt={3}>
        <Box color="success.main" display="flex">
          <IconMailCheck size={48} stroke={1.5} />
        </Box>
        <Typography variant="h5" fontWeight={700}>
          Revisa tu correo
        </Typography>
        <Typography color="textSecondary">{forgot.data.message}</Typography>
        <Button component={Link} href="/login" variant="contained" fullWidth>
          Volver al inicio de sesión
        </Button>
      </Stack>
    );
  }

  const errorGeneral = forgot.isError ? toApiError(forgot.error) : null;

  return (
    <Box component="form" onSubmit={onSubmit} noValidate sx={formularioCompacto}>
      {errorGeneral && !errorGeneral.errors ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errorGeneral.message}
        </Alert>
      ) : null}

      <Stack mt={2} spacing={2}>
        <Box>
          <CustomFormLabel htmlFor="reset-email" sx={{ mt: 0 }}>
            Email
          </CustomFormLabel>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                id="reset-email"
                type="email"
                fullWidth
                autoFocus
                placeholder="Ingresa tu email"
                error={!!errors.email}
                helperText={errors.email?.message}
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
          disabled={forgot.isPending}
        >
          {forgot.isPending ? "Enviando…" : "Enviarme el enlace"}
        </Button>
        <Button color="primary" size="large" fullWidth component={Link} href="/login">
          Volver al inicio de sesión
        </Button>
      </Stack>
    </Box>
  );
}
