"use client";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import * as yup from "yup";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

import CustomCheckbox from "@/components/forms/theme-elements/CustomCheckbox";
import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import { formularioCompacto } from "@/components/shared/estilos-formulario";
import { toApiError } from "@/lib/api/client";
import { loginType } from "@/types/auth/auth";

import { authKeys, useLogin } from "../hooks/useAuth";
import ReenviarVerificacion from "./ReenviarVerificacion";

/**
 * Validación de conveniencia: ahorra un viaje, no decide nada. La que manda
 * es la del backend, y sus errores se pintan tal como lleguen.
 */
const esquema = yup.object({
  email: yup
    .string()
    .trim()
    .required("Ingresa tu email.")
    .email("El email no es válido."),
  password: yup.string().required("Ingresa tu contraseña."),
  remember: yup.boolean().default(true),
});

type Valores = yup.InferType<typeof esquema>;

/** Fallos que no son de validación y merecen su propio texto. */
const MENSAJES_POR_ESTADO: Record<number, string> = {
  429: "Demasiados intentos. Espera un minuto antes de volver a probar.",
  502: "El servicio no está disponible ahora mismo. Inténtalo en unos minutos.",
  0: "No se pudo conectar. Revisa tu conexión e inténtalo otra vez.",
};

const AuthLogin = ({ title, subtitle, subtext }: loginType) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [verPassword, setVerPassword] = useState(false);

  const login = useLogin();

  const {
    control,
    handleSubmit,
    setError,
    watch,
    formState: { errors },
  } = useForm<Valores>({
    resolver: yupResolver(esquema),
    defaultValues: { email: "", password: "", remember: true },
  });

  const onSubmit = handleSubmit((valores) => {
    login.mutate(valores, {
      onSuccess: (usuario) => {
        // La cookie ya está puesta por el BFF; el panel puede leer al usuario
        // sin pedirlo otra vez.
        queryClient.setQueryData(authKeys.usuario, usuario);
        router.push("/");
        router.refresh();
      },
      onError: (error) => {
        const apiError = toApiError(error);
        // Las credenciales incorrectas llegan como `errors.email`, no como
        // mensaje global: el backend las trata como un fallo de validación.
        Object.entries(apiError.errors ?? {}).forEach(([campo, mensajes]) => {
          if (campo !== "email" && campo !== "password") return;
          setError(campo, { message: mensajes[0] });
        });
      },
    });
  });

  const apiError = login.isError ? toApiError(login.error) : null;
  // El 403 es "correo sin verificar": no es un error del formulario, es un
  // paso que falta, así que se ofrece el reenvío en vez de un texto seco.
  const sinVerificar = apiError?.status === 403;
  const mensajeGeneral =
    apiError && !apiError.errors && !sinVerificar
      ? (MENSAJES_POR_ESTADO[apiError.status] ?? apiError.message)
      : null;

  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h3" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}

      <Box component="form" onSubmit={onSubmit} noValidate sx={formularioCompacto}>
        {mensajeGeneral ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {mensajeGeneral}
          </Alert>
        ) : null}

        {sinVerificar ? (
          <Stack spacing={2} mb={2}>
            <Alert severity="warning">{apiError.message}</Alert>
            <ReenviarVerificacion
              email={watch("email").trim()}
              textoBoton="Reenviarme el enlace de verificación"
            />
          </Stack>
        ) : null}

        <Stack>
          <Box>
            <CustomFormLabel htmlFor="email" sx={{ mt: 0 }}>
              Email
            </CustomFormLabel>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  id="email"
                  type="email"
                  variant="outlined"
                  fullWidth
                  autoFocus
                  autoComplete="email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />
          </Box>

          <Box>
            <CustomFormLabel htmlFor="password">Contraseña</CustomFormLabel>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  id="password"
                  type={verPassword ? "text" : "password"}
                  variant="outlined"
                  fullWidth
                  autoComplete="current-password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
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

          <Stack
            justifyContent="space-between"
            direction="row"
            alignItems="center"
            my={2}
          >
            <FormGroup>
              <Controller
                name="remember"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <CustomCheckbox
                        {...field}
                        checked={field.value}
                        // El BFF lo usa para darle 30 días a la cookie.
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Recordarme"
                  />
                )}
              />
            </FormGroup>
            <Typography
              component={Link}
              href="/forgot-password"
              fontWeight="500"
              sx={{
                textDecoration: "none",
                color: "primary.main",
              }}
            >
              ¿Olvidaste tu contraseña?
            </Typography>
          </Stack>
        </Stack>

        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          type="submit"
          // Sin esto un doble clic crea dos tokens en Sanctum.
          disabled={login.isPending}
        >
          {login.isPending ? "Entrando…" : "Iniciar sesión"}
        </Button>
      </Box>

      {subtitle}
    </>
  );
};

export default AuthLogin;
