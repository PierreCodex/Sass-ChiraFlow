"use client";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import Alert from "@mui/material/Alert";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import CampoImagenes from "@/components/shared/CampoImagenes";
import { toApiError } from "@/lib/api/client";
import {
  PAGO_INCLUYE_COMISION,
  PAGO_INCLUYE_SUELDO,
  PERIODOS_PAGO,
  ROLES_EMPLEADO,
  TIPOS_PAGO,
  horarioPorDefecto,
} from "../constants";
import { useActualizarEmpleado, useCrearEmpleado } from "../hooks/useEmpleados";
import {
  CAMPOS_POR_PESTANA,
  crearEmpleadoSchema,
  valoresIniciales,
  type EmpleadoFormValues,
} from "../schemas/empleado.schema";
import type { Empleado, EmpleadoPayload } from "../types";
import HorarioTab from "./HorarioTab";

interface Props {
  abierto: boolean;
  empleado?: Empleado | null;
  onCerrar: () => void;
}

const PESTANAS = ["Datos", "Pago", "Horario"];

const EmpleadoFormDialog = ({ abierto, empleado, onCerrar }: Props) => {
  const theme = useTheme();
  const pantallaChica = useMediaQuery(theme.breakpoints.down("sm"));
  const [pestana, setPestana] = useState(0);

  const esEdicion = !!empleado;
  const crear = useCrearEmpleado();
  const actualizar = useActualizarEmpleado();
  const mutacion = esEdicion ? actualizar : crear;

  const schema = useMemo(() => crearEmpleadoSchema(esEdicion), [esEdicion]);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<EmpleadoFormValues>({
    resolver: yupResolver(schema),
    defaultValues: valoresIniciales,
  });

  const tipoPago = useWatch({ control, name: "tipo_pago" });
  const muestraComision = PAGO_INCLUYE_COMISION.includes(tipoPago);
  const muestraSueldo = PAGO_INCLUYE_SUELDO.includes(tipoPago);

  /** Pestañas que tienen algún error, para marcarlas con un punto. */
  const pestanasConError = useMemo(() => {
    const conError = new Set<number>();
    Object.entries(CAMPOS_POR_PESTANA).forEach(([indice, campos]) => {
      if (campos.some((campo) => campo in errors)) conError.add(Number(indice));
    });
    return conError;
  }, [errors]);

  useEffect(() => {
    if (!abierto) return;

    crear.reset();
    actualizar.reset();
    setPestana(0);

    reset(
      empleado
        ? {
            nombre: empleado.nombre,
            foto: empleado.foto_url ? [{ url: empleado.foto_url }] : [],
            usuario: empleado.usuario,
            password: "",
            email: empleado.email,
            telefono: empleado.telefono,
            rol: empleado.rol,
            cargo: empleado.cargo,
            activo: empleado.activo,
            tipo_pago: empleado.tipo_pago,
            comision_porcentaje: empleado.comision_porcentaje,
            monto_sueldo: empleado.monto_sueldo,
            periodo_pago: empleado.periodo_pago,
            horario: empleado.horario?.length
              ? empleado.horario
              : horarioPorDefecto(),
            excepciones: empleado.excepciones ?? [],
          }
        : valoresIniciales
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, empleado, reset]);

  const onSubmit = handleSubmit(
    (valores) => {
      const payload: EmpleadoPayload = {
        nombre: valores.nombre,
        foto: valores.foto[0]?.file ?? null,
        usuario: valores.usuario,
        // En edición, vacía significa "no cambiar la contraseña".
        password: valores.password || null,
        email: valores.email,
        telefono: valores.telefono,
        rol: valores.rol,
        cargo: valores.cargo,
        activo: valores.activo,
        tipo_pago: valores.tipo_pago,
        comision_porcentaje: valores.comision_porcentaje,
        // Solo se envían si el tipo de pago los usa.
        monto_sueldo: muestraSueldo ? valores.monto_sueldo : null,
        periodo_pago: muestraSueldo ? valores.periodo_pago : null,
        horario: valores.horario as EmpleadoPayload["horario"],
        excepciones: valores.excepciones as EmpleadoPayload["excepciones"],
      };

      const alTerminar = {
        onSuccess: () => onCerrar(),
        onError: (error: unknown) => {
          const apiError = toApiError(error);
          if (apiError.errors) {
            Object.entries(apiError.errors).forEach(([campo, mensajes]) => {
              setError(campo as keyof EmpleadoFormValues, {
                message: mensajes[0],
              });
            });
          }
        },
      };

      if (esEdicion) {
        actualizar.mutate({ id: empleado.id, payload }, alTerminar);
      } else {
        crear.mutate(payload, alTerminar);
      }
    },
    (erroresValidacion) => {
      // Saltar a la primera pestaña con errores, para que no queden ocultos.
      const primera = Object.entries(CAMPOS_POR_PESTANA).find(([, campos]) =>
        campos.some((campo) => campo in erroresValidacion)
      );
      if (primera) setPestana(Number(primera[0]));
    }
  );

  const errorGeneral = mutacion.isError ? toApiError(mutacion.error) : null;

  return (
    <Dialog
      open={abierto}
      onClose={mutacion.isPending ? undefined : onCerrar}
      fullWidth
      maxWidth="md"
      fullScreen={pantallaChica}
    >
      <Box
        component="form"
        onSubmit={onSubmit}
        noValidate
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <DialogTitle component="div" sx={{ pb: 0 }}>
          <Typography variant="h5" fontWeight={600}>
            {esEdicion ? "Editar empleado" : "Nuevo empleado"}
          </Typography>

          <Tabs
            value={pestana}
            onChange={(_, valor) => setPestana(valor)}
            sx={{ mt: 1 }}
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
        </DialogTitle>

        <Divider />

        <DialogContent>
          {errorGeneral && !errorGeneral.errors ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorGeneral.message}
            </Alert>
          ) : null}

          {/* ---------------------------------------------- Datos */}
          <Box hidden={pestana !== 0}>
            <Grid container spacing={2}>
              <Grid size={12}>
                <CustomFormLabel htmlFor="nombre" sx={{ mt: 0 }}>
                  Nombre
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

              <Grid size={12}>
                <CustomFormLabel htmlFor="foto">
                  Foto del profesional
                </CustomFormLabel>
                <Controller
                  name="foto"
                  control={control}
                  render={({ field }) => (
                    <CampoImagenes
                      valor={field.value}
                      onChange={field.onChange}
                      max={1}
                      textoBoton="Elegir foto"
                      ayuda="Haz clic para seleccionar una foto desde tu computadora."
                      error={errors.foto?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomFormLabel htmlFor="usuario">Usuario</CustomFormLabel>
                <Controller
                  name="usuario"
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      id="usuario"
                      fullWidth
                      autoComplete="off"
                      error={!!errors.usuario}
                      helperText={errors.usuario?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomFormLabel htmlFor="password">Contraseña</CustomFormLabel>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      value={field.value ?? ""}
                      id="password"
                      type="password"
                      fullWidth
                      autoComplete="new-password"
                      placeholder={
                        esEdicion ? "Dejar vacío para no cambiarla" : ""
                      }
                      error={!!errors.password}
                      helperText={errors.password?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomFormLabel htmlFor="email">Email</CustomFormLabel>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      value={field.value ?? ""}
                      id="email"
                      type="email"
                      fullWidth
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
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
                      value={field.value ?? ""}
                      id="telefono"
                      fullWidth
                      error={!!errors.telefono}
                      helperText={errors.telefono?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomFormLabel htmlFor="rol">Rol</CustomFormLabel>
                <Controller
                  name="rol"
                  control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} select id="rol" fullWidth>
                      {Object.entries(ROLES_EMPLEADO).map(([valor, label]) => (
                        <MenuItem key={valor} value={valor}>
                          {label}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomFormLabel htmlFor="cargo">Cargo</CustomFormLabel>
                <Controller
                  name="cargo"
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      value={field.value ?? ""}
                      id="cargo"
                      fullWidth
                    />
                  )}
                />
              </Grid>

              <Grid size={12}>
                <Controller
                  name="activo"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      }
                      label="Activo"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>

          {/* ---------------------------------------------- Pago */}
          <Box hidden={pestana !== 1}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Pago / comisión
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomFormLabel htmlFor="tipo_pago" sx={{ mt: 0 }}>
                  Tipo de pago
                </CustomFormLabel>
                <Controller
                  name="tipo_pago"
                  control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} select id="tipo_pago" fullWidth>
                      {Object.entries(TIPOS_PAGO).map(([valor, label]) => (
                        <MenuItem key={valor} value={valor}>
                          {label}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
              </Grid>

              {muestraComision ? (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomFormLabel htmlFor="comision_porcentaje" sx={{ mt: 0 }}>
                    % comisión
                  </CustomFormLabel>
                  <Controller
                    name="comision_porcentaje"
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        id="comision_porcentaje"
                        type="number"
                        fullWidth
                        error={!!errors.comision_porcentaje}
                        helperText={errors.comision_porcentaje?.message}
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">%</InputAdornment>
                            ),
                          },
                        }}
                      />
                    )}
                  />
                </Grid>
              ) : null}

              {muestraSueldo ? (
                <>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="monto_sueldo">
                      Monto sueldo
                    </CustomFormLabel>
                    <Controller
                      name="monto_sueldo"
                      control={control}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          value={field.value ?? ""}
                          id="monto_sueldo"
                          type="number"
                          fullWidth
                          error={!!errors.monto_sueldo}
                          helperText={errors.monto_sueldo?.message}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  S/
                                </InputAdornment>
                              ),
                            },
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="periodo_pago">
                      Período
                    </CustomFormLabel>
                    <Controller
                      name="periodo_pago"
                      control={control}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          value={field.value ?? ""}
                          select
                          id="periodo_pago"
                          fullWidth
                          error={!!errors.periodo_pago}
                          helperText={errors.periodo_pago?.message}
                          slotProps={{ select: { displayEmpty: true } }}
                        >
                          <MenuItem value="">Elige un período</MenuItem>
                          {Object.entries(PERIODOS_PAGO).map(
                            ([valor, label]) => (
                              <MenuItem key={valor} value={valor}>
                                {label}
                              </MenuItem>
                            )
                          )}
                        </CustomTextField>
                      )}
                    />
                  </Grid>
                </>
              ) : null}
            </Grid>
          </Box>

          {/* ---------------------------------------------- Horario */}
          <Box hidden={pestana !== 2}>
            <HorarioTab control={control} errors={errors} />
          </Box>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3 }}>
          <Stack direction="row" spacing={1}>
            <Button
              type="submit"
              variant="contained"
              disabled={mutacion.isPending}
            >
              {mutacion.isPending
                ? "Guardando…"
                : esEdicion
                  ? "Actualizar"
                  : "Guardar"}
            </Button>
            <Button
              onClick={onCerrar}
              color="inherit"
              disabled={mutacion.isPending}
            >
              Cancelar
            </Button>
          </Stack>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default EmpleadoFormDialog;
