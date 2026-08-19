"use client";
import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Link from "next/link";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { IconPlus } from "@tabler/icons-react";

import PageContainer from "@/components/container/PageContainer";
import Breadcrumb from "@/layout/shared/breadcrumb/Breadcrumb";
import BlankCard from "@/components/shared/BlankCard";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import LocalesGrid from "@/features/locales/components/LocalesGrid";
import LocalFormDialog from "@/features/locales/components/LocalFormDialog";
import ProfesionalesPorLocal from "@/features/locales/components/ProfesionalesPorLocal";
import ServiciosDelNegocio from "@/features/locales/components/ServiciosDelNegocio";
import GruposTable from "@/features/locales/components/GruposTable";
import GrupoFormDialog from "@/features/locales/components/GrupoFormDialog";
import { useEliminarLocal } from "@/features/locales/hooks/useLocales";
import { useLimiteLocales } from "@/features/locales/hooks/useLimiteLocales";
import { useEliminarGrupo } from "@/features/locales/hooks/useRecursos";
import type { Grupo, Local } from "@/features/locales/types";
import { toApiError } from "@/lib/api/client";

const BCrumb = [{ to: "/", title: "Inicio" }, { title: "Locales" }];

/** Las mismas cuatro pestañas de `admin/recursos/index.blade.php`. */
const PESTANAS = [
  "Locales",
  "Profesionales por local",
  "Servicios",
  "Grupos",
] as const;

