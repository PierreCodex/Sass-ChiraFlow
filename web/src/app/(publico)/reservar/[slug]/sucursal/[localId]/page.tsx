"use client";
import { use, useState } from "react";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { IconClock, IconMapPin, IconPhone } from "@tabler/icons-react";

import { toApiError } from "@/lib/api/client";
import TiendaShell from "@/features/publico/components/TiendaShell";
import PortadaLocal from "@/features/publico/components/PortadaLocal";
import MapaLocal from "@/features/publico/components/MapaLocal";
import ResenasLocal from "@/features/publico/components/ResenasLocal";
import ProfesionalesLocal from "@/features/publico/components/ProfesionalesLocal";
import CatalogoServicios from "@/features/publico/components/CatalogoServicios";
import BarraCarrito from "@/features/publico/components/BarraCarrito";
import WizardReserva from "@/features/publico/components/WizardReserva";
import ComprobanteReserva from "@/features/publico/components/ComprobanteReserva";
import { useCarrito } from "@/features/publico/hooks/useCarrito";
import { useTienda } from "@/features/publico/hooks/useTienda";
import type { ReservaConfirmada } from "@/features/publico/types";

export default function SucursalPage({
  params,
}: {
  params: Promise<{ slug: string; localId: string }>;
}) {
  const { slug, localId } = use(params);
  const idLocal = Number(localId);

  const { data, isPending, isError, error } = useTienda(slug, idLocal);
  const carrito = useCarrito();

  const [wizardAbierto, setWizardAbierto] = useState(false);
  const [confirmada, setConfirmada] = useState<ReservaConfirmada | null>(null);

  if (isError) {
    return (
      <Container maxWidth="sm" sx={{ py: 10 }}>
        <Alert severity="error">{toApiError(error).message}</Alert>
      </Container>
    );
  }

  if (isPending || !data) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rounded" height={380} />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Skeleton variant="rounded" height={520} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  const { negocio, local, categorias, profesionales, resenas, ultimas_resenas } = data;

  return (
    <TiendaShell
      nombre={negocio.nombre}
      subtitulo={local.nombre}
      color={local.color}
      logoUrl={local.logo_url}
      // La portada ya presenta el negocio: la barra superior sobra aquí.
      compacto
      portada={<PortadaLocal negocio={negocio} local={local} resenas={resenas} />}
    >
      <Container maxWidth="lg" sx={{ py: 4, pb: carrito.unidades ? 14 : 4 }}>
        {confirmada ? (
          <Box maxWidth={560} mx="auto">
            <ComprobanteReserva
              reserva={confirmada}
              onVolver={() => {
                setConfirmada(null);
                carrito.vaciar();
              }}
            />
          </Box>
        ) : (
          <Grid container spacing={3} alignItems="flex-start">
            {/* Barra lateral: quién te atiende y dónde estamos */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={3} sx={{ position: { md: "sticky" }, top: { md: 24 } }}>
                <ProfesionalesLocal profesionales={profesionales} />
                <MapaLocal local={local} />
              </Stack>
            </Grid>

            {/* Catálogo */}
            <Grid size={{ xs: 12, md: 8 }} id="catalogo">
              {categorias.length === 0 ? (
                <Alert severity="info">
                  Esta sede todavía no tiene servicios publicados.
                </Alert>
              ) : profesionales.length === 0 ? (
                <Alert severity="warning">
                  Esta sede no tiene profesionales habilitados para reservas en
                  línea. Contáctanos por teléfono.
                </Alert>
              ) : (
                <CatalogoServicios
                  categorias={categorias}
                  cantidadDe={carrito.cantidadDe}
                  onAgregar={carrito.agregar}
                  onCambiar={carrito.cambiarCantidad}
                />
              )}

              <Box mt={3}>
                <ResenasLocal resumen={resenas} resenas={ultimas_resenas} />
              </Box>
            </Grid>
          </Grid>
        )}
      </Container>

      {!confirmada ? (
        <BarraCarrito
          unidades={carrito.unidades}
          monto={carrito.monto}
          duracion={carrito.duracion}
          onReservar={() => setWizardAbierto(true)}
        />
      ) : null}

      <WizardReserva
        abierto={wizardAbierto}
        slug={slug}
        localId={idLocal}
        lineas={carrito.lineas}
        profesionales={profesionales}
        onCerrar={() => setWizardAbierto(false)}
        onConfirmada={(reserva) => {
          setWizardAbierto(false);
          setConfirmada(reserva);
        }}
      />
    </TiendaShell>
  );
}
