"use client";
import { useState } from "react";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { IconBrandWhatsapp, IconPlus, IconSparkles } from "@tabler/icons-react";

import PageContainer from "@/components/container/PageContainer";
import Breadcrumb from "@/layout/shared/breadcrumb/Breadcrumb";
import DashboardCard from "@/components/shared/DashboardCard";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import PlantillasTable from "@/features/whatsapp/components/PlantillasTable";
import PlantillaFormDialog from "@/features/whatsapp/components/PlantillaFormDialog";
import PredisenadasDialog from "@/features/whatsapp/components/PredisenadasDialog";
import {
  useEliminarPlantilla,
  useTodasLasPlantillas,
} from "@/features/whatsapp/hooks/usePlantillas";
import type {
  PlantillaPredisenada,
  PlantillaWhatsapp,
} from "@/features/whatsapp/types";
import { toApiError } from "@/lib/api/client";

const BCrumb = [{ to: "/", title: "Inicio" }, { title: "WhatsApp" }];

export default function WhatsappPage() {
  const [formAbierto, setFormAbierto] = useState(false);
  const [editando, setEditando] = useState<PlantillaWhatsapp | null>(null);
  const [inicial, setInicial] = useState<Partial<PlantillaWhatsapp> | null>(null);
  const [galeriaAbierta, setGaleriaAbierta] = useState(false);
  const [aEliminar, setAEliminar] = useState<PlantillaWhatsapp | null>(null);

  const { data: todas } = useTodasLasPlantillas();
  const eliminar = useEliminarPlantilla();

  const abrirNueva = () => {
    setEditando(null);
    setInicial(null);
    setFormAbierto(true);
  };

  const abrirEdicion = (plantilla: PlantillaWhatsapp) => {
    setEditando(plantilla);
    setInicial(null);
    setFormAbierto(true);
  };

  const usarPredisenada = (plantilla: PlantillaPredisenada) => {
    setGaleriaAbierta(false);
    setEditando(null);
    setInicial({
      nombre: plantilla.nombre,
      evento: plantilla.key,
      contenido: plantilla.contenido,
    });
    setFormAbierto(true);
  };

  const confirmarEliminacion = () => {
    if (!aEliminar) return;
    eliminar.mutate(aEliminar.id, { onSuccess: () => setAEliminar(null) });
  };

  return (
    <PageContainer title="WhatsApp" description="Plantillas de mensajes">
      <Breadcrumb title="Plantillas de WhatsApp" items={BCrumb} />

      <Stack spacing={3}>
        {/* Presentación del módulo, como el hero de la app actual. */}
        <Card elevation={9}>
          <CardContent sx={{ p: 4 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={3}
              alignItems={{ xs: "flex-start", md: "center" }}
              justifyContent="space-between"
            >
              <Stack spacing={1.5} maxWidth={620}>
                <Stack direction="row" spacing={1} alignItems="center" color="success.main">
                  <IconBrandWhatsapp size={22} />
                  <Typography variant="subtitle2" fontWeight={600} color="inherit">
                    Mensajes personalizados por WhatsApp
                  </Typography>
                </Stack>
                <Typography variant="h4" fontWeight={700}>
                  Escribe una vez, envía siempre
                </Typography>
                <Typography color="textSecondary">
                  Define un mensaje por evento —confirmación, recordatorio,
                  cancelación— y el sistema lo rellena con los datos de cada
                  cita. También puedes enviarlos a mano desde la reserva.
                </Typography>
              </Stack>

              <Stack direction={{ xs: "row", md: "column" }} spacing={1.5} flexShrink={0}>
                <Button
                  variant="contained"
                  startIcon={<IconSparkles size={18} />}
                  onClick={() => setGaleriaAbierta(true)}
                  sx={{ whiteSpace: "nowrap" }}
                >
                  Ver prediseñadas
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<IconPlus size={18} />}
                  onClick={abrirNueva}
                  sx={{ whiteSpace: "nowrap" }}
                >
                  Nueva plantilla
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <DashboardCard
          title="Mis plantillas"
          subtitle="Una plantilla activa por evento"
        >
          <PlantillasTable onEditar={abrirEdicion} onEliminar={setAEliminar} />
        </DashboardCard>
      </Stack>

      <PredisenadasDialog
        abierto={galeriaAbierta}
        eventosUsados={(todas ?? []).map((plantilla) => plantilla.evento)}
        onElegir={usarPredisenada}
        onCerrar={() => setGaleriaAbierta(false)}
      />

      <PlantillaFormDialog
        abierto={formAbierto}
        plantilla={editando}
        inicial={inicial}
        existentes={todas ?? []}
        onCerrar={() => setFormAbierto(false)}
      />

      <ConfirmDialog
        abierto={!!aEliminar}
        titulo="Eliminar plantilla"
        mensaje={
          <>
            ¿Seguro que quieres eliminar <strong>{aEliminar?.nombre}</strong>?
            Los mensajes de ese evento pasarán a usar el texto por defecto del
            sistema.
          </>
        }
        textoConfirmar="Eliminar"
        cargando={eliminar.isPending}
        error={eliminar.isError ? toApiError(eliminar.error).message : null}
        onConfirmar={confirmarEliminacion}
        onCancelar={() => setAEliminar(null)}
      />
    </PageContainer>
  );
}