export default function LocalesPage() {
  const [pestana, setPestana] = useState(0);
  const [formAbierto, setFormAbierto] = useState(false);
  const [localEditando, setLocalEditando] = useState<Local | null>(null);
  const [localAEliminar, setLocalAEliminar] = useState<Local | null>(null);

  const [grupoFormAbierto, setGrupoFormAbierto] = useState(false);
  const [grupoEditando, setGrupoEditando] = useState<Grupo | null>(null);
  const [grupoAEliminar, setGrupoAEliminar] = useState<Grupo | null>(null);

  const eliminar = useEliminarLocal();
  const eliminarGrupo = useEliminarGrupo();
  const { planActual, maxSucursales, alcanzado, cargando: cargandoLimite } =
    useLimiteLocales();

  const abrirNuevoGrupo = () => {
    setGrupoEditando(null);
    setGrupoFormAbierto(true);
  };

  const abrirEdicionGrupo = (grupo: Grupo) => {
    setGrupoEditando(grupo);
    setGrupoFormAbierto(true);
  };

  const confirmarEliminacionGrupo = () => {
    if (!grupoAEliminar) return;
    eliminarGrupo.mutate(grupoAEliminar.id, {
      onSuccess: () => setGrupoAEliminar(null),
    });
  };

  const abrirNuevo = () => {
    // Defensa extra además del botón deshabilitado: si de algún modo se
    // llega a llamar igual (ej. cambios futuros), no deja abrir el form.
    if (alcanzado) return;
    setLocalEditando(null);
    setFormAbierto(true);
  };

  const abrirEdicion = (local: Local) => {
    setLocalEditando(local);
    setFormAbierto(true);
  };

  const confirmarEliminacion = () => {
    if (!localAEliminar) return;
    eliminar.mutate(localAEliminar.id, {
      onSuccess: () => setLocalAEliminar(null),
    });
  };

  return (
    <PageContainer title="Locales" description="Sedes del negocio">
      <Breadcrumb title="Locales" items={BCrumb} />

      <BlankCard>
        <Box px={3} pt={1}>
          <Tabs
            value={pestana}
            onChange={(_, valor) => setPestana(valor)}
            variant="scrollable"
            scrollButtons="auto"
            // La plantilla capitaliza cada palabra ("Profesionales Por Local"),
            // que en español es incorrecto.
            sx={{ "& .MuiTab-root": { textTransform: "none" } }}
          >
            {PESTANAS.map((titulo) => (
              <Tab key={titulo} label={titulo} />
            ))}
          </Tabs>
        </Box>

        <Divider />

        <CardContent sx={{ p: 3 }}>
          {pestana === 0 ? (
            <>
              {!cargandoLimite && alcanzado ? (
                <Alert
                  severity="warning"
                  variant="outlined"
                  sx={{ mb: 3, alignItems: "center", "& .MuiAlert-message": { flexGrow: 1 } }}
                  action={
                    <Button
                      component={Link}
                      href="/mi-plan"
                      color="warning"
                      variant="contained"
                      size="small"
                      disableElevation
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      Ver planes
                    </Button>
                  }
                >
                  Tu plan actual ({planActual?.nombre}) permite {maxSucursales}{" "}
                  local{maxSucursales === 1 ? "" : "es"}. Para agregar más locales,
                  actualiza tu plan.
                </Alert>
              ) : null}

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Typography variant="body2" color="textSecondary">
                  Sedes donde atiendes. El local principal se edita desde
                  Configuración.
                </Typography>
                <Tooltip
                  title={alcanzado ? "Llegaste al límite de locales de tu plan" : ""}
                >
                  <span>
                    <Button
                      variant="contained"
                      startIcon={<IconPlus size={18} />}
                      onClick={abrirNuevo}
                      disabled={alcanzado}
                      sx={{ whiteSpace: "nowrap" }}
                    >
                      Agregar local
                    </Button>
                  </span>
                </Tooltip>
              </Stack>

              <LocalesGrid
                onEditar={abrirEdicion}
                onEliminar={setLocalAEliminar}
              />
            </>
          ) : pestana === 1 ? (
            <ProfesionalesPorLocal />
          ) : pestana === 2 ? (
            <ServiciosDelNegocio />
          ) : (
            <>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
                spacing={2}
              >
                <Typography variant="body2" color="textSecondary">
                  Agrupa locales, profesionales y servicios que van juntos.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<IconPlus size={18} />}
                  onClick={abrirNuevoGrupo}
                  sx={{ whiteSpace: "nowrap" }}
                >
                  Nuevo grupo
                </Button>
              </Stack>

              <GruposTable
                onEditar={abrirEdicionGrupo}
                onEliminar={setGrupoAEliminar}
              />
            </>
          )}
        </CardContent>
      </BlankCard>

      <LocalFormDialog
        abierto={formAbierto}
        local={localEditando}
        onCerrar={() => setFormAbierto(false)}
      />

      <ConfirmDialog
        abierto={!!localAEliminar}
        titulo="Eliminar local"
        mensaje={
          <>
            ¿Seguro que quieres eliminar <strong>{localAEliminar?.nombre}</strong>?
            Esta acción no se puede deshacer.
          </>
        }
        textoConfirmar="Eliminar"
        cargando={eliminar.isPending}
        error={eliminar.isError ? toApiError(eliminar.error).message : null}
        onConfirmar={confirmarEliminacion}
        onCancelar={() => setLocalAEliminar(null)}
      />

      <GrupoFormDialog
        abierto={grupoFormAbierto}
        grupo={grupoEditando}
        onCerrar={() => setGrupoFormAbierto(false)}
      />

      <ConfirmDialog
        abierto={!!grupoAEliminar}
        titulo="Eliminar grupo"
        mensaje={
          <>
            ¿Seguro que quieres eliminar <strong>{grupoAEliminar?.nombre}</strong>?
            Los locales, profesionales y servicios que agrupa no se borran.
          </>
        }
        textoConfirmar="Eliminar"
        cargando={eliminarGrupo.isPending}
        error={
          eliminarGrupo.isError ? toApiError(eliminarGrupo.error).message : null
        }
        onConfirmar={confirmarEliminacionGrupo}
        onCancelar={() => setGrupoAEliminar(null)}
      />
    </PageContainer>
  );
}
