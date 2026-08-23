"use client";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "next/link";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import DashboardCard from "@/components/shared/DashboardCard";
import { formularioCompacto } from "@/components/shared/estilos-formulario";
import { toApiError } from "@/lib/api/client";

import { useCambiarPassword } from "../hooks/usePerfil";
import {
  passwordSchema,
  type PasswordFormValues,
} from "../schemas/perfil.schema";

const CAMPOS = [
  { name: "password_actual", label: "Contraseña actual" },
  { name: "password", label: "Nueva contraseña" },
  { name: "password_confirmation", label: "Confirmar nueva contraseña" },
] as const;

/**
 * Cambio de contraseña **con la sesión abierta**.
 *
 * Pide la actual a propósito: sin eso, cualquiera que se siente frente a una
 * sesión abierta se queda con la cuenta. El flujo por correo
 * (`/forgot-password`) es para quien **no puede entrar**, que es otro caso —
 * de ahí el enlace del final.
 */
const CambiarPassword = () => {
  const cambiar = useCambiarPassword();
  const [visibles, setVisibles] = useState<Record<string, boolean>>({});

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      password_actual: "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = handleSubmit((valores) => {
    cambiar.mutate(valores, {
      onSuccess: () =>
        reset({
          password_actual: "",
          password: "",
          password_confirmation: "",
        }),
      onError: (error) => {
        const apiError = toApiError(error);
        Object.entries(apiError.errors ?? {}).forEach(([campo, mensajes]) => {
          if (campo in valores) {
            setError(campo as keyof PasswordFormValues, {
              message: mensajes[0],
            });
          }
        });
      },
    });
  });

  const errorGeneral = cambiar.isError ? toApiError(cambiar.error) : null;

  return (
    <DashboardCard
      title="Cambiar contraseña"
      subtitle="Al cambiarla se cierran tus sesiones en otros dispositivos"
    >
      <Box component="form" onSubmit={onSubmit} noValidate sx={formularioCompacto}>
        {cambiar.isSuccess ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Contraseña actualizada.
          </Alert>
        ) : null}

        {errorGeneral && !errorGeneral.errors ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorGeneral.message}
          </Alert>
        ) : null}

        <Stack spacing={0}>
          {CAMPOS.map(({ name, label }, indice) => (
            <Box key={name}>
              <CustomFormLabel htmlFor={name} sx={indice === 0 ? { mt: 0 } : undefined}>
                {label}
              </CustomFormLabel>
              <Controller
                name={name}
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    id={name}
                    type={visibles[name] ? "text" : "password"}
                    fullWidth
                    autoComplete={
                      name === "password_actual"
                        ? "current-password"
                        : "new-password"
                    }
                    placeholder={
                      name === "password" ? "Mínimo 8 caracteres" : undefined
                    }
                    error={!!errors[name]}
                    helperText={errors[name]?.message}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              edge="end"
                              onClick={() =>
                                setVisibles((v) => ({ ...v, [name]: !v[name] }))
                              }
                              aria-label={
                                visibles[name]
                                  ? "Ocultar contraseña"
                                  : "Mostrar contraseña"
                              }
                            >
                              {visibles[name] ? (
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
          ))}
        </Stack>

        <Button
          type="submit"
          variant="contained"
          sx={{ mt: 3 }}
          disabled={cambiar.isPending}
        >
          {cambiar.isPending ? "Guardando…" : "Cambiar contraseña"}
        </Button>

        <Typography variant="body2" color="textSecondary" mt={3}>
          ¿No la recuerdas?{" "}
          <Typography
            component={Link}
            href="/forgot-password"
            variant="body2"
            sx={{ color: "primary.main", textDecoration: "none" }}
          >
            Recupérala por correo
          </Typography>
          .
        </Typography>
      </Box>
    </DashboardCard>
  );
};

export default CambiarPassword;
