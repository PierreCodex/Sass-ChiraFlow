"use client";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import Alert from "@mui/material/Alert";
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
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import CampoImagenes from "@/components/shared/CampoImagenes";
import { dialogoResponsive, formularioCompacto } from "@/components/shared/estilos-formulario";
import { toApiError } from "@/lib/api/client";
import { useTodasLasCategorias } from "@/features/categorias/hooks/useCategorias";
import { useTodosLosEmpleados } from "@/features/empleados/hooks/useEmpleados";
import { TIPOS_CON_SESIONES, TIPOS_SERVICIO } from "../constants";
import { useActualizarServicio, useCrearServicio } from "../hooks/useServicios";
import {
  servicioSchema,
  valoresIniciales,
  type ServicioFormValues,
} from "../schemas/servicio.schema";
import { MAX_GALERIA, type Servicio, type ServicioPayload } from "../types";

interface Props {
  abierto: boolean;
  /** Si viene, el diálogo entra en modo edición. */
  servicio?: Servicio | null;
  onCerrar: () => void;
}

const ServicioFormDialog = ({ abierto, servicio, onCerrar }: Props) => {
  const theme = useTheme();

  const esEdicion = !!servicio;
  const crear = useCrearServicio();
  const actualizar = useActualizarServicio();
  const mutacion = esEdicion ? actualizar : crear;

  const { data: categorias = [] } = useTodasLasCategorias();
  const { data: empleados = [] } = useTodosLosEmpleados();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ServicioFormValues>({
    resolver: yupResolver(servicioSchema),
    defaultValues: valoresIniciales,
  });

  const tipo = useWatch({ control, name: "tipo" });
  const muestraSesiones = TIPOS_CON_SESIONES.includes(tipo);

  useEffect(() => {
    if (!abierto) return;

    crear.reset();
    actualizar.reset();

    reset(
      servicio
        ? {
            nombre: servicio.nombre,
            descripcion: servicio.descripcion,
            color: servicio.color,
            categoria_id: servicio.categoria?.id ?? null,
            tipo: servicio.tipo,
            max_sesiones: servicio.max_sesiones,
            precio: servicio.precio,
            duracion_min: servicio.duracion_min,
            imagen_principal: servicio.imagen_principal
              ? [{ url: servicio.imagen_principal }]
              : [],
            galeria: servicio.galeria.map((img) => ({
              id: img.id,
              url: img.url,
            })),
            empleado_ids: servicio.empleados.map((e) => e.id),
          }
        : valoresIniciales
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, servicio, reset]);

  const onSubmit = handleSubmit((valores) => {
    const conservar = valores.galeria.flatMap((img) =>
      img.id === undefined ? [] : [img.id]
    );

    // Las imágenes con `file` son nuevas; las que llevan `id` ya estaban
    // guardadas y hay que decirle al backend que las conserve. Van por id y
    // no por URL: ver el comentario de `galeria` en types.ts.
    const payload: ServicioPayload = {
      nombre: valores.nombre,
      descripcion: valores.descripcion,
      color: valores.color,
      categoria_id: valores.categoria_id,
      tipo: valores.tipo,
      // Solo se envía si el tipo lo usa.
      max_sesiones: muestraSesiones ? valores.max_sesiones : null,
      precio: valores.precio,
      duracion_min: valores.duracion_min,
      imagen_principal: valores.imagen_principal[0]?.file ?? null,
      galeria: valores.galeria.flatMap((img) => (img.file ? [img.file] : [])),
      /*
       * Quitar TODAS las fotos: un array vacío no viaja en multipart —
       * FormData no sabe expresar "lista vacía"—, así que el backend no vería
       * el campo y, por su propia regla, no borraría nada. El 0 no es el id de
       * ninguna fila (auto_increment empieza en 1), así que dice "no conserves
       * ninguna". Hay un traspaso abierto para un marcador explícito.
       */
      galeria_conservar:
        esEdicion && conservar.length === 0 ? [0] : conservar,
      empleado_ids: valores.empleado_ids,
    };

    const alTerminar = {
      onSuccess: () => onCerrar(),
      onError: (error: unknown) => {
        const apiError = toApiError(error);
        if (apiError.errors) {
          Object.entries(apiError.errors).forEach(([campo, mensajes]) => {
            setError(campo as keyof ServicioFormValues, {
              message: mensajes[0],
            });
          });
        }
      },
    };

    if (esEdicion) {
      actualizar.mutate({ id: servicio.id, payload }, alTerminar);
    } else {
      crear.mutate(payload, alTerminar);
    }
  });

  const errorGeneral = mutacion.isError ? toApiError(mutacion.error) : null;

  return (
    <Dialog
      sx={dialogoResponsive}
      open={abierto}
      onClose={mutacion.isPending ? undefined : onCerrar}
      fullWidth
      maxWidth="md"
    >
      {/* El form envuelve todo el diálogo, así que tiene que comportarse como
          la columna flex del Paper: si no, scrollea el diálogo entero y el
          título se va con el contenido. */}
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
        <DialogTitle component="div">
          <Typography variant="h5" fontWeight={600}>
            {esEdicion ? "Editar servicio" : "Nuevo servicio"}
          </Typography>
        </DialogTitle>

        <Divider />

        <DialogContent sx={formularioCompacto}>
          {errorGeneral && !errorGeneral.errors ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorGeneral.message}
            </Alert>
          ) : null}

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
                    autoFocus
                    error={!!errors.nombre}
                    helperText={errors.nombre?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <CustomFormLabel htmlFor="categoria_id">Categoría</CustomFormLabel>
              <Controller
                name="categoria_id"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    value={field.value ?? ""}
                    select
                    id="categoria_id"
                    fullWidth
                    error={!!errors.categoria_id}
                    helperText={errors.categoria_id?.message}
                    // Sin esto MUI deja el campo en blanco cuando el valor es ""
                    slotProps={{ select: { displayEmpty: true } }}
                  >
                    <MenuItem value="">Sin categoría</MenuItem>
                    {categorias.map((categoria) => (
                      <MenuItem key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <CustomFormLabel htmlFor="tipo">Tipo de servicio</CustomFormLabel>
              <Controller
                name="tipo"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    select
                    id="tipo"
                    fullWidth
                    error={!!errors.tipo}
                    helperText={errors.tipo?.message}
                  >
                    {Object.entries(TIPOS_SERVICIO).map(([valor, label]) => (
                      <MenuItem key={valor} value={valor}>
                        {label}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <CustomFormLabel htmlFor="color">Color</CustomFormLabel>
              <Controller
                name="color"
                control={control}
                render={({ field }) => (
                  <Box
                    component="input"
                    {...field}
                    type="color"
                    id="color"
                    sx={{
                      width: "100%",
                      height: 48,
                      p: 0.5,
                      cursor: "pointer",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                    }}
                  />
                )}
              />
            </Grid>

            {/* Solo los tipos que se venden por sesiones lo usan. */}
            {muestraSesiones ? (
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomFormLabel htmlFor="max_sesiones">
                  Sesiones incluidas
                </CustomFormLabel>
                <Controller
                  name="max_sesiones"
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      value={field.value ?? ""}
                      id="max_sesiones"
                      type="number"
                      fullWidth
                      error={!!errors.max_sesiones}
                      helperText={errors.max_sesiones?.message}
                    />
                  )}
                />
              </Grid>
            ) : null}

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
                    rows={2}
                    error={!!errors.descripcion}
                    helperText={errors.descripcion?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="precio">Precio</CustomFormLabel>
              <Controller
                name="precio"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    id="precio"
                    type="number"
                    fullWidth
                    error={!!errors.precio}
                    helperText={errors.precio?.message}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">S/</InputAdornment>
                        ),
                      },
                    }}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="duracion_min">
                Duración (min)
              </CustomFormLabel>
              <Controller
                name="duracion_min"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    id="duracion_min"
                    type="number"
                    fullWidth
                    error={!!errors.duracion_min}
                    helperText={errors.duracion_min?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="imagen_principal">
                Imagen principal
              </CustomFormLabel>
              <Controller
                name="imagen_principal"
                control={control}
                render={({ field }) => (
                  <CampoImagenes
                    valor={field.value}
                    onChange={field.onChange}
                    max={1}
                    error={errors.imagen_principal?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="galeria">
                Galería de trabajos (máx. {MAX_GALERIA} imágenes)
              </CustomFormLabel>
              <Controller
                name="galeria"
                control={control}
                render={({ field }) => (
                  <CampoImagenes
                    valor={field.value}
                    onChange={field.onChange}
                    max={MAX_GALERIA}
                    ayuda="Estas fotos se mostrarán en la página pública como evidencia del servicio."
                    error={errors.galeria?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={12}>
              <CustomFormLabel htmlFor="empleado_ids">
                Profesionales que ofrecen este servicio
              </CustomFormLabel>
              <Controller
                name="empleado_ids"
                control={control}
                render={({ field }) => (
                  <Grid container spacing={1.5}>
                    {empleados.map((empleado) => {
                      const marcado = field.value.includes(empleado.id);
                      return (
                        <Grid key={empleado.id} size={{ xs: 12, sm: 6, md: 4 }}>
                          <Paper
                            variant="outlined"
                            sx={{ px: 1.5, borderColor: marcado ? "primary.main" : undefined }}
                          >
                            <FormControlLabel
                              sx={{ width: "100%", m: 0, py: 0.5 }}
                              control={
                                <Checkbox
                                  checked={marcado}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.checked
                                        ? [...field.value, empleado.id]
                                        : field.value.filter(
                                            (id) => id !== empleado.id
                                          )
                                    )
                                  }
                                />
                              }
                              label={
                                <Typography variant="body2">
                                  {empleado.nombre}
                                </Typography>
                              }
                            />
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3 }}>
          <Stack direction="row" spacing={1}>
            <Button
              type="submit"
              variant="contained"
              disabled={mutacion.isPending}
            >
              {mutacion.isPending ? "Guardando…" : "Guardar"}
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

export default ServicioFormDialog;
