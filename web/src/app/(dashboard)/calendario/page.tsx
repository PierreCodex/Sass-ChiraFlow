"use client";
import { useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import CardContent from "@mui/material/CardContent";

import PageContainer from "@/components/container/PageContainer";
import EncabezadoPagina from "@/components/shared/EncabezadoPagina";
// Mismo contenedor que usa el calendario de la plantilla Modernize.
import BlankCard from "@/components/shared/BlankCard";
import { toApiError } from "@/lib/api/client";
import { formatFechaLarga } from "@/lib/format";

import CalendarioToolbar, {
  type VistaCalendario,
} from "@/features/calendario/components/CalendarioToolbar";
import CalendarioCitas from "@/features/calendario/components/CalendarioCitas";
import CalendarioLista from "@/features/calendario/components/CalendarioLista";
import LeyendaCalendario from "@/features/calendario/components/LeyendaCalendario";
import CitaFormDialog from "@/features/citas/components/CitaFormDialog";
import { useCitasDelDia } from "@/features/citas/hooks/useCitas";
import { useTodosLosEmpleados } from "@/features/empleados/hooks/useEmpleados";
import type { Cita } from "@/features/citas/types";


export default function CalendarioPage() {
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [profesionalId, setProfesionalId] = useState<number | "">("");
  const [vista, setVista] = useState<VistaCalendario>("calendario");

  const [formAbierto, setFormAbierto] = useState(false);
  const [citaEditando, setCitaEditando] = useState<Cita | null>(null);
  const [preseleccion, setPreseleccion] = useState<{
    fecha: string;
    hora_inicio: string;
    empleado_id?: number;
  } | null>(null);

  const { data: citas = [], isPending, error } = useCitasDelDia(fecha);
  const { data: empleados = [] } = useTodosLosEmpleados();

  const profesionales = useMemo(
    () => empleados.filter((e) => e.rol === "profesional" && e.activo),
    [empleados]
  );

  const profesionalesVisibles = useMemo(
    () =>
      profesionalId === ""
        ? profesionales
        : profesionales.filter((e) => e.id === profesionalId),
    [profesionales, profesionalId]
  );

  const citasVisibles = useMemo(
    () =>
      profesionalId === ""
        ? citas
        : citas.filter((cita) => cita.empleado?.id === profesionalId),
    [citas, profesionalId]
  );

  const abrirNueva = () => {
    setCitaEditando(null);
    setPreseleccion({ fecha, hora_inicio: "" });
    setFormAbierto(true);
  };

  /** Clic en un hueco libre: arranca el formulario en esa hora y profesional. */
  const abrirEnHueco = (inicio: Date, empleadoId: number) => {
    setCitaEditando(null);
    setPreseleccion({
      fecha,
      hora_inicio: inicio.toTimeString().slice(0, 5),
      empleado_id: empleadoId,
    });
    setFormAbierto(true);
  };

  const abrirCita = (cita: Cita) => {
    setCitaEditando(cita);
    setPreseleccion(null);
    setFormAbierto(true);
  };

  return (
    <PageContainer title="Calendario" description="Agenda del día">
      <EncabezadoPagina titulo="Calendario" />

      <CalendarioToolbar
        fecha={fecha}
        onCambiarFecha={setFecha}
        profesionales={profesionales}
        profesionalId={profesionalId}
        onCambiarProfesional={setProfesionalId}
        vista={vista}
        onCambiarVista={setVista}
        onNuevaCita={abrirNueva}
      />

      <BlankCard>
        <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h5" fontWeight={600}>
            {formatFechaLarga(fecha)}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {citasVisibles.length}{" "}
            {citasVisibles.length === 1 ? "cita" : "citas"}
          </Typography>
        </Stack>

        {isPending ? (
          <Skeleton variant="rounded" height={520} />
        ) : error ? (
          <Alert severity="error">{toApiError(error).message}</Alert>
        ) : vista === "lista" ? (
          <CalendarioLista
            citas={citasVisibles}
            onSeleccionarCita={abrirCita}
          />
        ) : profesionalesVisibles.length === 0 ? (
          <Box py={6} textAlign="center">
            <Typography color="textSecondary">
              No hay profesionales activos para mostrar.
            </Typography>
          </Box>
        ) : (
          <CalendarioCitas
            fecha={new Date(`${fecha}T00:00:00`)}
            citas={citasVisibles}
            profesionales={profesionalesVisibles}
            onSeleccionarCita={abrirCita}
            onSeleccionarHueco={abrirEnHueco}
          />
        )}

        {!isPending && !error && vista === "calendario" ? (
          <LeyendaCalendario />
        ) : null}
        </CardContent>
      </BlankCard>

      <CitaFormDialog
        abierto={formAbierto}
        cita={citaEditando}
        preseleccion={preseleccion}
        onCerrar={() => setFormAbierto(false)}
      />
    </PageContainer>
  );
}
