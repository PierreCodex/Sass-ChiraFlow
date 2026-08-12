"use client";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import Alert from "@mui/material/Alert";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";

import BlankCard from "@/components/shared/BlankCard";
import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import CampoImagenes from "@/components/shared/CampoImagenes";
import { formularioCompacto } from "@/components/shared/estilos-formulario";
import { toApiError } from "@/lib/api/client";
import { useConfiguracion, useGuardarConfiguracion } from "../hooks/useConfiguracion";
import {
  CAMPOS_POR_PESTANA,
  configuracionSchema,
  type ConfiguracionFormValues,
} from "../schemas/configuracion.schema";
import type { Configuracion } from "../types";

const PESTANAS = ["Negocio", "Agenda", "Marca", "Sitio público"];

/** Campo de color con la misma pinta que en el resto de formularios. */
const CampoColor = ({ id, value, onChange }: any) => (
  <Box
    component="input"
    type="color"
    id={id}
    value={value ?? "#7c3aed"}
    onChange={onChange}
    sx={{
      width: "100%",
      height: 41,
      p: 0.5,
      cursor: "pointer",
      borderRadius: 1,
      border: "1px solid",
      borderColor: "divider",
      bgcolor: "background.paper",
    }}
  />
);

const ConfiguracionForm = () => {
  const [pestana, setPestana] = useState(0);
  const { data: configuracion, isPending, error } = useConfiguracion();
  const guardar = useGuardarConfiguracion();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<ConfiguracionFormValues>({
    resolver: yupResolver(configuracionSchema),
  });

  const modoIntervalo = useWatch({ control, name: "modo_intervalo" });

  const pestanasConError = useMemo(() => {
    const conError = new Set<number>();
    Object.entries(CAMPOS_POR_PESTANA).forEach(([indice, campos]) => {
      if (campos.some((campo) => campo in errors)) conError.add(Number(indice));
    });
    return conError;
  }, [errors]);

  // Los valores llegan por red: hay que rellenar el formulario al recibirlos.
  useEffect(() => {
    if (!configuracion) return;
    reset({
      ...configuracion,
      logo: configuracion.logo_url ? [{ url: configuracion.logo_url }] : [],
      cover: configuracion.cover_url ? [{ url: configuracion.cover_url }] : [],
      modo_intervalo: configuracion.agenda.modo_intervalo,
      intervalo_min: configuracion.agenda.intervalo_min,
    });
  }, [configuracion, reset]);

  const onSubmit = handleSubmit(
    (valores) => {
      const payload: Configuracion = {
        ...configuracion!,
        ...valores,
        logo_url: valores.logo[0]?.url ?? null,
        cover_url: valores.cover[0]?.url ?? null,
        agenda: {
          modo_intervalo: valores.modo_intervalo,
          intervalo_min: valores.intervalo_min,
        },
      };

      guardar.mutate(payload, {
        onError: (err) => {
          const apiError = toApiError(err);
          if (apiError.errors) {
            Object.entries(apiError.errors).forEach(([campo, mensajes]) => {
              setError(campo as keyof ConfiguracionFormValues, {
                message: mensajes[0],
              });
            });
          }
        },
      });
    },
    (erroresValidacion) => {
      const primera = Object.entries(CAMPOS_POR_PESTANA).find(([, campos]) =>
        campos.some((campo) => campo in erroresValidacion)
      );
      if (primera) setPestana(Number(primera[0]));
    }
  );

  if (isPending) {
    return <Skeleton variant="rounded" height={520} />;
  }

  if (error) {
    return <Alert severity="error">{toApiError(error).message}</Alert>;
  }

  const errorGeneral = guardar.isError ? toApiError(guardar.error) : null;

  return (
    <BlankCard>
      <Box component="form" onSubmit={onSubmit} noValidate>
        <Box px={3} pt={1}>
          <Tabs
            value={pestana}
            onChange={(_, valor) => setPestana(valor)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ "& .MuiTab-root": { textTransform: "none" } }}
          >
            {PESTANAS.map((titulo, indice) => (
              <Tab
                key={titulo}
                label={
                  <Badge
                    color="error"
                    variant="dot"
                    invisible={!pestanasConError.has(indice)}
                    sx={{ "& .MuiBadge-badge": { right: -8, top: 2 } }}
                  >
                    {titulo}
                  </Badge>
                }
              />
            ))}
          </Tabs>
        </Box>

        <Divider />

        <CardContent sx={{ ...formularioCompacto, p: 3, minHeight: 420 }}>
          {guardar.isSuccess && !isDirty ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              Configuración guardada.
            </Alert>
          ) : null}

          {errorGeneral && !errorGeneral.errors ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorGeneral.message}
            </Alert>
          ) : null}

          {/* ------------------------------------------------ Negocio */}
          <Box hidden={pestana !== 0}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <CustomFormLabel htmlFor="nombre">Nombre del negocio</CustomFormLabel>
                <Controller
                  name="nombre"
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      value={field.value ?? ""}
                      id="nombre"
                      fullWidth
                      error={!!errors.nombre}
                      helperText={errors.nombre?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomFormLabel htmlFor="zona_horaria">Zona horaria</CustomFormLabel>
                <Controller
                  name="zona_horaria"
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      value={field.value ?? ""}
                      id="zona_horaria"
                      fullWidth
                      placeholder="America/Lima"
                      error={!!errors.zona_horaria}
                      helperText={errors.zona_horaria?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={12}>
                <CustomFormLabel htmlFor="descripcion">Descripción</CustomFormLabel>
                <Controller
                  name="descripcion"
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      value={field.value ?? ""}
                      id="descripcion"
                      fullWidth
                      multiline
                      rows={3}
                      error={!!errors.descripcion}
                      helperText={
                        errors.descripcion?.message ??
                        "Se muestra en la página pública de reservas."
                      }
                    />
                  )}
                />
              </Grid>

              {[
                { name: "email", label: "Email", type: "email" },
                { name: "telefono", label: "Teléfono" },
                { name: "whatsapp", label: "WhatsApp" },
                { name: "direccion", label: "Dirección" },
              ].map((campo) => (
                <Grid key={campo.name} size={{ xs: 12, sm: 6 }}>
                  <CustomFormLabel htmlFor={campo.name}>
                    {campo.label}
                  </CustomFormLabel>
                  <Controller
                    name={campo.name as keyof ConfiguracionFormValues}
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        value={(field.value as string) ?? ""}
                        id={campo.name}
                        type={campo.type}
                        fullWidth
                        error={!!errors[campo.name as keyof typeof errors]}
                        helperText={
                          errors[campo.name as keyof typeof errors]?.message as string
                        }
                      />
                    )}
                  />
                </Grid>
              ))}

              <Grid size={12}>
                <CustomFormLabel htmlFor="informacion_adicional">
                  Información adicional
                </CustomFormLabel>
                <Controller
                  name="informacion_adicional"
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      value={field.value ?? ""}
                      id="informacion_adicional"
                      fullWidth
                      error={!!errors.informacion_adicional}
                      helperText={errors.informacion_adicional?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomFormLabel htmlFor="latitud">Latitud</CustomFormLabel>
                <Controller
                  name="latitud"
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      value={field.value ?? ""}
                      id="latitud"
                      type="number"
                      fullWidth
                      error={!!errors.latitud}
                      helperText={errors.latitud?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomFormLabel htmlFor="longitud">Longitud</CustomFormLabel>
                <Controller
                  name="longitud"
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      value={field.value ?? ""}
                      id="longitud"
                      type="number"
                      fullWidth
                      error={!!errors.longitud}
                      helperText={errors.longitud?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          {/* ------------------------------------------------ Agenda */}
          <Box hidden={pestana !== 1}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Horario de atención
            </Typography>
            <Typography variant="body2" color="textSecondary" mb={2}>
              Se aplica a los profesionales que no tienen horario propio.
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomFormLabel htmlFor="horario_apertura">Apertura</CustomFormLabel>
                <Controller
                  name="horario_apertura"
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      value={field.value ?? ""}
                      id="horario_apertura"
                      type="time"
                      fullWidth
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomFormLabel htmlFor="horario_cierre">Cierre</CustomFormLabel>
                <Controller
                  name="horario_cierre"
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      value={field.value ?? ""}
                      id="horario_cierre"
                      type="time"
                      fullWidth
                      error={!!errors.horario_cierre}
                      helperText={errors.horario_cierre?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight={600} mb={2}>
              Huecos de reserva
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomFormLabel htmlFor="modo_intervalo">
                  Cada cuánto se ofrece un turno
                </CustomFormLabel>
                <Controller
                  name="modo_intervalo"
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      value={field.value ?? "duracion_servicio"}
                      select
                      id="modo_intervalo"
                      fullWidth
                    >
                      <MenuItem value="duracion_servicio">
                        Según la duración del servicio
                      </MenuItem>
                      <MenuItem value="fijo">Cada N minutos</MenuItem>
                    </CustomTextField>
                  )}
                />
              </Grid>

              {modoIntervalo === "fijo" ? (
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CustomFormLabel htmlFor="intervalo_min">
                    Intervalo (min)
                  </CustomFormLabel>
                  <Controller
                    name="intervalo_min"
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        value={field.value ?? 15}
                        id="intervalo_min"
                        type="number"
                        fullWidth
                        error={!!errors.intervalo_min}
                        helperText={errors.intervalo_min?.message}
                      />
                    )}
                  />
                </Grid>
              ) : null}

              <Grid size={12}>
                <Alert severity="info" variant="outlined">
                  {modoIntervalo === "fijo"
                    ? "Rejilla fija: más opciones para el cliente, pero puede dejar huecos que nadie llene."
                    : "Los turnos se encadenan con la duración de cada servicio, para no dejar huecos muertos."}
                </Alert>
              </Grid>
            </Grid>
          </Box>

          {/* ------------------------------------------------ Marca */}
          <Box hidden={pestana !== 2}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomFormLabel htmlFor="logo">Logo</CustomFormLabel>
                <Controller
                  name="logo"
                  control={control}
                  render={({ field }) => (
                    <CampoImagenes
                      valor={field.value ?? []}
                      onChange={field.onChange}
                      max={1}
                      ayuda="Máx. 2 MB. Admite SVG."
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomFormLabel htmlFor="cover">Portada</CustomFormLabel>
                <Controller
                  name="cover"
                  control={control}
                  render={({ field }) => (
                    <CampoImagenes
                      valor={field.value ?? []}
                      onChange={field.onChange}
                      max={1}
                      ayuda="Máx. 4 MB. Cabecera de la página pública."
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomFormLabel htmlFor="color_primario">
                  Color primario
                </CustomFormLabel>
                <Controller
                  name="color_primario"
                  control={control}
                  render={({ field }) => (
                    <CampoColor
                      id="color_primario"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomFormLabel htmlFor="color_secundario">
                  Color secundario
                </CustomFormLabel>
                <Controller
                  name="color_secundario"
                  control={control}
                  render={({ field }) => (
                    <CampoColor
                      id="color_secundario"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </Grid>

              <Grid size={12}>
                <Alert severity="info" variant="outlined">
                  Estos colores se usan en la página pública de reservas, no en
                  este panel.
                </Alert>
              </Grid>
            </Grid>
          </Box>

          {/* ------------------------------------------------ Sitio público */}
          <Box hidden={pestana !== 3}>
            <Stack spacing={1} mb={2}>
              <Controller
                name="sitio_publico_activo"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!!field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Página pública de reservas activa"
                  />
                )}
              />

              <Controller
                name="mostrar_en_marketplace"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!!field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label="Aparecer en el marketplace"
                  />
                )}
              />
            </Stack>

            <CustomFormLabel htmlFor="terminos_servicio">
              Términos del servicio
            </CustomFormLabel>
            <Controller
              name="terminos_servicio"
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  value={field.value ?? ""}
                  id="terminos_servicio"
                  fullWidth
                  multiline
                  rows={6}
                  error={!!errors.terminos_servicio}
                  helperText={errors.terminos_servicio?.message}
                />
              )}
            />
          </Box>
        </CardContent>

        <Divider />

        <Box sx={{ p: 3 }}>
          <Button type="submit" variant="contained" disabled={guardar.isPending}>
            {guardar.isPending ? "Guardando…" : "Guardar cambios"}
          </Button>
        </Box>
      </Box>
    </BlankCard>
  );
};

export default ConfiguracionForm;
