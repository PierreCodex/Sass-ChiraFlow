"use client";
import { useEffect, useMemo, useState } from "react";

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
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import { dialogoResponsive, formularioCompacto } from "@/components/shared/estilos-formulario";
import { toApiError } from "@/lib/api/client";
import { formatMoneda } from "@/lib/format";

import SelectorHueco from "./SelectorHueco";
import { useReservar } from "../hooks/useTienda";
import type {
  AsignacionServicio,
  DatosCliente,
  LineaCarrito,
  ModoReserva,
  ProfesionalPublico,
  ReservaConfirmada,
} from "../types";
import { duracionCarrito, totalCarrito } from "../types";

interface Props {
  abierto: boolean;
  slug: string;
  localId: number;
  lineas: LineaCarrito[];
  profesionales: ProfesionalPublico[];
  onCerrar: () => void;
  onConfirmada: (reserva: ReservaConfirmada) => void;
}

const DATOS_VACIOS: DatosCliente = {
  cliente_nombre: "",
  cliente_apellido: null,
  cliente_telefono: "",
  cliente_email: "",
  cliente_documento: null,
  notas: null,
};

const WizardReserva = ({
  abierto,
  slug,
  localId,
  lineas,
  profesionales,
  onCerrar,
  onConfirmada,
}: Props) => {
  const theme = useTheme();
  const reservar = useReservar(slug, localId);

  // Con un solo servicio la modalidad no aplica: siempre es una cita.
  const necesitaModo = lineas.length > 1;

  const [paso, setPaso] = useState(0);
  const [modo, setModo] = useState<ModoReserva>("unica");
  const [asignaciones, setAsignaciones] = useState<AsignacionServicio[]>([]);
  const [datos, setDatos] = useState<DatosCliente>(DATOS_VACIOS);
  const [errores, setErrores] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!abierto) return;
    reservar.reset();
    setPaso(0);
    setModo("unica");
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
  }, [abierto, lineas]);

  const pasos = necesitaModo
    ? ["Modalidad", "Fecha y profesional", "Tus datos", "Confirmar"]
    : ["Fecha y profesional", "Tus datos", "Confirmar"];

  /** Índice real del paso, ignorando "Modalidad" cuando no aplica. */
  const pasoReal = necesitaModo ? paso : paso + 1;

  const duracionTotal = useMemo(() => duracionCarrito(lineas), [lineas]);
  const montoTotal = useMemo(() => totalCarrito(lineas), [lineas]);

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

  const asignacionCompleta = (asignacion: AsignacionServicio) =>
    !!asignacion.profesional_id && !!asignacion.fecha && !!asignacion.hora_inicio;

  const puedeAvanzarAsignacion =
    modo === "unica"
      ? asignaciones.length > 0 && asignacionCompleta(asignaciones[0])
      : asignaciones.every(asignacionCompleta);

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
    if (pasoReal === 2 && !validarDatos()) return;
    setPaso((actual) => actual + 1);
  };

  const confirmar = () => {
    reservar.mutate(
      {
        ...datos,
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
      maxWidth="md"
    >
      <DialogTitle component="div">
        <Typography variant="h5" fontWeight={600} mb={2}>
          Reservar tu cita
        </Typography>
        <Stepper activeStep={paso} alternativeLabel>
          {pasos.map((titulo) => (
            <Step key={titulo}>
              <StepLabel>{titulo}</StepLabel>
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

        {/* ── Paso 0: modalidad ─────────────────────────────── */}
        {pasoReal === 0 ? (
          <Stack spacing={2}>
            <Typography variant="h6">
              ¿Cómo quieres agendar tus {lineas.length} servicios?
            </Typography>

            {(
              [
                {
                  valor: "unica" as ModoReserva,
                  titulo: "Todo seguido, en una sola cita",
                  detalle: `Un solo profesional te atiende ${duracionCarrito(lineas)} minutos seguidos.`,
                },
                {
                  valor: "separada" as ModoReserva,
                  titulo: "Por separado",
                  detalle:
                    "Cada servicio con su profesional, su día y su hora.",
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

        {/* ── Paso 1: profesional, fecha y hora ─────────────── */}
        {pasoReal === 1 ? (
          modo === "unica" ? (
            <Box>
              <Typography variant="body2" color="textSecondary" mb={2}>
                {lineas.length > 1
                  ? `Reservamos ${duracionTotal} minutos seguidos para tus ${lineas.length} servicios.`
                  : `Duración: ${duracionTotal} minutos.`}
              </Typography>
              <SelectorHueco
                slug={slug}
                localId={localId}
                profesionales={profesionales}
                duracionMin={duracionTotal}
                profesionalId={asignaciones[0]?.profesional_id ?? null}
                fecha={asignaciones[0]?.fecha ?? null}
                hora={asignaciones[0]?.hora_inicio ?? null}
                onProfesional={(id) =>
                  actualizarTodas({ profesional_id: id, hora_inicio: null })
                }
                onFecha={(fecha) => actualizarTodas({ fecha, hora_inicio: null })}
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
                    <Typography variant="caption" color="textSecondary">
                      {linea.servicio.duracion_min * linea.cantidad} min
                    </Typography>

                    <Box mt={1}>
                      <SelectorHueco
                        slug={slug}
                        localId={localId}
                        profesionales={profesionales}
                        duracionMin={linea.servicio.duracion_min * linea.cantidad}
                        profesionalId={asignacion.profesional_id}
                        fecha={asignacion.fecha}
                        hora={asignacion.hora_inicio}
                        onProfesional={(id) =>
                          actualizar(linea.servicio.id, {
                            profesional_id: id,
                            hora_inicio: null,
                          })
                        }
                        onFecha={(fecha) =>
                          actualizar(linea.servicio.id, {
                            fecha,
                            hora_inicio: null,
                          })
                        }
                        onHora={(hora) =>
                          actualizar(linea.servicio.id, { hora_inicio: hora })
                        }
                      />
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          )
        ) : null}

        {/* ── Paso 2: datos de contacto ─────────────────────── */}
        {pasoReal === 2 ? (
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
              <CustomFormLabel htmlFor="cliente_email">Correo</CustomFormLabel>
              <CustomTextField
                id="cliente_email"
                type="email"
                fullWidth
                value={datos.cliente_email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDatos({ ...datos, cliente_email: e.target.value })
                }
                error={!!errores.cliente_email}
                helperText={
                  errores.cliente_email ?? "Te enviamos ahí la confirmación."
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor="cliente_documento">
                Documento
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
                Algo que debamos saber
              </CustomFormLabel>
              <CustomTextField
                id="notas"
                fullWidth
                multiline
                rows={3}
                value={datos.notas ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setDatos({ ...datos, notas: e.target.value || null })
                }
              />
            </Grid>
          </Grid>
        ) : null}

        {/* ── Paso 3: confirmar ─────────────────────────────── */}
        {pasoReal === 3 ? (
          <Stack spacing={2}>
            <Typography variant="h6">Revisa tu reserva</Typography>

            {lineas.map((linea) => {
              const asignacion = asignaciones.find(
                (item) => item.id === linea.servicio.id
              )!;
              return (
                <Stack
                  key={linea.servicio.id}
                  direction="row"
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Box minWidth={0}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {linea.servicio.nombre}
                      {linea.cantidad > 1 ? ` ×${linea.cantidad}` : ""}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {asignacion.fecha} · {asignacion.hora_inicio} ·{" "}
                      {
                        profesionales.find(
                          (item) => item.id === asignacion.profesional_id
                        )?.nombre
                      }
                    </Typography>
                  </Box>
                  <Typography variant="subtitle2" fontWeight={600} noWrap>
                    {formatMoneda(linea.servicio.precio * linea.cantidad)}
                  </Typography>
                </Stack>
              );
            })}

            <Divider />

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="subtitle1" fontWeight={600}>
                Total
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {formatMoneda(montoTotal)}
              </Typography>
            </Stack>

            <Alert severity="info">
              Tu reserva queda <strong>pendiente</strong> hasta que el negocio
              la confirme. Te avisamos a {datos.cliente_email}.
            </Alert>
          </Stack>
        ) : null}
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

        {pasoReal === 3 ? (
          <Button
            variant="contained"
            onClick={confirmar}
            disabled={reservar.isPending}
          >
            {reservar.isPending ? "Reservando…" : "Confirmar reserva"}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={avanzar}
            disabled={pasoReal === 1 && !puedeAvanzarAsignacion}
          >
            Continuar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default WizardReserva;
