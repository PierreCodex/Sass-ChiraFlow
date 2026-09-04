"use client";
import { useEffect, useMemo } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { IconPlus, IconX } from "@tabler/icons-react";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import { dialogoResponsive, formularioCompacto } from "@/components/shared/estilos-formulario";
import { toApiError } from "@/lib/api/client";
import { formatMoneda } from "@/lib/format";
import { useTodosLosClientes } from "@/features/clientes/hooks/useClientes";
import { useTodosLosEmpleados } from "@/features/empleados/hooks/useEmpleados";
import { saleEnAgenda } from "@/features/empleados/types";
import { useTodosLosServicios } from "@/features/servicios/hooks/useServicios";
import { useTodosLosProductos } from "@/features/inventario/hooks/useProductos";
import {
  huecosDisponibles,
  jornadaDelDia,
  pasoDeAgenda,
} from "@/features/calendario/disponibilidad";
import { useConfiguracion } from "@/features/configuracion/hooks/useConfiguracion";
import { horarioNegocio } from "@/features/configuracion/types";
import { ESTADOS_CITA } from "../constants";
import { useActualizarCita, useCitasDelDia, useCrearCita } from "../hooks/useCitas";
import SelectorHuecos from "./SelectorHuecos";
import {
  citaSchema,
  valoresIniciales,
  type CitaFormValues,
} from "../schemas/cita.schema";
import type { Cita, CitaPayload } from "../types";

interface Props {
  abierto: boolean;
  cita?: Cita | null;
  /** Valores de arranque al crear, p. ej. el hueco pulsado en el calendario. */
  preseleccion?: Partial<
    Pick<CitaFormValues, "fecha" | "hora_inicio" | "empleado_id">
  > | null;
  onCerrar: () => void;
}

