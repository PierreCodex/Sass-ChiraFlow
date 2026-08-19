"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType } from "react";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Radio from "@mui/material/Radio";
import Stack from "@mui/material/Stack";
import Step from "@mui/material/Step";
import StepButton from "@mui/material/StepButton";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import type { StepIconProps } from "@mui/material/StepIcon";
import {
  IconAddressBook,
  IconBuildingStore,
  IconCalendarEvent,
  IconCreditCard,
  IconDownload,
  IconListCheck,
  IconQrcode,
  IconUpload,
  IconUserCircle,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import { dialogoResponsive, formularioCompacto } from "@/components/shared/estilos-formulario";
import { toApiError } from "@/lib/api/client";

import SelectorProfesional from "./SelectorProfesional";
import SelectorFechaHora from "./SelectorFechaHora";
import ResumenServicios from "./ResumenServicios";
import { useReservar } from "../hooks/useTienda";
import type {
  AsignacionServicio,
  DatosCliente,
  LineaCarrito,
  ModoReserva,
  NegocioPublico,
  ProfesionalPublico,
  ReservaConfirmada,
} from "../types";
import { duracionCarrito } from "../types";

interface Props {
  abierto: boolean;
  slug: string;
  localId: number;
  negocio: NegocioPublico;
  lineas: LineaCarrito[];
  profesionales: ProfesionalPublico[];
  onEliminarLinea: (servicioId: number) => void;
  onCerrar: () => void;
  onConfirmada: (reserva: ReservaConfirmada) => void;
}

type MetodoPago = "ahora" | "local";

const DATOS_VACIOS: DatosCliente = {
  cliente_nombre: "",
  cliente_apellido: null,
  cliente_telefono: "",
  cliente_email: "",
  cliente_documento: null,
  notas: null,
};

interface IconoPasoProps extends StepIconProps {
  /** Ícono de Tabler de este paso — se pasa vía `StepLabel.StepIconProps`. */
  Icono: Icon;
}

/**
 * Reemplaza el círculo numerado del Stepper por un ícono de Tabler, con el
 * mismo tamaño de círculo. `active`/`completed` los inyecta MUI; el ícono
 * en sí viaja como prop extra a través de `StepIconProps` en `StepLabel`.
 */
function IconoPaso({ active, completed, Icono }: IconoPasoProps) {
  const theme = useTheme();
  const activo = Boolean(active || completed);
  return (
    <Box
      sx={{
        width: 34,
        height: 34,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: activo
          ? theme.palette.primary.main
          : theme.palette.action.disabledBackground,
      }}
    >
      <Icono
        size={18}
        stroke={1.8}
        color={activo ? theme.palette.primary.contrastText : theme.palette.text.disabled}
      />
    </Box>
  );
}

const WizardReserva = ({
  abierto,
  slug,
  localId,
  negocio,
  lineas,
  profesionales,
  onEliminarLinea,
  onCerrar,
  onConfirmada,
}: Props) => {
  const theme = useTheme();
  const reservar = useReservar(slug, localId);

  // Con un solo servicio la modalidad no aplica: siempre es una cita.
  const necesitaModo = lineas.length > 1;

  const [paso, setPaso] = useState(0);
  const [modo, setModo] = useState<ModoReserva>("unica");
  const [metodoPago, setMetodoPago] = useState<MetodoPago | null>(null);
  const [numeroOperacion, setNumeroOperacion] = useState("");
  const [comprobante, setComprobante] = useState<{ file: File; url: string } | null>(null);
  const inputComprobanteRef = useRef<HTMLInputElement>(null);
  const [asignaciones, setAsignaciones] = useState<AsignacionServicio[]>([]);
  const [datos, setDatos] = useState<DatosCliente>(DATOS_VACIOS);
  const [errores, setErrores] = useState<Record<string, string>>({});

  // Solo al ABRIR el wizard se reinicia todo. Si `lineas` cambia mientras ya
  // está abierto (por ejemplo, al eliminar un servicio del resumen) esto NO
  // debe correr — si no, cada eliminación mandaría al cliente de vuelta al
  // paso 1 y perdería el profesional/fecha que ya había elegido.
  useEffect(() => {
    if (!abierto) return;
    reservar.reset();
    setPaso(0);
    setModo("unica");
    setMetodoPago(null);
    setNumeroOperacion("");
    setComprobante(null);
    setDatos(DATOS_VACIOS);
    setErrores({});
    setAsignaciones(
      lineas.map((linea) => ({
        id: linea.servicio.id,
        cantidad: linea.cantidad,
        profesional_id: null,
        fecha: null,
        hora_inicio: null,
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto]);

  // Si eliminan un servicio del resumen mientras el wizard sigue abierto,
  // se quita también su asignación — sin tocar el paso actual ni los datos
  // ya llenados. Si no queda ningún servicio, se cierra solo.
  useEffect(() => {
    if (!abierto) return;
    setAsignaciones((actuales) =>
      actuales.filter((asignacion) =>
        lineas.some((linea) => linea.servicio.id === asignacion.id)
      )
    );
    if (lineas.length === 0) onCerrar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, lineas]);

  // 5 pasos reales: Modalidad (si aplica) → Fecha y hora → Profesional →
  // Datos de contacto → Método de pago (último: su botón es "Confirmar
  // reserva"). Sin paso de "Confirmar" aparte: el resumen de la derecha ya
  // cumple ese rol en todo momento.
  //
  // "Fecha y hora" muestra la UNIÓN de huecos de todos los profesionales
  // (basta con que uno esté libre); "Profesional" filtra después a quién de
  // verdad le queda esa hora. Así se puede pedir la fecha primero sin perder
  // la garantía de que la hora elegida sea reservable.
  const pasos = necesitaModo
    ? ["Modalidad", "Fecha y hora", "Profesional", "Datos de contacto", "Método de pago"]
    : ["Fecha y hora", "Profesional", "Datos de contacto", "Método de pago"];

  /** Índice real del paso, ignorando "Modalidad" cuando no aplica. */
  const pasoReal = necesitaModo ? paso : paso + 1;
  const esUltimoPaso = pasoReal === 4;

  const iconoPorPaso: Record<string, Icon> = {
    Modalidad: IconListCheck,
    "Fecha y hora": IconCalendarEvent,
    Profesional: IconUserCircle,
    "Datos de contacto": IconAddressBook,
    "Método de pago": IconCreditCard,
  };

  const duracionTotal = useMemo(() => duracionCarrito(lineas), [lineas]);

  const actualizar = (id: number, cambios: Partial<AsignacionServicio>) => {
    setAsignaciones((actuales) =>
      actuales.map((asignacion) =>
        asignacion.id === id ? { ...asignacion, ...cambios } : asignacion
      )
    );
  };

  /** En modo "unica" todas las líneas comparten profesional, fecha y hora. */
  const actualizarTodas = (cambios: Partial<AsignacionServicio>) => {
    setAsignaciones((actuales) =>
      actuales.map((asignacion) => ({ ...asignacion, ...cambios }))
    );
  };

  const tieneProfesional = (asignacion: AsignacionServicio) => !!asignacion.profesional_id;
  const tieneFechaHora = (asignacion: AsignacionServicio) =>
    !!asignacion.fecha && !!asignacion.hora_inicio;

  const puedeAvanzarProfesional =
    modo === "unica"
      ? asignaciones.length > 0 && tieneProfesional(asignaciones[0])
      : asignaciones.every(tieneProfesional);

  const puedeAvanzarFechaHora =
    modo === "unica"
      ? asignaciones.length > 0 && tieneFechaHora(asignaciones[0])
      : asignaciones.every(tieneFechaHora);

  const validarDatos = () => {
    const nuevos: Record<string, string> = {};
    if (!datos.cliente_nombre.trim()) nuevos.cliente_nombre = "Escribe tu nombre";
    if (!datos.cliente_telefono.trim())
      nuevos.cliente_telefono = "Necesitamos un teléfono de contacto";
    if (!datos.cliente_email.trim()) {
      nuevos.cliente_email = "Necesitamos un correo";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.cliente_email)) {
      nuevos.cliente_email = "Ese correo no parece válido";
    }
    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const avanzar = () => {
    // "Datos de contacto" ya no es el último paso: hay que validarlo aquí
    // al salir, no solo en `confirmar()` — si no, se podía llegar a "Método
    // de pago" con un correo inválido y enterarse recién al confirmar.
    if (pasoReal === 3 && !validarDatos()) return;
    setPaso((actual) => actual + 1);
  };

  const confirmar = () => {
    if (!validarDatos()) return;
    reservar.mutate(
      {
        ...datos,
        notas: [datos.notas, numeroOperacion ? `N° operación: ${numeroOperacion}` : null]
          .filter(Boolean)
          .join(" · ") || null,
        metodo_pago: metodoPago,
        comprobante_pago_url: comprobante?.url ?? null,
        modo,
        servicios: asignaciones.map((asignacion) => ({
          id: asignacion.id,
          cantidad: asignacion.cantidad,
          profesional_id: asignacion.profesional_id!,
          fecha: asignacion.fecha!,
          hora_inicio: asignacion.hora_inicio!,
        })),
      },
      { onSuccess: (reserva) => onConfirmada(reserva) }
    );
  };

  const errorGeneral = reservar.isError ? toApiError(reservar.error) : null;

  return (
    <Dialog
      sx={dialogoResponsive}
      open={abierto}
      onClose={reservar.isPending ? undefined : onCerrar}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle component="div">
        <Typography variant="h5" fontWeight={600} mb={2}>
          Reservar tu cita
        </Typography>
        <Stepper activeStep={paso} alternativeLabel>
          {pasos.map((titulo, indice) => (
            <Step key={titulo} completed={indice < paso} disabled={indice > paso}>
              {/*
                Solo se puede hacer click hacia atrás, a un paso ya
                completado — no hacia adelante, a uno que todavía no tiene
                los datos que necesita (ej. sin profesional no hay huecos
                de "Fecha y hora" que mostrar).
              */}
              <StepButton onClick={() => indice < paso && setPaso(indice)}>
                <StepLabel
                  StepIconComponent={IconoPaso as ComponentType<StepIconProps>}
                  StepIconProps={{ Icono: iconoPorPaso[titulo] } as never}
                >
                  {titulo}
                </StepLabel>
              </StepButton>
            </Step>
          ))}
        </Stepper>
      </DialogTitle>

      <Divider />

      <DialogContent sx={formularioCompacto}>
        {errorGeneral ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorGeneral.message}
          </Alert>
        ) : null}

        <Grid container spacing={3}>
          {/* ── Columna izquierda: el paso actual ─────────────── */}
          <Grid size={{ xs: 12, md: 7 }}>
            {/* ── Modalidad ─────────────────────────────── */}
            {pasoReal === 0 ? (
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={700}>
                  Elige cómo quieres agendar tus servicios
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Seleccioná una opción para continuar
                </Typography>

                {(
                  [
                    {
                      valor: "unica" as ModoReserva,
                      titulo: "Agendar uno tras otro",
                      detalle: `Realizá todos tus servicios el mismo día, seguidos, con el mismo profesional (${duracionTotal} min en total).`,
                    },
                    {
                      valor: "separada" as ModoReserva,
                      titulo: "Agendar por separado",
                      detalle:
                        "Seleccioná fecha, hora y profesional para cada servicio por separado.",
                    },
                  ]
                ).map((opcion) => (
                  <Card
                    key={opcion.valor}
                    variant="outlined"
                    onClick={() => setModo(opcion.valor)}
                    sx={{
                      cursor: "pointer",
                      borderColor: modo === opcion.valor ? "primary.main" : "divider",
                      borderWidth: modo === opcion.valor ? 2 : 1,
                    }}
                  >
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <Radio checked={modo === opcion.valor} sx={{ p: 0, mt: 0.5 }} />
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {opcion.titulo}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {opcion.detalle}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            ) : null}

            {/* ── Fecha y hora ──────────────────────────── */}
            {pasoReal === 1 ? (
              modo === "unica" ? (
                <Box>
                  <Typography variant="body2" color="textSecondary" mb={2}>
                    {lineas.length > 1
                      ? `Reservamos ${duracionTotal} minutos seguidos para tus ${lineas.length} servicios.`
                      : `Duración: ${duracionTotal} minutos.`}
                  </Typography>
                  <SelectorFechaHora
                    slug={slug}
                    localId={localId}
                    duracionMin={duracionTotal}
                    profesionalIds={profesionales.map((p) => p.id)}
                    fecha={asignaciones[0]?.fecha ?? null}
                    hora={asignaciones[0]?.hora_inicio ?? null}
                    onFecha={(fecha) =>
                      actualizarTodas({ fecha, hora_inicio: null, profesional_id: null })
                    }
                    onHora={(hora) => actualizarTodas({ hora_inicio: hora })}
                  />
                </Box>
              ) : (
                <Stack spacing={3} divider={<Divider />}>
                  {lineas.map((linea) => {
                    const asignacion = asignaciones.find(
                      (item) => item.id === linea.servicio.id
                    );
                    if (!asignacion) return null;

                    return (
                      <Box key={linea.servicio.id}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {linea.servicio.nombre}
                          {linea.cantidad > 1 ? ` ×${linea.cantidad}` : ""}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" mb={1} display="block">
                          {linea.servicio.duracion_min * linea.cantidad} min
                        </Typography>

                        <SelectorFechaHora
                          slug={slug}
                          localId={localId}
                          duracionMin={linea.servicio.duracion_min * linea.cantidad}
                          profesionalIds={profesionales.map((p) => p.id)}
                          fecha={asignacion.fecha}
                          hora={asignacion.hora_inicio}
                          onFecha={(fecha) =>
                            actualizar(linea.servicio.id, {
                              fecha,
                              hora_inicio: null,
                              profesional_id: null,
                            })
                          }
                          onHora={(hora) =>
                            actualizar(linea.servicio.id, { hora_inicio: hora })
                          }
                        />
                      </Box>
                    );
                  })}
                </Stack>
              )
            ) : null}

            {/* ── Profesional ───────────────────────────── */}
            {pasoReal === 2 ? (
              modo === "unica" ? (
                <SelectorProfesional
                  slug={slug}
                  localId={localId}
                  duracionMin={duracionTotal}
                  fecha={asignaciones[0]?.fecha ?? ""}
                  hora={asignaciones[0]?.hora_inicio ?? ""}
                  profesionales={profesionales}
                  profesionalId={asignaciones[0]?.profesional_id ?? null}
                  onProfesional={(id) => actualizarTodas({ profesional_id: id })}
                />
              ) : (
                <Stack spacing={3} divider={<Divider />}>
                  {lineas.map((linea) => {
                    const asignacion = asignaciones.find(
                      (item) => item.id === linea.servicio.id
                    );
                    if (!asignacion) return null;

                    return (
                      <Box key={linea.servicio.id}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {linea.servicio.nombre}
                          {linea.cantidad > 1 ? ` ×${linea.cantidad}` : ""}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" mb={1} display="block">
                          {asignacion.fecha} · {asignacion.hora_inicio}
                        </Typography>

                        <SelectorProfesional
                          slug={slug}
                          localId={localId}
                          duracionMin={linea.servicio.duracion_min * linea.cantidad}
                          fecha={asignacion.fecha ?? ""}
                          hora={asignacion.hora_inicio ?? ""}
                          profesionales={profesionales}
                          profesionalId={asignacion.profesional_id}
                          onProfesional={(id) =>
                            actualizar(linea.servicio.id, { profesional_id: id })
                          }
                        />
                      </Box>
                    );
                  })}
                </Stack>
              )
            ) : null}

            {/* ── Método de pago (último paso) ──────────────── */}
            {pasoReal === 4 ? (
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={700}>
                  ¿Cómo querés pagar?
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Elegí la opción que te quede más cómoda.
                </Typography>

                <Grid container spacing={2}>
                  {(
                    [
                      // "Pagar ahora" solo aparece si el negocio activó pagos
                      // QR en Configuración — sin QR configurado no hay nada
                      // que mostrarle al cliente en el siguiente paso.
                      ...(negocio.pago_qr_activo
                        ? [
                            {
                              valor: "ahora" as MetodoPago,
                              icono: IconQrcode,
                              titulo: "Pagar ahora",
                              detalle:
                                "Te mostramos el QR al finalizar para que pagues con Yape, Plin o banco.",
                            },
                          ]
                        : []),
                      {
                        valor: "local" as MetodoPago,
                        icono: IconBuildingStore,
                        titulo: "Pagar en el local",
                        detalle: "Reservás tu cita y pagás directamente el día de tu visita.",
                      },
                    ]
                  ).map((opcion) => {
                    const Icono = opcion.icono;
                    const seleccionado = metodoPago === opcion.valor;
                    return (
                      <Grid key={opcion.valor} size={{ xs: 12, sm: 6 }}>
                        <Card
                          variant="outlined"
                          onClick={() => setMetodoPago(opcion.valor)}
                          sx={{
                            cursor: "pointer",
                            height: "100%",
                            borderColor: seleccionado ? "primary.main" : "divider",
                            borderWidth: seleccionado ? 2 : 1,
                          }}
                        >
                          <CardContent>
                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                borderRadius: "50%",
                                bgcolor: "primary.light",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mb: 1.5,
                              }}
                            >
                              <Icono size={24} color={theme.palette.primary.main} />
                            </Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {opcion.titulo}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {opcion.detalle}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>

                {metodoPago === "ahora" ? (
                  <Card variant="outlined" sx={{ bgcolor: "grey.50" }}>
                    <CardContent>
                      <Stack alignItems="center" spacing={1.5} textAlign="center">
                        <Box
                          sx={{
                            width: 200,
                            height: 200,
                            borderRadius: 2,
                            bgcolor: "background.paper",
                            border: negocio.pago_qr_url ? "1px solid" : "1px dashed",
                            borderColor: "divider",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                          }}
                        >
                          {negocio.pago_qr_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={negocio.pago_qr_url}
                              alt="QR de pago"
                              style={{ width: "100%", height: "100%", objectFit: "contain" }}
                            />
                          ) : (
                            <IconQrcode size={64} color={theme.palette.text.disabled} />
                          )}
                        </Box>
                        <Typography variant="body2" fontWeight={600}>
                          {negocio.pago_qr_instrucciones ??
                            "El negocio te comparte su QR de pago al confirmar."}
                        </Typography>

                        {negocio.pago_qr_url ? (
                          <Button
                            component="a"
                            href={negocio.pago_qr_url}
                            download="qr-de-pago.png"
                            size="small"
                            variant="text"
                            startIcon={<IconDownload size={16} />}
                          >
                            Descargar QR
                          </Button>
                        ) : null}

                        <CustomTextField
                          size="small"
                          fullWidth
                          placeholder="N° de operación (opcional)"
                          value={numeroOperacion}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setNumeroOperacion(e.target.value)
                          }
                          sx={{ maxWidth: 260 }}
                        />

                        {/*
                          Comprobante de pago: el cliente sube una captura de
                          su pago para que el negocio la revise antes de
                          confirmar la cita (ver "Aceptar/Rechazar pago" en
                          Citas del panel).
                        */}
                        <Box>
                          <input
                            ref={inputComprobanteRef}
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              if (comprobante) URL.revokeObjectURL(comprobante.url);
                              setComprobante({ file, url: URL.createObjectURL(file) });
                              e.target.value = "";
                            }}
                          />
                          {comprobante ? (
                            <Stack alignItems="center" spacing={1}>
                              <Box
                                sx={{
                                  width: 100,
                                  height: 100,
                                  borderRadius: 1,
                                  overflow: "hidden",
                                  border: "1px solid",
                                  borderColor: "divider",
                                }}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={comprobante.url}
                                  alt="Comprobante de pago"
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              </Box>
                              <Button
                                size="small"
                                color="error"
                                onClick={() => {
                                  URL.revokeObjectURL(comprobante.url);
                                  setComprobante(null);
                                }}
                              >
                                Quitar captura
                              </Button>
                            </Stack>
                          ) : (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<IconUpload size={16} />}
                              onClick={() => inputComprobanteRef.current?.click()}
                            >
                              Subir captura de pago
                            </Button>
                          )}
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                ) : null}
              </Stack>
            ) : null}

            {/* ── Datos de contacto ──────────────────────── */}
            {pasoReal === 3 ? (
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={700}>
                  Datos de contacto
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Te notificaremos sobre tu cita al correo y/o teléfono que escribas aquí.
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="cliente_nombre">Nombre</CustomFormLabel>
                    <CustomTextField
                      id="cliente_nombre"
                      fullWidth
                      value={datos.cliente_nombre}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setDatos({ ...datos, cliente_nombre: e.target.value })
                      }
                      error={!!errores.cliente_nombre}
                      helperText={errores.cliente_nombre}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="cliente_apellido">
                      Apellido
                    </CustomFormLabel>
                    <CustomTextField
                      id="cliente_apellido"
                      fullWidth
                      value={datos.cliente_apellido ?? ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setDatos({ ...datos, cliente_apellido: e.target.value || null })
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="cliente_email">Email</CustomFormLabel>
                    <CustomTextField
                      id="cliente_email"
                      type="email"
                      fullWidth
                      value={datos.cliente_email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setDatos({ ...datos, cliente_email: e.target.value })
                      }
                      error={!!errores.cliente_email}
                      helperText={errores.cliente_email}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="cliente_telefono">
                      Teléfono
                    </CustomFormLabel>
                    <CustomTextField
                      id="cliente_telefono"
                      fullWidth
                      value={datos.cliente_telefono}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setDatos({ ...datos, cliente_telefono: e.target.value })
                      }
                      error={!!errores.cliente_telefono}
                      helperText={errores.cliente_telefono}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="cliente_documento">
                      DNI o RUC
                    </CustomFormLabel>
                    <CustomTextField
                      id="cliente_documento"
                      fullWidth
                      value={datos.cliente_documento ?? ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setDatos({
                          ...datos,
                          cliente_documento: e.target.value || null,
                        })
                      }
                    />
                  </Grid>
                  <Grid size={12}>
                    <CustomFormLabel htmlFor="notas">
                      Observaciones
                    </CustomFormLabel>
                    <CustomTextField
                      id="notas"
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Escribí aquí información que consideres relevante para tu cita"
                      value={datos.notas ?? ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setDatos({ ...datos, notas: e.target.value || null })
                      }
                    />
                  </Grid>
                </Grid>

                <Alert severity="info">
                  Tu reserva queda <strong>pendiente</strong> hasta que el negocio la
                  confirme.
                </Alert>
              </Stack>
            ) : null}
          </Grid>

          {/* ── Columna derecha: resumen fijo ─────────────────── */}
          <Grid size={{ xs: 12, md: 5 }}>
            <ResumenServicios
              lineas={lineas}
              asignaciones={asignaciones}
              profesionales={profesionales}
              onEliminar={onEliminarLinea}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3, justifyContent: "space-between" }}>
        <Button
          onClick={paso === 0 ? onCerrar : () => setPaso((n) => n - 1)}
          color="inherit"
          disabled={reservar.isPending}
        >
          {paso === 0 ? "Cancelar" : "Atrás"}
        </Button>

        {esUltimoPaso ? (
          <Button
            variant="contained"
            onClick={confirmar}
            disabled={reservar.isPending || !metodoPago}
          >
            {reservar.isPending ? "Reservando…" : "Confirmar reserva"}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={avanzar}
            disabled={
              (pasoReal === 1 && !puedeAvanzarFechaHora) ||
              (pasoReal === 2 && !puedeAvanzarProfesional)
            }
          >
            Siguiente
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default WizardReserva;
