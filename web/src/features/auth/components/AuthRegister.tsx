"use client";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";

import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import { toApiError } from "@/lib/api/client";
import { categoriasNegocioMock, CANTIDAD_PROFESIONALES, PAISES_TELEFONO } from "../mocks";
import { useRegistrarNegocio } from "../hooks/useAuth";
import {
  registroSchema,
  valoresInicialesRegistro,
  type RegistroFormValues,
} from "../schemas/registro.schema";
import PasswordStrength from "./PasswordStrength";
import type { registerType } from "@/types/auth/auth";

const OTROS_ID = categoriasNegocioMock.find((c) => c.slug === "otros")!.id;

/**
 * Mismo formulario que el modal `#modal-prueba` de `public/home.blade.php`:
 * categoría del negocio, cantidad de profesionales, datos del negocio, datos
 * del dueño, teléfono con código de país, contraseña con medidor de
 * fortaleza y aceptación de términos. Crea el negocio en modo prueba (10
 * días) y a su dueño en un solo paso.
 */
const AuthRegister = ({ subtitle }: registerType) => {
  const registrar = useRegistrarNegocio();

  const {
    control,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<RegistroFormValues>({
    resolver: yupResolver(registroSchema),
    defaultValues: valoresInicialesRegistro,
  });

  const categoriaId = watch("categoria_id");
  const password = watch("password");

  const onSubmit = handleSubmit((valores) => {
    registrar.mutate(
      {
        categoria_id: valores.categoria_id,
        categoria_otro_detalle: valores.categoria_otro_detalle || undefined,
        cantidad_profesionales: valores.cantidad_profesionales,
        nombre_negocio: valores.nombre_negocio,
        nombre: valores.nombre,
        apellido: valores.apellido,
        email: valores.email,
        telefono: `${valores.telefono_pais}${valores.telefono_numero}`,
        documento: valores.documento,
        usuario: valores.usuario,
        password: valores.password,
        terminos: valores.terminos,
      },
      {
        onError: (error) => {
          const apiError = toApiError(error);
          if (apiError.errors) {
            Object.entries(apiError.errors).forEach(([campo, mensajes]) => {
              setError(campo as keyof RegistroFormValues, { message: mensajes[0] });
            });
          }
        },
      }
    );
  });

  return (
    <Box component="form" onSubmit={onSubmit} noValidate>
      <Typography variant="h4" fontWeight={700} textAlign="center" mb={0.5}>
        ¡Simplifica tu vida con Mi SaaS!
      </Typography>
      <Typography variant="body2" color="textSecondary" textAlign="center" mb={2}>
        Prueba nuestra plataforma gratis por 10 días
      </Typography>

      {registrar.isError && !toApiError(registrar.error).errors ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {toApiError(registrar.error).message}
        </Alert>
      ) : null}

      <Grid container spacing={0}>
        <Grid size={12}>
          <CustomFormLabel htmlFor="categoria_id">¿Qué tipo de negocio tienes?</CustomFormLabel>
          <Controller
            name="categoria_id"
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                select
                id="categoria_id"
                fullWidth
                value={field.value || ""}
                error={!!errors.categoria_id}
                helperText={errors.categoria_id?.message}
              >
                <MenuItem value="" disabled>
                  Selecciona una categoría
                </MenuItem>
                {categoriasNegocioMock.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.nombre}
                  </MenuItem>
                ))}
              </CustomTextField>
            )}
          />
        </Grid>

        {categoriaId === OTROS_ID ? (
          <Grid size={12}>
            <CustomFormLabel htmlFor="categoria_otro_detalle">
              Cuéntanos de qué trata tu negocio
            </CustomFormLabel>
            <Controller
              name="categoria_otro_detalle"
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  id="categoria_otro_detalle"
                  fullWidth
                  multiline
                  rows={2}
                  error={!!errors.categoria_otro_detalle}
                  helperText={errors.categoria_otro_detalle?.message}
                />
              )}
            />
          </Grid>
        ) : null}

        <Grid size={12}>
          <CustomFormLabel htmlFor="cantidad_profesionales">
            ¿Cuántos profesionales atienden en tu negocio?
          </CustomFormLabel>
          <Controller
            name="cantidad_profesionales"
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                select
                id="cantidad_profesionales"
                fullWidth
                value={field.value || ""}
                error={!!errors.cantidad_profesionales}
                helperText={errors.cantidad_profesionales?.message}
              >
                <MenuItem value="" disabled>
                  Selecciona una opción
                </MenuItem>
                {CANTIDAD_PROFESIONALES.map((c) => (
                  <MenuItem key={c.value} value={c.value}>
                    {c.label}
                  </MenuItem>
                ))}
              </CustomTextField>
            )}
          />
        </Grid>

        <Grid size={12}>
          <CustomFormLabel htmlFor="nombre_negocio">Nombre del negocio</CustomFormLabel>
          <Controller
            name="nombre_negocio"
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                id="nombre_negocio"
                fullWidth
                error={!!errors.nombre_negocio}
                helperText={errors.nombre_negocio?.message}
              />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }} pr={{ sm: 1 }}>
          <CustomFormLabel htmlFor="nombre">Tu nombre</CustomFormLabel>
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
        <Grid size={{ xs: 12, sm: 6 }} pl={{ sm: 1 }}>
          <CustomFormLabel htmlFor="apellido">Apellido</CustomFormLabel>
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
          <CustomFormLabel htmlFor="email">Email</CustomFormLabel>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                id="email"
                type="email"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />
        </Grid>

        <Grid size={12}>
          <CustomFormLabel htmlFor="telefono_numero">Teléfono</CustomFormLabel>
          <Stack direction="row" spacing={1}>
            <Controller
              name="telefono_pais"
              control={control}
              render={({ field }) => (
                <CustomTextField {...field} select sx={{ minWidth: 110 }}>
                  {PAISES_TELEFONO.map((p) => (
                    <MenuItem key={p.code} value={p.code}>
                      {p.flag} {p.code}
                    </MenuItem>
                  ))}
                </CustomTextField>
              )}
            />
            <Controller
              name="telefono_numero"
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  id="telefono_numero"
                  fullWidth
                  placeholder="999 999 999"
                  error={!!errors.telefono_numero}
                  helperText={errors.telefono_numero?.message}
                />
              )}
            />
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }} pr={{ sm: 1 }}>
          <CustomFormLabel htmlFor="documento">Documento</CustomFormLabel>
          <Controller
            name="documento"
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                id="documento"
                fullWidth
                error={!!errors.documento}
                helperText={errors.documento?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }} pl={{ sm: 1 }}>
          <CustomFormLabel htmlFor="usuario">Usuario</CustomFormLabel>
          <Controller
            name="usuario"
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                id="usuario"
                fullWidth
                error={!!errors.usuario}
                helperText={errors.usuario?.message}
              />
            )}
          />
        </Grid>

        <Grid size={12}>
          <CustomFormLabel htmlFor="password">Contraseña</CustomFormLabel>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                id="password"
                type="password"
                fullWidth
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            )}
          />
          <PasswordStrength password={password} />
        </Grid>

        <Grid size={12}>
          <Controller
            name="terminos"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                sx={{ mt: 2, alignItems: "flex-start" }}
                control={
                  <Checkbox
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    sx={{ mt: -0.5 }}
                  />
                }
                label={
                  <Typography variant="body2" color="textSecondary">
                    Al crear tu cuenta, aceptas nuestros{" "}
                    <Link href="/terminos" target="_blank">
                      términos y condiciones
                    </Link>{" "}
                    y nuestra{" "}
                    <Link href="/privacidad" target="_blank">
                      política de privacidad
                    </Link>
                    .
                  </Typography>
                }
              />
            )}
          />
          {errors.terminos ? (
            <Typography variant="caption" color="error.main" display="block">
              {errors.terminos.message}
            </Typography>
          ) : null}
        </Grid>
      </Grid>

      <Button
        color="primary"
        variant="contained"
        size="large"
        fullWidth
        type="submit"
        disabled={registrar.isPending}
        sx={{ mt: 3 }}
      >
        {registrar.isPending ? "Creando cuenta…" : "Crear cuenta gratis"}
      </Button>
      {subtitle}
    </Box>
  );
};

export default AuthRegister;