const CitaFormDialog = ({ abierto, cita, preseleccion, onCerrar }: Props) => {
  const theme = useTheme();

  const esEdicion = !!cita;
  const crear = useCrearCita();
  const actualizar = useActualizarCita();
  const mutacion = esEdicion ? actualizar : crear;

  const { data: clientes = [] } = useTodosLosClientes();
  const { data: empleados = [] } = useTodosLosEmpleados();
  const { data: servicios = [] } = useTodosLosServicios();
  const { data: productos = [] } = useTodosLosProductos();

  // El selector de profesional lista a quien sale en la agenda.
  const profesionales = empleados.filter(saleEnAgenda);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm<CitaFormValues>({
    resolver: yupResolver(citaSchema),
    defaultValues: valoresIniciales,
  });

  const {
    fields: filasProducto,
    append: agregarProducto,
    remove: quitarProducto,
  } = useFieldArray({ control, name: "productos" });

  const servicioId = useWatch({ control, name: "servicio_id" });
  const empleadoId = useWatch({ control, name: "empleado_id" });
  const fechaElegida = useWatch({ control, name: "fecha" });
  const servicioElegido = servicios.find((s) => s.id === servicioId);

  // Citas del día para descontar los huecos ya ocupados del profesional.
  const { data: citasDelDia = [], isPending: cargandoAgenda } =
    useCitasDelDia(fechaElegida);

  // El dueño decide cómo se generan los huecos (ver Configuración).
  const { data: configuracion } = useConfiguracion();

  /**
   * Huecos en los que cabe esta cita: jornada del profesional, menos sus
   * breaks, menos lo que ya tiene agendado.
   */
  const { huecos, motivoVacio } = useMemo(() => {
    if (!empleadoId) {
      return {
        huecos: [] as string[],
        motivoVacio: "Elige un profesional para ver sus horarios disponibles.",
      };
    }

    const empleado = empleados.find((e) => e.id === empleadoId);
    if (!empleado) return { huecos: [], motivoVacio: null };

    const jornada = jornadaDelDia(
      empleado,
      fechaElegida,
      horarioNegocio(configuracion)
    );
    if (!jornada.trabaja) {
      return {
        huecos: [],
        motivoVacio:
          jornada.nota ?? `${empleado.nombre} no atiende este día.`,
      };
    }

    const ocupados = citasDelDia
      .filter(
        (c) =>
          c.empleado.id === empleadoId &&
          c.id !== cita?.id &&
          c.estado !== "cancelada"
      )
      .map((c) => ({ inicio: c.hora_inicio, fin: c.hora_fin }));

    const duracion = servicioElegido?.duracion_min ?? 30;

    const libres = huecosDisponibles(
      jornada,
      ocupados,
      duracion,
      pasoDeAgenda(configuracion?.agenda, duracion)
    );

    return {
      huecos: libres,
      motivoVacio: libres.length
        ? null
        : `${empleado.nombre} tiene la agenda llena este día.`,
    };
  }, [
    empleadoId,
    empleados,
    fechaElegida,
    citasDelDia,
    servicioElegido,
    configuracion,
    cita?.id,
  ]);

  useEffect(() => {
    if (!abierto) return;

    crear.reset();
    actualizar.reset();

    reset(
      cita
        ? {
            empleado_id: cita.empleado.id,
            servicio_id: cita.servicio.id,
            fecha: cita.fecha,
            hora_inicio: cita.hora_inicio,
            cliente_id: cita.cliente_id,
            cliente_nombre: cita.cliente_nombre,
            cliente_telefono: cita.cliente_telefono,
            cliente_email: cita.cliente_email,
            monto: cita.monto,
            estado: cita.estado,
            notas: cita.notas,
            productos: cita.productos.map((p) => ({
              id: p.producto_id,
              cantidad: p.cantidad,
            })),
          }
        : { ...valoresIniciales, ...preseleccion }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, cita, preseleccion, reset]);

  const onSubmit = handleSubmit((valores) => {
    const payload: CitaPayload = {
      ...valores,
      productos: valores.productos as CitaPayload["productos"],
    };

    const alTerminar = {
      onSuccess: () => onCerrar(),
      onError: (error: unknown) => {
        const apiError = toApiError(error);
        if (apiError.errors) {
          Object.entries(apiError.errors).forEach(([campo, mensajes]) => {
            setError(campo as keyof CitaFormValues, { message: mensajes[0] });
          });
        }
      },
    };

    if (esEdicion) {
      actualizar.mutate({ id: cita.id, payload }, alTerminar);
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
      maxWidth="sm"
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
        <DialogTitle component="div">
          <Typography variant="h5" fontWeight={600}>
            {esEdicion ? "Editar cita" : "Nueva cita"}
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="empleado_id" sx={{ mt: 0 }}>
                Profesional
              </CustomFormLabel>
              <Controller
                name="empleado_id"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    value={field.value || ""}
                    onChange={(e: any) => field.onChange(Number(e.target.value))}
                    select
                    id="empleado_id"
                    fullWidth
                    error={!!errors.empleado_id}
                    helperText={errors.empleado_id?.message}
                    slotProps={{ select: { displayEmpty: true } }}
                  >
                    <MenuItem value="">-- Elegir profesional --</MenuItem>
                    {profesionales.map((empleado) => (
                      <MenuItem key={empleado.id} value={empleado.id}>
                        {empleado.nombre}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="servicio_id" sx={{ mt: 0 }}>
                Servicio
              </CustomFormLabel>
              <Controller
                name="servicio_id"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    value={field.value || ""}
                    onChange={(e: any) => {
                      const id = Number(e.target.value);
                      field.onChange(id);
                      // El monto arranca del precio del servicio; luego es editable.
                      const servicio = servicios.find((s) => s.id === id);
                      if (servicio) setValue("monto", servicio.precio);
                    }}
                    select
                    id="servicio_id"
                    fullWidth
                    error={!!errors.servicio_id}
                    helperText={errors.servicio_id?.message}
                    slotProps={{ select: { displayEmpty: true } }}
                  >
                    <MenuItem value="">-- Seleccionar servicio --</MenuItem>
                    {servicios.map((servicio) => (
                      <MenuItem key={servicio.id} value={servicio.id}>
                        {servicio.nombre} ({formatMoneda(servicio.precio)})
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="fecha">Fecha</CustomFormLabel>
              <Controller
                name="fecha"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    id="fecha"
                    type="date"
                    fullWidth
                    error={!!errors.fecha}
                    helperText={errors.fecha?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="estado">Estado</CustomFormLabel>
              <Controller
                name="estado"
                control={control}
                render={({ field }) => (
                  <CustomTextField {...field} select id="estado" fullWidth>
                    {Object.entries(ESTADOS_CITA).map(([valor, config]) => (
                      <MenuItem key={valor} value={valor}>
                        {config.label}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>

            <Grid size={12}>
              <CustomFormLabel htmlFor="hora_inicio">Hora inicio</CustomFormLabel>
              <Controller
                name="hora_inicio"
                control={control}
                render={({ field }) => (
                  <>
                    <SelectorHuecos
                      huecos={huecos}
                      valor={field.value}
                      onChange={field.onChange}
                      cargando={cargandoAgenda && !!empleadoId}
                      motivoVacio={motivoVacio}
                      horaActual={cita?.hora_inicio ?? null}
                      duracionMin={servicioElegido?.duracion_min}
                    />
                    {errors.hora_inicio ? (
                      <Typography variant="caption" color="error" mt={0.5} display="block">
                        {errors.hora_inicio.message}
                      </Typography>
                    ) : null}
                  </>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="cliente_nombre">Cliente</CustomFormLabel>
              <Controller
                name="cliente_nombre"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    freeSolo
                    options={clientes}
                    getOptionLabel={(opcion) =>
                      typeof opcion === "string" ? opcion : opcion.nombre
                    }
                    inputValue={field.value ?? ""}
                    onInputChange={(_, valor, motivo) => {
                      field.onChange(valor);
                      // Si lo escribió a mano, deja de estar vinculado a un cliente.
                      if (motivo === "input") setValue("cliente_id", null);
                    }}
                    onChange={(_, valor) => {
                      if (valor && typeof valor !== "string") {
                        field.onChange(valor.nombre);
                        setValue("cliente_id", valor.id);
                        setValue("cliente_telefono", valor.telefono);
                        setValue("cliente_email", valor.email);
                      }
                    }}
                    renderInput={(params) => (
                      <CustomTextField
                        {...params}
                        id="cliente_nombre"
                        placeholder="Nombre del cliente"
                        error={!!errors.cliente_nombre}
                        helperText={errors.cliente_nombre?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="cliente_telefono">Teléfono</CustomFormLabel>
              <Controller
                name="cliente_telefono"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    value={field.value ?? ""}
                    id="cliente_telefono"
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="cliente_email">Email</CustomFormLabel>
              <Controller
                name="cliente_email"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    value={field.value ?? ""}
                    id="cliente_email"
                    type="email"
                    fullWidth
                    error={!!errors.cliente_email}
                    helperText={errors.cliente_email?.message}
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="monto">Monto</CustomFormLabel>
              <Controller
                name="monto"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    id="monto"
                    type="number"
                    fullWidth
                    error={!!errors.monto}
                    helperText={errors.monto?.message}
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

            <Grid size={12}>
              <CustomFormLabel htmlFor="notas">Notas</CustomFormLabel>
              <Controller
                name="notas"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    value={field.value ?? ""}
                    id="notas"
                    fullWidth
                    multiline
                    rows={2}
                  />
                )}
              />
            </Grid>

            {/* -------------------------------- Productos comprados */}
            <Grid size={12}>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="h6" fontWeight={600} mb={1}>
                Productos comprados
              </Typography>

              <Stack spacing={1.5}>
                {filasProducto.map((fila, i) => (
                  <Stack key={fila.id} direction="row" spacing={1} alignItems="flex-start">
                    <Controller
                      name={`productos.${i}.id`}
                      control={control}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          value={field.value || ""}
                          onChange={(e: any) => field.onChange(Number(e.target.value))}
                          select
                          fullWidth
                          size="small"
                          error={!!errors.productos?.[i]?.id}
                          helperText={errors.productos?.[i]?.id?.message}
                          slotProps={{ select: { displayEmpty: true } }}
                        >
                          <MenuItem value="">-- Seleccionar producto --</MenuItem>
                          {productos.map((producto) => (
                            <MenuItem key={producto.id} value={producto.id}>
                              {producto.nombre} ({formatMoneda(producto.precio_venta)})
                            </MenuItem>
                          ))}
                        </CustomTextField>
                      )}
                    />

                    <Controller
                      name={`productos.${i}.cantidad`}
                      control={control}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          onChange={(e: any) => field.onChange(Number(e.target.value))}
                          type="number"
                          size="small"
                          sx={{ width: 100 }}
                          error={!!errors.productos?.[i]?.cantidad}
                          helperText={errors.productos?.[i]?.cantidad?.message}
                        />
                      )}
                    />

                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => quitarProducto(i)}
                      sx={{ mt: 0.5 }}
                    >
                      <IconX size={18} />
                    </IconButton>
                  </Stack>
                ))}

                <Box>
                  <Button
                    size="small"
                    startIcon={<IconPlus size={16} />}
                    onClick={() => agregarProducto({ id: 0, cantidad: 1 })}
                  >
                    Agregar producto
                  </Button>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3 }}>
          <Stack direction="row" spacing={1}>
            <Button type="submit" variant="contained" disabled={mutacion.isPending}>
              {mutacion.isPending
                ? "Guardando…"
                : esEdicion
                  ? "Actualizar"
                  : "Guardar"}
            </Button>
            <Button onClick={onCerrar} color="inherit" disabled={mutacion.isPending}>
              Cancelar
            </Button>
          </Stack>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default CitaFormDialog;
