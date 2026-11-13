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
import { usePermisos } from "@/features/capacidades/hooks/useCapacidades";
import {
  horasOcupadas,
  huecosDisponibles,
  jornadaDelDia,
  pasoDeAgenda,
} from "@/features/calendario/disponibilidad";
import { useNegocio } from "@/features/configuracion/hooks/useConfiguracion";
import { horarioNegocio } from "@/features/configuracion/types";
import { ESTADOS_CITA } from "../constants";
import { useActualizarCita, useCitasDelDia, useCrearCita } from "../hooks/useCitas";
import { useConRetardo, useOpcionesCita } from "../hooks/useOpcionesCita";
import CasillaWhatsapp from "@/features/clientes/components/CasillaWhatsapp";
import HistorialCita from "./HistorialCita";
import SelectorHuecos from "./SelectorHuecos";
import SelectorOpcion from "./SelectorOpcion";
import {
  citaSchema,
  valoresIniciales,
  type CitaFormValues,
} from "../schemas/cita.schema";
import {
  ocupaSuHueco,
  servicioPrincipal,
  type Cita,
  type CitaPayload,
} from "../types";

/**
 * Hoy y la hora de ahora en la zona del negocio («2026-11-13», «10:20»). El
 * panel no agenda en el pasado (decisión del 2026-11-13); el backend lo exige
 * igual, esto solo evita ofrecer lo que va a rechazar.
 */
