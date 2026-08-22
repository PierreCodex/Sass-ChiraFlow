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
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import {
  IconEye,
  IconEyeOff,
  IconHelpCircle,
  IconMailCheck,
} from "@tabler/icons-react";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import { formularioCompacto } from "@/components/shared/estilos-formulario";
import { toApiError } from "@/lib/api/client";
import { registerType } from "@/types/auth/auth";

import { useCategoriasNegocio, useRegistro } from "../hooks/useAuth";
import ReenviarVerificacion from "./ReenviarVerificacion";
import {
  registroSchema,
  valoresIniciales,
  type RegistroFormValues,
} from "../schemas/registro.schema";
import {
  normalizarTelefono,
  PREFIJO_TELEFONO,
  RANGOS_PROFESIONALES,
  separarNombre,
  soloDigitos,
} from "../types";

/** Campos del backend que no tienen control propio en pantalla. */
const CAMPOS_DEL_NOMBRE = ["nombre", "apellido"];

const AuthRegister = ({ title, subtitle, subtext }: registerType) => {
  const [verPassword, setVerPassword] = useState(false);

  const { data: categorias = [], isError: fallanCategorias } =
    useCategoriasNegocio();
  const registro = useRegistro();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegistroFormValues>({
    resolver: yupResolver(registroSchema),
    defaultValues: valoresIniciales,
  });

  const onSubmit = handleSubmit((valores) => {
    const { nombre, apellido } = separarNombre(valores.nombre_completo);

    registro.mutate(
      {
        tipo_negocio_id: valores.tipo_negocio_id,
        rango_profesionales: valores.rango_profesionales,
        nombre,
        apellido,
        email: valores.email,
        telefono: normalizarTelefono(valores.telefono),
        password: valores.password,
        // El formulario no pide confirmación (la referencia tampoco la tiene),
        // pero el backend valida `confirmed`.
        password_confirmation: valores.password,
      },
      {
        onError: (error) => {
          const apiError = toApiError(error);
          if (!apiError.errors) return;

          Object.entries(apiError.errors).forEach(([campo, mensajes]) => {
            // `nombre` y `apellido` salen de un único campo en pantalla.
            const destino = CAMPOS_DEL_NOMBRE.includes(campo)
              ? "nombre_completo"
              : (campo as keyof RegistroFormValues);
            setError(destino, { message: mensajes[0] });
          });
        },
      }
    );
  });

  const errorGeneral = registro.isError ? toApiError(registro.error) : null;

  // Registrado: el alta no abre sesión, así que el siguiente paso es el correo.
  if (registro.isSuccess) {
    const email = registro.data.email;

    return (
      <Stack alignItems="center" textAlign="center" spacing={2} py={2}>
        <Box color="success.main" display="flex">
          <IconMailCheck size={48} stroke={1.5} />
        </Box>
        <Typography variant="h4" fontWeight={700}>
          Revisa tu correo
        </Typography>
        <Typography color="textSecondary">
          Te enviamos un enlace a <strong>{email}</strong> para verificar tu
          cuenta. Ábrelo y podrás entrar a tu panel.
        </Typography>

        <ReenviarVerificacion email={email} />
        <Typography
          component={Link}
          href="/login"
          fontWeight={500}
          sx={{ textDecoration: "none", color: "primary.main" }}
        >
          Ir a iniciar sesión
        </Typography>
      </Stack>
    );
  }

  return (
    <>
      {title ? (
        <Typography fontWeight="700" variant="h3" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}

      <Box component="form" onSubmit={onSubmit} noValidate sx={formularioCompacto}>
        {errorGeneral && !errorGeneral.errors ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorGeneral.message}
          </Alert>
        ) : null}

        {fallanCategorias ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            No pudimos cargar los tipos de negocio. Recarga la página.
          </Alert>
        ) : null}

        <Stack>
          <Box>
            <CustomFormLabel htmlFor="tipo_negocio_id" sx={{ mt: 0 }}>
              ¿Qué tipo de negocio tienes?
            </CustomFormLabel>
            <Controller
              name="tipo_negocio_id"
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  value={field.value ?? ""}
                  select
                  id="tipo_negocio_id"
                  fullWidth
                  error={!!errors.tipo_negocio_id}
                  helperText={errors.tipo_negocio_id?.message}
                  slotProps={{ select: { displayEmpty: true } }}
                >
                  <MenuItem value="" disabled>
                    Selecciona tu rubro
                  </MenuItem>
                  {categorias.map((categoria) => (
                    <MenuItem key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </MenuItem>
                  ))}
                </CustomTextField>
              )}
            />
          </Box>

          <Box>
            <CustomFormLabel htmlFor="rango_profesionales">
              {/* Inline y no un Stack: si la etiqueta parte en dos líneas, el
                  icono tiene que quedarse pegado a la última palabra. */}
              ¿Cuántos profesionales atienden en tu negocio?{" "}
              <Tooltip title="Nos sirve para preparar tu agenda. Podrás agregar o quitar profesionales cuando quieras.">
                <Box
                  component="span"
                  sx={{
                    display: "inline-flex",
                    verticalAlign: "text-bottom",
                    color: "text.secondary",
                  }}
                >
                  <IconHelpCircle size={16} />
                </Box>
              </Tooltip>
            </CustomFormLabel>
            <Controller
              name="rango_profesionales"
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  select
                  id="rango_profesionales"
                  fullWidth
                  error={!!errors.rango_profesionales}
                  helperText={errors.rango_profesionales?.message}
                  slotProps={{ select: { displayEmpty: true } }}
                >
                  <MenuItem value="" disabled>
                    Selecciona una opción
                  </MenuItem>
                  {RANGOS_PROFESIONALES.map((rango) => (
                    <MenuItem key={rango.valor} value={rango.valor}>
                      {rango.etiqueta}
                    </MenuItem>
                  ))}
                </CustomTextField>
              )}
            />
          </Box>

          <Box>
            <CustomFormLabel htmlFor="nombre_completo">
              Nombre y apellido
            </CustomFormLabel>
            <Controller
              name="nombre_completo"
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  id="nombre_completo"
                  fullWidth
                  placeholder="Ingresa tu nombre y apellido"
                  error={!!errors.nombre_completo}
                  helperText={errors.nombre_completo?.message}
                />
              )}
            />
          </Box>

          <Box>
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
                  placeholder="Ingresa tu email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />
          </Box>

          <Box>
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
                  fullWidth
                  placeholder="987654321"
                  error={!!errors.telefono}
                  helperText={errors.telefono?.message}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          {PREFIJO_TELEFONO}
                        </InputAdornment>
                      ),
                    },
                  }}
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
                  fullWidth
                  placeholder="Crea tu contraseña"
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
        </Stack>

        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          type="submit"
          disabled={registro.isPending}
          sx={{ mt: 3 }}
        >
          {registro.isPending ? "Creando tu cuenta…" : "Crear cuenta gratis"}
        </Button>

        <Typography
          variant="body2"
          color="textSecondary"
          textAlign="center"
          mt={1.5}
        >
          Al crear tu cuenta, aceptas nuestros{" "}
          <Typography
            component={Link}
            href="/terminos"
            variant="body2"
            sx={{ textDecoration: "none", color: "primary.main" }}
          >
            términos y condiciones
          </Typography>
        </Typography>
      </Box>

      {subtitle}
    </>
  );
};

export default AuthRegister;
