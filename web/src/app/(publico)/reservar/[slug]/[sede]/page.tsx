"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { IconArrowsExchange, IconClock, IconMapPin, IconPhone } from "@tabler/icons-react";

import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { toApiError } from "@/lib/api/client";
import { esHostDeTienda } from "@/lib/tienda/host";
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
import { useNegocioPublico, useTienda } from "@/features/publico/hooks/useTienda";
import type { ReservaConfirmada } from "@/features/publico/types";

/**
 * Una sede de la tienda: `/reservar/{negocio}/{sede}` (Story 6.2), y por
 * subdominio `{negocio}.tivuapp.store/{sede}`. Antes era
 * `/reservar/{negocio}/sucursal/{id}`, que ahora redirige aquí.
 */
export default function SedePage({
  params,
}: {
  params: Promise<{ slug: string; sede: string }>;
}) {
  const { slug, sede } = use(params);

  const { data, isPending, isError, error } = useTienda(slug, sede);
  // El id sigue sirviendo para los huecos y la reserva (el contrato acepta
  // id o slug en `{sede}`); el de la sede ya cargada.
  const idLocal = data?.local.id ?? NaN;

  /*
    La sede llega preseleccionada por el enlace, pero se puede cambiar
    (Story 6.2) si el negocio tiene más de una. Cada sede tiene su catálogo y
    sus profesionales, así que cambiar vacía lo elegido: se avisa antes.
  */
  const router = useRouter();
  const { data: tienda } = useNegocioPublico(slug);
  const variasSedes = (tienda?.locales.length ?? 0) > 1;
  const [avisoCambio, setAvisoCambio] = useState(false);
  const elegirSede = () => {
    // En su subdominio la portada es «/»; por ruta, `/reservar/{negocio}`.
    const enSubdominio = typeof window !== "undefined" && esHostDeTienda(window.location.host);
    router.push(enSubdominio ? "/" : `/reservar/${slug}`);
  };
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
          <>
          {variasSedes ? (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              justifyContent="space-between"
              alignItems={{ sm: "center" }}
              mb={3}
            >
              <Typography variant="body2" color="textSecondary">
                Estás reservando en <strong>{local.nombre}</strong>
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<IconArrowsExchange size={18} />}
                onClick={() => (carrito.unidades ? setAvisoCambio(true) : elegirSede())}
              >
                Cambiar de sede
              </Button>
            </Stack>
          ) : null}
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
          </>
        )}
      </Container>

      <ConfirmDialog
        abierto={avisoCambio}
        titulo="¿Cambiar de sede?"
        mensaje="Lo que llevas elegido se quitará: cada sede tiene sus propios servicios y profesionales."
        textoConfirmar="Cambiar de sede"
        // No borra nada del negocio: solo vacía lo elegido. No va en rojo.
        color="primary"
        onConfirmar={() => {
          setAvisoCambio(false);
          carrito.vaciar();
          elegirSede();
        }}
        onCancelar={() => setAvisoCambio(false)}
      />

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