function ahoraEnZona(zona: string): { fecha: string; hora: string } {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: zona,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const de = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? "00";
  return { fecha: `${de("year")}-${de("month")}-${de("day")}`, hora: `${de("hour")}:${de("minute")}` };
}

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

  /*
    Story 1.10: nada de listas enteras. Cada selector busca en
    `/citas/opciones` (que además respeta el alcance y los permisos de quien
    agenda), y lo elegido se pide por id para usar sus datos: el horario del
    profesional, la duración del servicio, el precio de cada producto.

    Las sedes son pocas —las limita el plan— y se piden de una vez.
  */
  const { data: locales = [] } = useOpcionesCita("locales", {}, abierto);
  const { puedeVer: puedeVerInventario } = usePermisos("inventario");

  /*
    El selector de sede solo aparece con mas de una.

    Con una sola, el backend asigna la principal y preguntarlo seria pedir
    una decision que no existe. Con varias hace falta, porque si no llega
    `local_id` la cita cae en la principal EN SILENCIO --y agendar en la
    sede equivocada no se nota hasta que el cliente aparece en la otra.
  */
  const hayVariasSedes = locales.length > 1;
  const sedePrincipal = locales.find((local) => local.es_principal) ?? locales[0];

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
  // Con varias sedes, los selectores ofrecen solo lo reservable en la elegida.
  const sedeElegida = useWatch({ control, name: "local_id" });
  const fechaElegida = useWatch({ control, name: "fecha" });
  const { data: servicioPorId = [] } = useOpcionesCita("servicios", {
    ids: servicioId ? [servicioId] : [],
  });
  const servicioElegido = servicioPorId[0];
  const { data: profesionalPorId = [] } = useOpcionesCita("profesionales", {
    ids: empleadoId ? [empleadoId] : [],
  });
  const profesionalElegido = profesionalPorId[0];

  // El cliente se escribe a mano o se busca entre los registrados.
  const clienteEscrito = useWatch({ control, name: "cliente_nombre" }) ?? "";
  const { data: clientes = [] } = useOpcionesCita(
    "clientes",
    { search: useConRetardo(clienteEscrito) },
    abierto
  );

  /*
    `monto` es lo del SERVICIO, y es lo unico que se envia: reenviarlo con el
    total dentro subiria el precio del servicio con el importe de lo vendido.
    Lo que se cobra --el `monto_total` del backend-- se calcula aqui solo para
    ENSEÑARLO, para que nadie corrija el monto a mano creyendo que falta.

    Los inputs numericos devuelven string y yup solo castea al enviar, asi que
    el Number() va a mano (trampa ya anotada en el CLAUDE.md).
  */
  const montoServicio = useWatch({ control, name: "monto" });
  const filasVigiladas = useWatch({ control, name: "productos" });
  const idsProductos = (filasVigiladas ?? []).map((f) => Number(f?.id)).filter(Boolean);
  const { data: productos = [] } = useOpcionesCita("productos", { ids: idsProductos });
  const importeProductos = (filasVigiladas ?? []).reduce((suma, fila) => {
    const producto = productos.find((p) => p.id === Number(fila?.id));
    if (!producto) return suma;
    return suma + producto.precio_venta * (Number(fila?.cantidad) || 0);
  }, 0);
  const totalACobrar = (Number(montoServicio) || 0) + importeProductos;

  // Citas del día para descontar los huecos ya ocupados del profesional.
  const { data: citasDelDia = [], isPending: cargandoAgenda } =
    useCitasDelDia(fechaElegida);

  // El dueño decide cómo se generan los huecos (ver Configuración).
  const { data: configuracion } = useNegocio();

  /**
   * Huecos en los que cabe esta cita: jornada del profesional, menos sus
   * breaks, menos lo que ya tiene agendado.
   */
  const { huecos, ocupadas, motivoVacio } = useMemo(() => {
    if (!empleadoId) {
      return {
        huecos: [] as string[],
        ocupadas: [] as string[],
        motivoVacio: "Elige un profesional para ver sus horarios disponibles.",
      };
    }

    const profesional = profesionalElegido;
    if (!profesional) return { huecos: [], ocupadas: [], motivoVacio: null };

    // El pasado no se ofrece. Una cita pasada que se edita sin cambiarle el
    // día se deja como está: cerrarla (completada, no asistió) sí se puede.
    const ahora = ahoraEnZona(configuracion?.zona_horaria || "America/Lima");
    const mismoDiaQueAntes = !!cita && fechaElegida === cita.fecha;
    if (fechaElegida && fechaElegida < ahora.fecha && !mismoDiaQueAntes) {
      return {
        huecos: [],
        ocupadas: [],
        motivoVacio: "Ese día ya pasó. Elige hoy o un día que viene.",
      };
    }

    const jornada = jornadaDelDia(
      profesional,
      fechaElegida,
      horarioNegocio(configuracion)
    );
    if (!jornada.trabaja) {
      return {
        huecos: [],
        ocupadas: [],
        motivoVacio:
          jornada.nota ?? `${profesional.nombre} no atiende este día.`,
      };
    }

    const ocupados = citasDelDia
      .filter(
        (c) => c.empleado.id === empleadoId && c.id !== cita?.id && ocupaSuHueco(c)
      )
      .map((c) => ({ inicio: c.hora_inicio, fin: c.hora_fin }));

    const duracion = servicioElegido?.duracion_min ?? 30;

    const paso = pasoDeAgenda(configuracion?.agenda, duracion);
    const todas = huecosDisponibles(jornada, ocupados, duracion, paso);
    // Hoy, solo las horas que aún no pasan (la de la cita que se edita la
    // conserva el selector aunque no esté en la lista).
    const esHoy = fechaElegida === ahora.fecha;
    const libres = esHoy ? todas.filter((hora) => hora >= ahora.hora) : todas;

    return {
      huecos: libres,
      ocupadas: horasOcupadas(jornada, ocupados, duracion, paso),
      motivoVacio: libres.length
        ? null
        : esHoy && todas.length
          ? "Ya no quedan horas hoy. Elige otro día."
          : `${profesional.nombre} tiene la agenda llena este día.`,
    };
  }, [
    empleadoId,
    profesionalElegido,
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
            // La primera linea de `servicios`: el panel manda una sola.
            servicio_id: servicioPrincipal(cita)?.id ?? 0,
            fecha: cita.fecha,
            hora_inicio: cita.hora_inicio,
            local_id: cita.local_id,
            cliente_id: cita.cliente_id,
            cliente_nombre: cita.cliente_nombre,
            cliente_telefono: cita.cliente_telefono,
            cliente_email: cita.cliente_email,
            acepta_whatsapp: cita.cliente_acepta_whatsapp,
            monto: cita.monto,
            estado: cita.estado,
            notas: cita.notas,
            productos: cita.productos.map((p) => ({
              id: p.producto_id,
              cantidad: p.cantidad,
            })),
          }
        : {
            ...valoresIniciales,
            // Con varias sedes se propone la principal, que es la que el
            // backend elegiria de todos modos: asi el campo nunca sale vacio
            // y lo que se ve es lo que se guarda.
            local_id: hayVariasSedes ? (sedePrincipal?.id ?? null) : null,
            ...preseleccion,
          }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, cita, preseleccion, reset, hayVariasSedes, sedePrincipal?.id]);

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
                  <SelectorOpcion
                    coleccion="profesionales"
                    local={hayVariasSedes ? sedeElegida : null}
                    id="empleado_id"
                    valor={field.value}
                    onChange={(opcion) => field.onChange(opcion?.id ?? 0)}
                    conocida={cita?.empleado ?? null}
                    placeholder="Buscar profesional"
                    error={!!errors.empleado_id}
                    helperText={errors.empleado_id?.message}
                  />
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
                  <SelectorOpcion
                    coleccion="servicios"
                    local={hayVariasSedes ? sedeElegida : null}
                    id="servicio_id"
                    valor={field.value}
                    onChange={(servicio) => {
                      field.onChange(servicio?.id ?? 0);
                      // El monto arranca del precio del servicio; luego es editable.
                      if (servicio) setValue("monto", servicio.precio);
                    }}
                    etiqueta={(servicio) => `${servicio.nombre} (${formatMoneda(servicio.precio)})`}
                    conocida={cita ? (servicioPrincipal(cita) ?? null) : null}
                    placeholder="Buscar servicio"
                    error={!!errors.servicio_id}
                    helperText={errors.servicio_id?.message}
                  />
                )}
              />
            </Grid>

            {hayVariasSedes ? (
              <Grid size={12}>
                <CustomFormLabel htmlFor="local_id">Sede</CustomFormLabel>
                <Controller
                  name="local_id"
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e: any) => field.onChange(Number(e.target.value))}
                      select
                      id="local_id"
                      fullWidth
                      error={!!errors.local_id}
                      helperText={errors.local_id?.message}
                    >
                      {locales.map((local) => (
                        <MenuItem key={local.id} value={local.id}>
                          {local.nombre}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
              </Grid>
            ) : errors.local_id ? (
              // Con una sola sede el selector no se pinta, pero el backend
              // puede rechazarla igual (p. ej. está desactivada): sin esto el
              // 422 de `local_id` no se vería en ningún sitio.
              <Grid size={12}>
                <Alert severity="error">{errors.local_id.message}</Alert>
              </Grid>
            ) : null}

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
                    // Los días anteriores salen deshabilitados en el calendario.
                    slotProps={{
                      htmlInput: { min: ahoraEnZona(configuracion?.zona_horaria || "America/Lima").fecha },
                    }}
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
                      ocupadas={ocupadas}
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
                    /*
                      El `id` va AQUI y no en el `renderInput`: el Autocomplete
                      genera el suyo propio para el input y descarta el que se
                      le pase dentro, asi que el `htmlFor` de la etiqueta se
                      quedaba apuntando a nada y pulsarla no enfocaba el campo.
                    */
                    id="cliente_nombre"
                    freeSolo
                    options={clientes}
                    getOptionLabel={(opcion) =>
                      typeof opcion === "string" ? opcion : opcion.nombre
                    }
                    // El filtrado lo hace el servidor (Story 1.10).
                    filterOptions={(x) => x}
                    // Por id y con el teléfono: dos clientes pueden llamarse igual.
                    renderOption={(props, opcion) => {
                      const { key: _key, ...resto } = props as typeof props & { key: string };
                      return (
                        <li key={opcion.id} {...resto}>
                          {opcion.nombre}
                          {opcion.telefono ? ` · ${opcion.telefono}` : ""}
                        </li>
                      );
                    }}
                    inputValue={field.value ?? ""}
                    onInputChange={(_, valor, motivo) => {
                      field.onChange(valor);
                      // Si lo escribió a mano, deja de estar vinculado a un
                      // cliente, y su casilla de WhatsApp no es de este.
                      if (motivo === "input") {
                        setValue("cliente_id", null);
                        setValue("acepta_whatsapp", false);
                      }
                    }}
                    onChange={(_, valor) => {
                      if (valor && typeof valor !== "string") {
                        field.onChange(valor.nombre);
                        setValue("cliente_id", valor.id);
                        setValue("cliente_telefono", valor.telefono);
                        setValue("cliente_email", valor.email);
                        setValue("acepta_whatsapp", valor.acepta_whatsapp);
                      }
                    }}
                    renderInput={(params) => (
                      <CustomTextField
                        {...params}
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

            <Grid size={12}>
              <Controller
                name="acepta_whatsapp"
                control={control}
                render={({ field }) => (
                  <CasillaWhatsapp marcada={!!field.value} onCambiar={field.onChange} />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="monto">Monto del servicio</CustomFormLabel>
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
                    helperText={
                      errors.monto?.message ??
                      (importeProductos > 0
                        ? `Con los productos se cobran ${formatMoneda(totalACobrar)}.`
                        : undefined)
                    }
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
            {/* Sin permiso de inventario, `/citas/opciones` no manda productos. */}
            {puedeVerInventario ? (
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
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <SelectorOpcion
                            coleccion="productos"
                            size="small"
                            valor={field.value}
                            onChange={(producto) => field.onChange(producto?.id ?? 0)}
                            etiqueta={(producto) => `${producto.nombre} (${formatMoneda(producto.precio_venta)})`}
                            conocida={
                              cita?.productos
                                .filter((p) => p.producto_id === field.value)
                                .map((p) => ({ id: p.producto_id, nombre: p.nombre }))[0] ?? null
                            }
                            placeholder="Buscar producto"
                            error={!!errors.productos?.[i]?.id}
                            helperText={errors.productos?.[i]?.id?.message}
                          />
                        </Box>
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
            ) : null}
          </Grid>

          {/* Solo al editar: una cita nueva aún no tiene historia (Story 1.13). */}
          {cita ? (
            <>
              <Divider sx={{ my: 3 }} />
              <HistorialCita cita={cita} />
            </>
          ) : null}
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
